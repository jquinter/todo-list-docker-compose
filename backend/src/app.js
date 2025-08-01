// backend/src/app.js
const express = require('express');
const cors = require('cors');
const { router: todoRoutes } = require('./routes/todos'); // Import router from todos
const { router: userRoutes } = require('./routes/users'); // Import router from users
const db = require('./db'); // Import the database connection module

const app = express();
const port = process.env.PORT || 80;

// Middleware setup
// Enable CORS for all origins. In a production environment, you would restrict this
// to specific origins (e.g., your frontend's domain).
app.use(cors());
// Parse incoming JSON requests. This allows you to access request bodies as JSON.
app.use(express.json());

// Routes setup
// Mount all routes under the /api prefix for better namespacing.
app.use('/api/user', userRoutes);
app.use('/api/todos', todoRoutes);

// Basic health check endpoint
// This endpoint can be used by Docker Compose's healthcheck or external monitoring
// to verify that the backend application is running and responsive.
app.get('/api/health', async (req, res) => {
  try {
    // A true health check should verify dependencies. A lightweight query
    // to the database confirms connectivity.
    await db.query('SELECT 1');
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (error) {
    // If the database query fails, the service is not healthy.
    console.error('Health check failed:', error);
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Function to connect to the database and start the server
async function startServer() {
  try {
    // Attempt to connect to the database. The server will not start if this fails.
    await db.connectDb();
    // Start the Express server and listen on the specified port
    app.listen(port, () => {
      console.log(`Backend server listening at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start backend server:', error.message);
    // Exit the process if database connection fails, indicating a critical startup error.
    process.exit(1);
  }
}

// Call the function to start the server
startServer();

// Export the app for testing purposes (e.g., Supertest)
module.exports = app;
