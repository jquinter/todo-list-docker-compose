package org.acme.todo;

import jakarta.enterprise.inject.Alternative;
import io.cucumber.java.Before;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.When;
import io.cucumber.java.en.Then;
// import io.quarkus.test.InjectMock;
// import io.quarkus.test.junit.mockito.InjectMock;
// import jakarta.inject.Inject;
import io.quarkiverse.cucumber.ScenarioScope;
import jakarta.ws.rs.NotFoundException;

import org.junit.jupiter.api.Assertions;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;

import static io.restassured.RestAssured.given;
// import io.restassured.response.Response;
import io.restassured.response.ValidatableResponse;

import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.CoreMatchers.is;
import static org.mockito.ArgumentMatchers.any;

// @ScenarioScope
// @Alternative
public class TodoSteps{

    private TodoService todoService; // This will hold the actual mock instance

    // private Response internalResponse;
    private TodoItem createdTodoItem;
    private ValidatableResponse internalResponse;
    
    @Before
    public void setupScenarioMock() {
        System.out.println("DEBUG: Initializing mock TodoService in Cucumber @Before hook");

        // Get the mock from the static field in the test runner
        this.todoService = RunQuarkusCucumberTest.STATIC_TODO_SERVICE_MOCK;

        if (this.todoService == null) {
            System.err.println("ERROR: TodoService mock is null!");
            throw new RuntimeException("TodoService mock is null!");
        }

        // Debug prints to verify it's now the actual mock
        System.out.println("DEBUG: Injected todoService type: " + this.todoService.getClass().getName());
        System.out.println("DEBUG: Is todoService a Mockito mock? " + Mockito.mockingDetails(this.todoService).isMock());

        Mockito.reset(this.todoService); // This should now succeed

    }


    @Given("the to-do service has a list of items")
    public void setupMockTodos() {
        TodoItem todo1 = new TodoItem("1", "Buy groceries", false);
        TodoItem todo2 = new TodoItem("2", "Walk the dog", true);
        List<TodoItem> mockTodos = Arrays.asList(todo1, todo2);
        Mockito.when(todoService.findAllTodos()).thenReturn(mockTodos);
    }

    @Given("a to-do item with ID {string} exists")
    public void setupSingleTodo(String id) {
        TodoItem todo = new TodoItem(id, "Buy groceries", false);
        Mockito.when(todoService.findTodoById(id)).thenReturn(todo);
    }

    @Given("no to-do item with ID {string} exists")
    public void setupNotFoundTodo(String id) {
        Mockito.when(todoService.findTodoById(id)).thenThrow(new NotFoundException("Todo item with ID " + id + " not found."));
    }

    @When("a user requests all to-do items")
    public void requestAllTodos() {
        internalResponse = given()
                .when().get("/todos")
                .then();
    }

    @When("a user requests the to-do item with ID {string}")
    public void requestTodoById(String id) {
        internalResponse = given()
                .when().get("/todos/{id}", id)
                .then();
    }

    @When("a user creates a new to-do item with title {string}")
    public void createTodoItem(String title) {
        TodoItem newTodo = new TodoItem(null, title, false);
        TodoItem createdTodo = new TodoItem("generated-id", title, false);
        // Mock the service call        
        Mockito.when(todoService.createTodo(any(TodoItem.class))).thenReturn(createdTodo);

        internalResponse = given()
                .contentType("application/json")
                .body(newTodo)
                .when().post("/todos")
                .then();
    }

    @Then("the response status should be {int}")
    public void verifyResponseStatus(int statusCode) {
        internalResponse.statusCode(statusCode);
    }

    @Then("the response should contain {int} to-do items")
    public void verifyResponseSize(int size) {
        internalResponse.body("size()", is(size));
    }

    @Then("the first item should have the title {string} and be incomplete")
    public void verifyFirstItemInResponse(String title) {
        internalResponse.body("[0].title", is(title))
                .body("[0].completed", is(false));
    }

    @Then("the second item should have the title {string} and be complete")
    public void verifySecondItemInResponse(String title) {
        internalResponse.body("[1].title", is(title))
                .body("[1].completed", is(true));
    }

    @Then("the response should be the to-do item with title {string}")
    public void verifySingleItemInResponse(String title) {
        internalResponse.body("title", is(title));
    }

    @Then("the response should contain the newly created to-do item with title {string}")
    public void verifyCreatedItemInResponse(String title) {
        internalResponse.body("id", notNullValue())
                .body("title", is(title))
                .body("completed", is(false));
    }
}