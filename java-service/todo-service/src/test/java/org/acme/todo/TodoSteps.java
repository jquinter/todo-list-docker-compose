package org.acme.todo;

import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.quarkus.test.InjectMock;
import jakarta.ws.rs.NotFoundException;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.response.ValidatableResponse;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.notNullValue;
import static org.hamcrest.CoreMatchers.is;
import static org.mockito.ArgumentMatchers.any;

@QuarkusTest
public class TodoSteps {

    @InjectMock
    TodoService todoService;

    private ValidatableResponse response;

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
        response = given()
                .when().get("/todos")
                .then();
    }

    @When("a user requests the to-do item with ID {string}")
    public void requestTodoById(String id) {
        response = given()
                .when().get("/todos/{id}", id)
                .then();
    }

    @When("a user creates a new to-do item with title {string}")
    public void createTodoItem(String title) {
        TodoItem newTodo = new TodoItem(null, title, false);
        TodoItem createdTodo = new TodoItem("generated-id", title, false);
        // Mock the service call
        Mockito.when(todoService.createTodo(any(TodoItem.class))).thenReturn(createdTodo);

        response = given()
                .contentType("application/json")
                .body(newTodo)
                .when().post("/todos")
                .then();
    }

    @Then("the response status should be {int}")
    public void verifyStatus(int statusCode) {
        response.statusCode(statusCode);
    }

    @Then("the response should contain {int} to-do items")
    public void verifySize(int size) {
        response.body("size()", is(size));
    }

    @Then("the first item should have the title {string} and be incomplete")
    public void verifyFirstItem(String title) {
        response.body("[0].title", is(title))
                .body("[0].completed", is(false));
    }

    @Then("the second item should have the title {string} and be complete")
    public void verifySecondItem(String title) {
        response.body("[1].title", is(title))
                .body("[1].completed", is(true));
    }

    @Then("the response should be the to-do item with title {string}")
    public void verifySingleItem(String title) {
        response.body("title", is(title));
    }

    @Then("the response should contain the newly created to-do item with title {string}")
    public void verifyCreatedItem(String title) {
        response.body("id", notNullValue())
                .body("title", is(title))
                .body("completed", is(false));
    }
}