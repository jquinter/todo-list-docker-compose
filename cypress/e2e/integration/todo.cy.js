describe('ToDo Application E2E Tests', () => {

  // NEW: Clear the database before each test
  beforeEach(() => {
    // Make a POST request to the backend's test data clearing endpoint
    // Ensure your backend is running in 'test' environment and exposes this endpoint
    cy.request('POST', 'http://localhost:3001/todos/clear-data');
    cy.visit('http://localhost:8080'); // Visit the frontend after clearing data
    cy.wait(1000); // Wait for the app to load
  });

  it('should display the title "La TREMENDA lista"', () => {
    cy.get('h1').should('contain', 'La TREMENDA lista');
  });

  it('should add a new todo item and verify its presence in the UI and Backend/DB', () => {
    const todoText = 'Verify new todo in DB';

    // UI Interaction: Add the todo
    cy.get('input[placeholder="Add a new todo..."]').type(todoText);
    cy.contains('button', 'Add').click();

    // UI Assertion: Check if the todo appears in the list
    cy.get('ul li').should('have.length', 1);
    cy.get('ul li span').should('contain', todoText);

    // Backend/DB Assertion: Verify the todo exists via the backend API
    cy.request('GET', 'http://localhost:3001/todos').then((response) => {
      expect(response.status).to.eq(200);
      // Find the newly added todo in the API response
      const addedTodo = response.body.find(todo => todo.title === todoText);
      expect(addedTodo).to.exist;
      expect(addedTodo.title).to.eq(todoText);
      expect(addedTodo.completed).to.be.false; // New todos should be uncompleted
    });
  });

  it('should mark a todo item as complete and verify its status in the UI and Backend/DB', () => {
    const todoText = 'Mark this complete and check DB';

    // Setup: Add a todo first
    cy.get('input[placeholder="Add a new todo..."]').type(todoText);
    cy.contains('button', 'Add').click();
    cy.get('ul li').should('have.length', 1); // Ensure it's added

    // UI Interaction: Mark the todo as complete
    cy.contains('ul li', todoText).find('input[type="checkbox"]').check();

    // UI Assertion: Check for line-through style
    cy.contains('ul li', todoText)
      .find('span')
      .should('have.class', 'line-through');

    // Backend/DB Assertion: Verify the todo's status via the backend API
    cy.request('GET', 'http://localhost:3001/todos').then((response) => {
      expect(response.status).to.eq(200);
      const updatedTodo = response.body.find(todo => todo.title === todoText);
      expect(updatedTodo).to.exist;
      expect(updatedTodo.completed).to.be.true; // Should now be completed
    });
  });

  it('should delete a todo item and verify its absence from the UI and Backend/DB', () => {
    const todoText = 'Delete this from UI and DB';

    // Setup: Add a todo first
    cy.get('input[placeholder="Add a new todo..."]').type(todoText);
    cy.contains('button', 'Add').click();
    cy.get('ul li').should('have.length', 1); // Ensure it's added

    // UI Interaction: Click the delete button
    cy.contains('ul li', todoText)
      .find('button svg')
      .click();

    // UI Assertion: Verify the item is gone from the UI
    cy.get('ul li').should('not.exist');
    cy.contains('p', 'No todos yet. Start by adding one above!').should('be.visible');

    // Backend/DB Assertion: Verify the todo is absent via the backend API
    cy.request('GET', 'http://localhost:3001/todos').then((response) => {
      expect(response.status).to.eq(200);
      const deletedTodo = response.body.find(todo => todo.title === todoText);
      expect(deletedTodo).to.not.exist; // Should no longer be present
    });
  });

  it('should display empty message when no todos exist (initial state)', () => {
    cy.contains('p', 'No todos yet. Start by adding one above!').should('be.visible');
    cy.get('ul li').should('not.exist');
  });

});
