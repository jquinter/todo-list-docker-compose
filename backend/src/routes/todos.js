// backend/src/routes/todos.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database module

// GET /todos
// Retrieves all todo items from the database, ordered by ID.
router.get('/', async (req, res) => {
  try {
    const result = await db.query("SELECT id, CONCAT('[NUBE] ', title) as title, completed FROM todos ORDER BY id ASC");
    res.json(result.rows); // Send the rows as a JSON array
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /todos/:id
// Retrieves a single todo item by its ID.
router.get('/:id', async (req, res) => {
  const { id } = req.params; // Extract ID from URL parameters
  try {
    const result = await db.query('SELECT * FROM todos WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      // If no todo found with the given ID, return 404 Not Found.
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(result.rows[0]); // Send the first (and only) row as JSON
  } catch (err) {
    console.error(`Error fetching todo with ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /todos
// Creates a new todo item
router.post('/', async (req, res) => {
  const { title, completed } = req.body; // Extract title and completed status from request body
  if (!title || typeof title !== 'string' || title.trim() === '') {
    // Basic validation: title is required and must be a non-empty string.
    return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
  }

  try {
    // Insert the new todo into the database.
    // 'RETURNING *' fetches the newly created row, including its generated ID.
    const result = await db.query(
      'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
      [title.trim(), completed === true] // Ensure title is trimmed and completed is a boolean
    );
    res.status(201).json(result.rows[0]); // Send the created todo with 201 Created status
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /todos/:id
// Updates an existing todo item by its ID.
// Allows updating either title, completed status, or both.
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  // Validate that at least one field is provided for update.
  if (title === undefined && completed === undefined) {
    return res.status(400).json({ error: 'At least one field (title or completed) must be provided for update.' });
  }

  let updateQuery = 'UPDATE todos SET ';
  const updateParams = [];
  let paramIndex = 1;

  // Dynamically build the UPDATE query based on provided fields.
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string if provided.' });
    }
    updateQuery += `title = $${paramIndex}, `;
    updateParams.push(title.trim());
    paramIndex++;
  }
  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean value.' });
    }
    updateQuery += `completed = $${paramIndex}, `;
    updateParams.push(completed);
    paramIndex++;
  }

  // Remove the trailing comma and space from the query string.
  updateQuery = updateQuery.slice(0, -2);
  // Add the WHERE clause to target the specific todo by ID.
  updateQuery += ` WHERE id = $${paramIndex} RETURNING *`;
  updateParams.push(id); // Add the ID to the parameters

  try {
    const result = await db.query(updateQuery, updateParams);
    if (result.rows.length === 0) {
      // If no todo found with the given ID, return 404 Not Found.
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(result.rows[0]); // Send the updated todo
  } catch (err) {
    console.error(`Error updating todo with ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /todos/:id
// Deletes a todo item by its ID.
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Delete the todo from the database.
    // 'RETURNING *' is used here to check if a row was actually deleted.
    const result = await db.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      // If no todo found with the given ID, return 404 Not Found.
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send(); // Send 204 No Content status on successful deletion
  } catch (err) {
    console.error(`Error deleting todo with ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: Endpoint to clear all data - ONLY available in test environment
if (process.env.NODE_ENV === 'test') {
  router.post('/clear-data', async (req, res) => {
    console.log('Clearing test database data...');
    try {
      // TRUNCATE all tables and restart identity (reset serial IDs)
      // CASCADE ensures related data (if any foreign keys exist) is also deleted.
      await db.query('TRUNCATE TABLE todos RESTART IDENTITY CASCADE;');
      console.log('Test database cleared successfully.');
      res.status(200).json({ message: 'Test database cleared' });
    } catch (err) {
      console.error('Error clearing test database:', err);
      res.status(500).json({ error: 'Failed to clear test database' });
    }
  });
} else {
  console.log('Test data clearing endpoint is disabled in this environment.');
}

module.exports = router;
