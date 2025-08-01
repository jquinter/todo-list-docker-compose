// backend/src/routes/users.js
const express = require('express');
const router =express.Router();
const { OAuth2Client } = require('google-auth-library');
const db = require('../db');

const iapAudience = process.env.IAP_AUDIENCE;
const oAuth2Client = new OAuth2Client();

// A simple cache for IAP public keys to avoid fetching them on every request.
let cachedKeys = {
  keys: null,
  expiry: 0,
};
const CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
const IAP_KEYS_URL = 'https://www.gstatic.com/iap/verify/public_key';

/**
 * Fetches and caches the public keys used by IAP on a Load Balancer.
 * @returns {Promise<Object<string, string>>} A map of key IDs to PEM-encoded public keys.
 */
async function getLoadBalancerIapKeys() {
  const now = Date.now();
  if (cachedKeys.keys && now < cachedKeys.expiry) {
    return cachedKeys.keys;
  }

  console.log(`Fetching IAP public keys from ${IAP_KEYS_URL}`);
  const response = await fetch(IAP_KEYS_URL);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to fetch IAP public keys: ${response.status} ${text}`);
  }
  const keys = await response.json();
  
  cachedKeys = {
    keys: keys,
    expiry: now + CACHE_DURATION_MS,
  };
  return keys;
}

/**
 * Verifies the IAP-provided JWT.
 * @param {string} iapJwt - The JWT from the x-goog-iap-jwt-assertion header.
 * @returns {Promise<object>} The JWT payload containing user's email.
 */
async function verifyIapToken(iapJwt) {
  const keys = await getLoadBalancerIapKeys();
  const ticket = await oAuth2Client.verifySignedJwtWithCertsAsync(
    iapJwt, keys, iapAudience, ['https://cloud.google.com/iap']
  );
  return ticket.getPayload();
}

/**
 * Middleware to identify and attach the user to the request object.
 * In production, it verifies the IAP JWT.
 * For local development, it uses the 'x-user-email' header.
 */
const userMiddleware = async (req, res, next) => {
  let userEmail;

  try {
    // In a real IAP environment, the JWT is in this header.
    const iapJwt = req.headers['x-goog-iap-jwt-assertion'];
    if (iapJwt) {
      // In production, verify the IAP JWT to get the end-user's identity.
      // This is the only secure way to identify the user.
      console.log('Found IAP JWT, attempting to verify...');
      const payload = await verifyIapToken(iapJwt);
      userEmail = payload.email;
      console.log(`IAP user identified: ${userEmail}`);
    } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      // For local development and testing, fall back to the simulated header.
      userEmail = req.headers['x-user-email'];
      if (!userEmail) {
        return res.status(401).json({ error: 'User email header (x-user-email) is missing for non-IAP request.' });
      }
    } else {
      // In production, if the IAP header is missing, deny access.
      return res.status(401).json({ error: 'Unauthorized: Missing IAP JWT.' });
    }
  } catch (error) {
    console.error('Failed to verify identity token:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Invalid identity token.' });
  }

  try {
    // Find or create the user in the database
    let userResult = await db.query('SELECT * FROM users WHERE email = $1', [userEmail]);
    let user;

    if (userResult.rows.length === 0) {
      // User does not exist, create a new one.
      // A simple username is generated from the email.
      const username = userEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      const newUserResult = await db.query(
        'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING *',
        [username, userEmail]
      );
      user = newUserResult.rows[0];
    } else {
      user = userResult.rows[0];
    }

    // Attach the full user object to the request for other routes to use
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    console.error('Error in user middleware:', err);
    res.status(500).json({ error: 'Internal server error while processing user identity.' });
  }
};

// GET /api/user/me
// Retrieves the profile of the currently authenticated user.
router.get('/me', userMiddleware, (req, res) => {
  // The userMiddleware has already fetched/created the user and attached it to req.user.
  // We just need to send it back to the client.
  res.json(req.user);
});

// Export both the router and the middleware
module.exports = { router, userMiddleware };