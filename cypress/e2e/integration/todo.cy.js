describe('ToDo Application E2E Tests', () => {

  // NEW: Clear the database before each test
  beforeEach(() => {
    // Make a POST request to the backend's test data clearing endpoint
    // Ensure your backend is running in 'test' environment and exposes this endpoint
    cy.request('POST', 'http://localhost:3000/todos/clear-data');
    cy.visit('http://localhost:8080'); // Visit the frontend after clearing data
  });

  it('should display the title "The ToDo List"', () => {
    cy.get('h1').should('contain', 'The ToDo List');
  });

  it('should add a new todo item', () => {
    const todoText = 'Learn Cypress E2E Testing';
    cy.get('input[placeholder="Add a new todo..."]').type(todoText);
    cy.contains('button', 'Add').click();
    cy.get('ul li').should('have.length', 1);
    cy.get('ul li span').should('contain', todoText);
  });

  it('should mark a todo item as complete', () => {
    const todoText = 'Complete Cypress Tutorial';
    cy.get('input[placeholder="Add a new todo..."]').type(todoText);
    cy.contains('button', 'Add').click();
    cy.get('ul li').contains(todoText).prev('input[type="checkbox"]').check();
    cy.get('ul li span').should('have.class', 'line-through');
  });

  it('should delete a todo item', () => {
    const todoText = 'Delete old tasks';
    cy.get('input[placeholder="Add a new todo..."]').type(todoText);
    cy.contains('button', 'Add').click();
    cy.get('ul li').should('have.length', 1); // Verify one item exists

    // Click the delete button (trash icon) for the todo item    
    // FIXED: More robust selector for the delete button.
    // Find the list item containing the todoText, then find the button with the SVG inside it.
    cy.contains('ul li', todoText)
      .find('button svg') // Find the SVG icon within the delete button
      .click();      

    cy.get('ul li').should('not.exist'); // Verify the item is gone
    cy.contains('p', 'No todos yet. Start by adding one above!').should('be.visible');
  });

  it('should display empty message when no todos exist', () => {
    cy.contains('p', 'No todos yet. Start by adding one above!').should('be.visible');
    cy.get('ul li').should('not.exist');
  });

});
