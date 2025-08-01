// frontend/server.js
const express = require('express');
const path = require('path');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { GoogleAuth } = require('google-auth-library');

const app = express();
const auth = new GoogleAuth();

// The port the server will listen on. Cloud Run provides this via the PORT env var.
const port = process.env.PORT || 8080;

// The backend URL to proxy to. This is provided as a runtime environment variable.
const backendUrl = process.env.BACKEND_URL;

if (!backendUrl) {
  console.error('FATAL: BACKEND_URL environment variable is not set.');
  process.exit(1);
}

// Proxy API requests to the backend service.
// All requests made from the frontend to '/api' will be forwarded to the backend.
app.use('/api', createProxyMiddleware({
  target: backendUrl,
  changeOrigin: true,

  /**
   * onProxyReq is a hook from http-proxy-middleware that allows us to modify
   * the request just before it's sent to the target backend service.
   * This is the correct place to add authentication headers for service-to-service calls.
   */
  onProxyReq: async (proxyReq, req, res) => {
    // This service-to-service authentication logic is only needed when deployed on Cloud Run.
    // In local development, this would fail as there's no metadata server to get credentials from.
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    try {
      // When running on Cloud Run, the frontend service has its own identity (a service account).
      // To call another IAP-protected service (the backend), the frontend must authenticate itself.
      // We do this by generating an OIDC Identity Token, with the 'audience' set to the URL
      // of the backend service we want to call.
      console.log(`Requesting identity token for audience: ${backendUrl}`);
      const headers = await auth.getRequestHeaders(backendUrl);
      // The getRequestHeaders method from the Google Auth Library automatically uses the
      // provided URL (`backendUrl`) as the 'audience' for the OIDC identity token.
      // This is the required mechanism for authenticating service-to-service calls
      // to an IAP-protected Cloud Run service.
      

      // Add the generated token to the 'Authorization' header. The backend's IAP will
      // intercept and validate this token to allow the request from our frontend service.
      proxyReq.setHeader('Authorization', headers.Authorization);

      // Forward the end-user's identity token (if present) to the backend.
      const iapJwt = req.headers['x-goog-iap-jwt-assertion'];
      if (iapJwt) {
        proxyReq.setHeader('X-Goog-IAP-JWT-Assertion', iapJwt);
      }
    } catch (error) {
      console.error('Failed to add authentication token to proxy request:', error);
      // Abort the proxied request if we can't get an auth token.
      // This is the correct way to handle an error in this hook, as the response
      // stream is not yet available to write to.
      proxyReq.abort();
    }
  },

  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).send('Proxy encountered an error.');
  },
}));

// Serve the static files (HTML, CSS, JS) from the Vue app's 'dist' directory.
const staticFilesPath = path.join(__dirname, 'dist');
app.use(express.static(staticFilesPath));

// For any other request, serve the index.html file.
// This is crucial for single-page applications (SPAs) to handle client-side routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(staticFilesPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Frontend Express server listening on port ${port}`);
  console.log(`Proxying API requests from /api to ${backendUrl}`);
});