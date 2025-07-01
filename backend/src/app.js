// backend/src/app.js
const express = require('express');
const cors = require('cors');
const todoRoutes = require('./routes/todos');
const db = require('./db'); // Import the database connection module

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
// Enable CORS for all origins. In a production environment, you would restrict this
// to specific origins (e.g., your frontend's domain).
app.use(cors());
// Parse incoming JSON requests. This allows you to access request bodies as JSON.
app.use(express.json());

// Routes setup
// Mount the todo routes under the '/todos' path.
// All requests to /todos, /todos/:id, etc., will be handled by todoRoutes.
app.use('/todos', todoRoutes);

// Basic health check endpoint
// This endpoint can be used by Docker Compose's healthcheck or external monitoring
// to verify that the backend application is running and responsive.
app.get('/health', (req, res) => {
  res.status(200).send('Backend is healthy');
});

// Function to connect to the database and start the server
async function startServer() {
  try {
    // Attempt to connect to the database. The server will not start if this fails.
    await db.connectDb();
    // Start the Express server and listen on the specified port.
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
