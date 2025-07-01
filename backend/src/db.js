// backend/src/db.js
const { Pool } = require('pg');

// Create a new PostgreSQL connection pool.
// Connection details are pulled from environment variables, which are set
// by Docker Compose when running in a container.
const pool = new Pool({
  user: process.env.DB_USER || 'user',         // Default user if not set
  host: process.env.DB_HOST || 'localhost',    // 'database' when running in Docker Compose network
  database: process.env.DB_NAME || 'todo_db',  // Default database name
  password: process.env.DB_PASSWORD || 'password', // Default password
  port: process.env.DB_PORT || 5432,           // Default PostgreSQL port
});

// Event listener for errors on idle clients in the pool.
// This helps catch issues like database disconnections.
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit the process on a critical database error
});

// Function to test the database connection.
// It acquires a client from the pool and immediately releases it,
// verifying that a connection can be established.
async function connectDb() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database successfully!');
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err; // Re-throw the error to be caught by the calling function (app.js)
  }
}

// Export functions for querying the database and connecting.
module.exports = {
  // A wrapper around pool.query to execute SQL queries.
  query: (text, params) => {
    console.log('Executing query:', text, params || ''); // Log queries for debugging
    return pool.query(text, params);
  },
  connectDb, // Export the connection test function
  // Expose the pool itself for more advanced operations or direct client access if needed
  pool: pool
};
