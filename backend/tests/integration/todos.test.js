// backend/tests/integration/api/todos.test.js
const request = require('supertest');
const app = require('../../src/app'); // Import the Express app
jest.mock('../../src/db', () => ({
  query: jest.fn(), // Mock the query function
  connectDb: jest.fn().mockResolvedValue(true), // Mock successful connection
  pool: { end: jest.fn() } // Mock pool.end for cleanup
}));

describe('Todo API Integration Tests', () => {
  const db = require('../../src/db'); // require the mocked db
  const testUser = { id: 1, email: 'test@example.com', username: 'testuser' };
  const testUserEmail = 'test@example.com';

  // Before each test, clear all mock calls to ensure test isolation
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the user lookup middleware for all tests
    db.query.mockResolvedValue({ rows: [testUser] });
  });

  // After all tests, close the database pool mock to prevent open handles warning
  afterAll(async () => {
    // No pool to end in mock
  });

  describe('GET /api/todos', () => {
    it('should return all todos for the authenticated user', async () => {
      const now = new Date().toISOString();
      // Mock the database query to return a predefined set of todos
      const mockTodos = [
        { id: 1, title: 'Test Todo 1', completed: false, user_id: testUser.id, created_at: now, completed_at: null },
        { id: 2, title: 'Test Todo 2', completed: true, user_id: testUser.id, created_at: now, completed_at: now }
      ];
      // First call is user lookup, second is for todos
      db.query.mockResolvedValueOnce({ rows: [testUser] }).mockResolvedValueOnce({ rows: mockTodos });

      const res = await request(app)
        .get('/api/todos')
        .set('X-User-Email', testUserEmail);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockTodos);
      // Verify that the correct SQL query was executed for the user
      expect(db.query).toHaveBeenCalledWith(
        "SELECT id, title, completed, created_at, completed_at FROM todos WHERE user_id = $1 ORDER BY created_at DESC",
        [testUser.id]
      );
    });

    it('should return 500 on database error', async () => {
      // Mock user lookup, then fail the todos query
      db.query.mockResolvedValueOnce({ rows: [testUser] }).mockRejectedValueOnce(new Error('Database connection failed'));

      const res = await request(app)
        .get('/api/todos')
        .set('X-User-Email', testUserEmail);

      expect(res.statusCode).toEqual(500);
      expect(res.body).toEqual({ error: 'Internal server error' });
    });

    it('should return 401 if user email header is missing', async () => {
      const res = await request(app).get('/api/todos');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ error: 'User email header (x-user-email) is missing for non-IAP request.' });
    });
  });

  describe('GET /api/todos/:id', () => {
    it('should return a single todo by ID for the authenticated user', async () => {
      const mockTodo = { id: 1, title: 'Single Todo', completed: false, user_id: testUser.id };
      db.query.mockResolvedValueOnce({ rows: [testUser] }).mockResolvedValueOnce({ rows: [mockTodo] });

      const res = await request(app)
        .get('/api/todos/1')
        .set('X-User-Email', testUserEmail);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockTodo);
      expect(db.query).toHaveBeenCalledWith('SELECT * FROM todos WHERE id = $1 AND user_id = $2', ['1', testUser.id]);
    });

    it('should return 404 if todo not found for the user', async () => {
      db.query.mockResolvedValueOnce({ rows: [testUser] }).mockResolvedValueOnce({ rows: [] }); // No rows found

      const res = await request(app)
        .get('/api/todos/999')
        .set('X-User-Email', testUserEmail);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Todo not found' });
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo for the authenticated user', async () => {
      const newTodoData = { title: 'New Test Todo' };
      const createdTodo = { id: 3, ...newTodoData, completed: false, user_id: testUser.id };
      db.query.mockResolvedValueOnce({ rows: [testUser] }).mockResolvedValueOnce({
        rows: [createdTodo] // Mock the returned created todo
      });

      const res = await request(app)
        .post('/api/todos')
        .set('X-User-Email', testUserEmail)
        .send(newTodoData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toEqual(createdTodo);
      expect(db.query).toHaveBeenCalledWith(
        'INSERT INTO todos (title, user_id) VALUES ($1, $2) RETURNING *',
        ['New Test Todo', testUser.id]
      );
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/todos')
        .set('X-User-Email', testUserEmail)
        .send({ completed: false });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Title is required and must be a non-empty string.' });
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update a todo item for the authenticated user', async () => {
      const updatedTodoData = { title: 'Updated Todo', completed: true };
      const returnedTodo = { id: 1, ...updatedTodoData, user_id: testUser.id };
      db.query.mockResolvedValueOnce({ rows: [testUser] }).mockResolvedValueOnce({
        rows: [returnedTodo]
      });

      const res = await request(app)
        .put('/api/todos/1')
        .set('X-User-Email', testUserEmail)
        .send(updatedTodoData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(returnedTodo);
      // Note: The exact query string depends on the implementation of the dynamic query builder.
      // This checks that the correct parameters are passed.
      expect(db.query.mock.calls[1][0]).toContain('UPDATE todos SET');
      expect(db.query.mock.calls[1][1]).toEqual(expect.arrayContaining(['Updated Todo', true, '1', testUser.id]));
    });

    it('should return 404 if todo to update is not found for the user', async () => {
      db.query.mockResolvedValueOnce({ rows: [testUser] }).mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .put('/api/todos/999')
        .set('X-User-Email', testUserEmail)
        .send({ title: 'Non-existent' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Todo not found' });
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should delete a todo item for the authenticated user', async () => {
      db.query.mockResolvedValueOnce({ rows: [testUser] }).mockResolvedValueOnce({
        rows: [
          { id: 1, title: 'Deleted Todo', completed: false, user_id: testUser.id }
        ]
      });

      const res = await request(app)
        .delete('/api/todos/1')
        .set('X-User-Email', testUserEmail);

      expect(res.statusCode).toEqual(204); // No Content
      expect(res.body).toEqual({}); // Empty body for 204
      expect(db.query).toHaveBeenCalledWith('DELETE FROM todos WHERE id = $1 AND user_id = $2 RETURNING *', ['1', testUser.id]);
    });

    it('should return 404 if todo to delete not found', async () => {
      db.query.mockResolvedValueOnce({ rows: [testUser] }).mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .delete('/api/todos/999')
        .set('X-User-Email', testUserEmail);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toEqual({ error: 'Todo not found' });
    });
  });
});
