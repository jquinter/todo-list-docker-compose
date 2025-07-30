// src/test/java/org/acme/todo/TodoServiceTest.java
package org.acme.todo;

import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

/**
 * Unit tests for the TodoService.
 * Uses QuarkusTest for CDI context and Mockito for mocking the TodoClient.
 */
@QuarkusTest
public class TodoServiceTest {

    @InjectMock
    TodoService todoService; // The service we are testing

    @InjectMock
    @RestClient // Important: InjectMock for RestClient interfaces
    TodoClient todoClient; // The dependency to mock

    private TodoItem todo1;
    private TodoItem todo2;

    @BeforeEach
    void setUp() {
        // Reset mocks before each test to ensure isolation
        Mockito.reset(todoClient);

        todo1 = new TodoItem("1", "Buy groceries", false);
        todo2 = new TodoItem("2", "Walk the dog", true);
    }

    @Test
    void UnitTestFindAllTodos() {
        // Configure mock behavior for todoClient.getAllTodos()
        List<TodoItem> mockTodos = Arrays.asList(todo1, todo2);
        Mockito.when(todoClient.getAllTodos()).thenReturn(mockTodos);

        // Call the service method
        List<TodoItem> result = todoService.findAllTodos();

        // Assert the result
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(todo1, result.get(0));
        assertEquals(todo2, result.get(1));

        // Verify that the client method was called
        Mockito.verify(todoClient).getAllTodos();
    }

    @Test
    void UnitTestFindTodoByIdFound() {
        Mockito.when(todoClient.getTodoById("1")).thenReturn(todo1);

        TodoItem result = todoService.findTodoById("1");

        assertNotNull(result);
        assertEquals(todo1, result);
        Mockito.verify(todoClient).getTodoById("1");
    }

    @Test
    void UnitTestFindTodoByIdNotFound() {
        // Simulate a 404 response from the client
        WebApplicationException notFoundException = new WebApplicationException(Response.Status.NOT_FOUND);
        Mockito.when(todoClient.getTodoById("99")).thenThrow(notFoundException);

        // Assert that NotFoundException is thrown by the service
        NotFoundException thrown = assertThrows(NotFoundException.class, () -> {
            todoService.findTodoById("99");
        });

        assertEquals("Todo item with ID 99 not found.", thrown.getMessage());
        Mockito.verify(todoClient).getTodoById("99");
    }

    @Test
    void UnitTestCreateTodoWithNewId() {
        TodoItem newTodo = new TodoItem(null, "New Task", false);
        TodoItem createdTodoResponse = new TodoItem("generated-id", "New Task", false);

        // Mock the client's createTodo method to return a TodoItem with a generated ID
        Mockito.when(todoClient.createTodo(any(TodoItem.class))).thenReturn(createdTodoResponse);

        TodoItem result = todoService.createTodo(newTodo);

        assertNotNull(result);
        assertNotNull(result.getId()); // Verify an ID was assigned
        assertEquals("New Task", result.getTitle());
        assertFalse(result.isCompleted());

        // Verify that the client method was called with a TodoItem that has an ID
        Mockito.verify(todoClient).createTodo(any(TodoItem.class));
    }

    @Test
    void UnitTestCreateTodoWithProvidedId() {
        TodoItem newTodo = new TodoItem("custom-id", "Custom Task", false);
        TodoItem createdTodoResponse = new TodoItem("custom-id", "Custom Task", false);

        Mockito.when(todoClient.createTodo(any(TodoItem.class))).thenReturn(createdTodoResponse);

        TodoItem result = todoService.createTodo(newTodo);

        assertNotNull(result);
        assertEquals("custom-id", result.getId());
        assertEquals("Custom Task", result.getTitle());

        Mockito.verify(todoClient).createTodo(any(TodoItem.class));
    }

    @Test
    void UnitTestUpdateTodo() {
        TodoItem updatedTodoRequest = new TodoItem("1", "Buy groceries (updated)", true);
        TodoItem updatedTodoResponse = new TodoItem("1", "Buy groceries (updated)", true);

        Mockito.when(todoClient.updateTodo(eq("1"), any(TodoItem.class))).thenReturn(updatedTodoResponse);

        TodoItem result = todoService.updateTodo("1", updatedTodoRequest);

        assertNotNull(result);
        assertEquals(todo1.getId(), result.getId());
        assertEquals("Buy groceries (updated)", result.getTitle());
        assertTrue(result.isCompleted());

        Mockito.verify(todoClient).updateTodo(eq("1"), any(TodoItem.class));
    }

    @Test
    void UnitTestUpdateTodoNotFound() {
        WebApplicationException notFoundException = new WebApplicationException(Response.Status.NOT_FOUND);
        Mockito.when(todoClient.updateTodo(eq("99"), any(TodoItem.class))).thenThrow(notFoundException);

        TodoItem nonExistentTodo = new TodoItem("99", "Non existent", false);

        NotFoundException thrown = assertThrows(NotFoundException.class, () -> {
            todoService.updateTodo("99", nonExistentTodo);
        });

        assertEquals("Todo item with ID 99 not found for update.", thrown.getMessage());
        Mockito.verify(todoClient).updateTodo(eq("99"), any(TodoItem.class));
    }

    @Test
    void UnitTestDeleteTodo() {
        Mockito.doNothing().when(todoClient).deleteTodo("1");

        assertDoesNotThrow(() -> todoService.deleteTodo("1"));

        Mockito.verify(todoClient).deleteTodo("1");
    }

    @Test
    void UnitTestDeleteTodoNotFound() {
        WebApplicationException notFoundException = new WebApplicationException(Response.Status.NOT_FOUND);
        Mockito.doThrow(notFoundException).when(todoClient).deleteTodo("99");

        NotFoundException thrown = assertThrows(NotFoundException.class, () -> {
            todoService.deleteTodo("99");
        });

        assertEquals("Todo item with ID 99 not found for deletion.", thrown.getMessage());
        Mockito.verify(todoClient).deleteTodo("99");
    }

    @Test
    void UnitTestGetInsights() {
        // Arrange
        List<TodoItem> mockTodos = Arrays.asList(
            new TodoItem("1", "Walk the dog", true),
            new TodoItem("2", "Buy milk and dog food", false),
            new TodoItem("3", "Clean the house", false)
        );
        Mockito.when(todoClient.getAllTodos()).thenReturn(mockTodos);

        // Act
        TodoInsights insights = todoService.getInsights();

        // Assert
        assertNotNull(insights);
        assertEquals(3, insights.getTotalTasks());
        assertEquals(1, insights.getCompletedTasks());
        assertEquals(1.0 / 3.0, insights.getCompletionRatio(), 0.01);

        Map<String, Long> topWords = insights.getMostCommonWords();
        assertNotNull(topWords);
        assertEquals(2, topWords.get("dog").longValue());
        assertFalse(topWords.containsKey("the")); // stop word
        assertEquals(5, topWords.size()); // Verify that we get the top 5 words
    }
}
