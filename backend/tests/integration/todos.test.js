// backend/tests/integration/todos.test.js
const request = require('supertest');
const app = require('../../src/app'); // Import the Express app
const db = require('../../src/db'); // Import the database module

// Mock the database module for testing to prevent actual database interactions
// This ensures tests are fast, isolated, and don't modify your development database.
// For true integration tests that hit a real DB, you'd set up a separate test database
// and clear it before each test.
jest.mock('../../src/db', () => ({
  query: jest.fn(), // Mock the query function
  connectDb: jest.fn().mockResolvedValue(true), // Mock successful connection
  pool: { end: jest.fn() } // Mock pool.end for cleanup
}));

describe('Todo API Integration Tests', () => {
  // Before each test, clear all mock calls to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // After all tests, close the database pool mock to prevent open handles warning
  afterAll(async () => {
    await db.pool.end();
  });

  describe('GET /todos', () => {
    it('should return all todos', async () => {
      // Mock the database query to return a predefined set of todos
      db.query.mockResolvedValueOnce({
        rows: [
          { id: 1, title: 'Test Todo 1', completed: false },
          { id: 2, title: 'Test Todo 2', completed: true }
        ]
      });

      const res = await request(app).get('/todos');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([
        { id: 1, title: 'Test Todo 1', completed: false },
        { id: 2, title: 'Test Todo 2', completed: true }
      ]);
      // Verify that the correct SQL query was executed
      expect(db.query).toHaveBeenCalledWith("SELECT id, CONCAT('[NUBE] ', title) as title, completed FROM todos ORDER BY id ASC");
    });

    it('should return 500 on database error', async () => {
      // Mock the database query to throw an error
      db.query.mockRejectedValueOnce(new Error('Database connection failed'));

      const res = await request(app).get('/todos');

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /todos/:id', () => {
    it('should return a single todo by ID', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, title: 'Single Todo', completed: false }]
      });

      const res = await request(app).get('/todos/1');

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ id: 1, title: 'Single Todo', completed: false });
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM todos WHERE id = $1', ['1']);
    });

    it('should return 404 if todo not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] }); // No rows found

      const res = await request(app).get('/todos/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Todo not found' });
    });
  });

  describe('POST /todos', () => {
    it('should create a new todo', async () => {
      const newTodo = { title: 'New Test Todo', completed: false };
      db.query.mockResolvedValueOnce({
        rows: [{ id: 3, ...newTodo }] // Mock the returned created todo
      });

      const res = await request(app)
        .post('/todos')
        .send(newTodo);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual({ id: 3, ...newTodo });
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO todos (title, completed) VALUES ($1, $2) RETURNING *',
        ['New Test Todo', false]
      );
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ completed: false });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Title is required and must be a non-empty string.' });
    });

    it('should return 400 if title is an empty string', async () => {
      const res = await request(app)
        .post('/todos')
        .send({ title: '   ', completed: false });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Title is required and must be a non-empty string.' });
    });
  });

  describe('PUT /todos/:id', () => {
    it('should update a todo item', async () => {
      const updatedTodo = { title: 'Updated Todo', completed: true };
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, ...updatedTodo }]
      });

      const res = await request(app)
        .put('/todos/1')
        .send(updatedTodo);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ id: 1, ...updatedTodo });
      expect(db.query).toHaveBeenCalledWith(
        'UPDATE todos SET title = $1, completed = $2 WHERE id = $3 RETURNING *',
        ['Updated Todo', true, '1']
      );
    });

    it('should return 404 if todo to update not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .put('/todos/999')
        .send({ title: 'Non-existent' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Todo not found' });
    });

    it('should return 400 if no fields are provided for update', async () => {
      const res = await request(app)
        .put('/todos/1')
        .send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'At least one field (title or completed) must be provided for update.' });
    });

    it('should return 400 if completed is not a boolean', async () => {
      const res = await request(app)
        .put('/todos/1')
        .send({ completed: 'not-a-boolean' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Completed must be a boolean value.' });
    });
  });

  describe('DELETE /todos/:id', () => {
    it('should delete a todo item', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ id: 1, title: 'Deleted Todo', completed: false }] // Mock a deleted row
      });

      const res = await request(app).delete('/todos/1');

      expect(res.statusCode).toEqual(204); // No Content
      expect(res.body).toEqual({}); // Empty body for 204
      expect(db.query).toHaveBeenCalledWith('DELETE FROM todos WHERE id = $1 RETURNING *', ['1']);
    });

    it('should return 404 if todo to delete not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).delete('/todos/999');

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Todo not found' });
    });
  });
});
