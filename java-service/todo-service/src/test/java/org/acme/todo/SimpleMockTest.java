package org.acme.todo;

import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.mockito.InjectMock;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

@QuarkusTest
public class SimpleMockTest {

    @InjectMock
    TodoService mockedTodoService; // No @ScenarioScope needed for a plain QuarkusTest

    @Test
    public void testMockInjection() {
        Assertions.assertNotNull(mockedTodoService, "mockedTodoService should not be null");
        Mockito.when(mockedTodoService.findTodoById("123")).thenReturn(new TodoItem());
        TodoItem result = mockedTodoService.findTodoById("123");
        Assertions.assertNotNull(result);
        Mockito.verify(mockedTodoService).findTodoById("123");
    }
}