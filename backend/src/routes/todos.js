// backend/src/routes/todos.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const { userMiddleware } = require('./users'); // Import the user middleware

// Apply the user middleware to all routes in this file.
// This ensures that req.user is available in every handler.
router.use(userMiddleware);

// GET /api/todos
// Retrieves all todo items for the authenticated user.
router.get('/', async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await db.query(
      "SELECT id, title, completed, created_at, completed_at FROM todos WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching todos:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/todos/:id
// Retrieves a single todo item by its ID, ensuring it belongs to the authenticated user.
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const result = await db.query('SELECT * FROM todos WHERE id = $1 AND user_id = $2', [id, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching todo with ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/todos
// Creates a new todo item for the authenticated user.
router.post('/', async (req, res) => {
  const { title } = req.body; // 'completed' defaults to false in the DB.
  const userId = req.user.id;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
  }

  try {
    const result = await db.query(
      'INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING *',
      [title.trim(), userId]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating todo:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/todos/:id
// Updates an existing todo item, ensuring it belongs to the authenticated user.
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { title, completed } = req.body;

  if (title === undefined && completed === undefined) {
    return res.status(400).json({ error: 'At least one field (title or completed) must be provided for update.' });
  }

  let updateQuery = 'UPDATE todos SET ';
  const updateParams = [];
  let paramIndex = 1;

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
    // Set completed_at timestamp based on the 'completed' status
    updateQuery += `completed_at = $${paramIndex}, `;
    updateParams.push(completed ? new Date() : null);
    paramIndex++;
  }

  updateQuery = updateQuery.slice(0, -2);
  updateQuery += ` WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`;
  updateParams.push(id, userId);

  try {
    const result = await db.query(updateQuery, updateParams);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error updating todo with ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/todos/:id
// Deletes a todo item, ensuring it belongs to the authenticated user.
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  try {
    const result = await db.query('DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *', [id, userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(`Error deleting todo with ID ${id}:`, err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// NEW: Endpoint to clear all data - ONLY available in test environment
router.post('/clear-data-for-testing', async (req, res) => {
  if (process.env.NODE_ENV !== 'test') {
    return res.status(403).json({ error: 'This endpoint is only available in the test environment.' });
  }
  try {
    await db.query('TRUNCATE TABLE users, todos RESTART IDENTITY CASCADE;');
    res.status(200).json({ message: 'Test database cleared' });
  } catch (err) {
    console.error('Error clearing test database:', err);
    res.status(500).json({ error: 'Failed to clear test database' });
  }
});

module.exports = { router };
