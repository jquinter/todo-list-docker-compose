// src/main/java/org/acme/todo/TodoService.java
package org.acme.todo;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Service layer for managing Todo items.
 * This service interacts with the external Todo API via the TodoClient.
 */
@ApplicationScoped
public class TodoService {

    @Inject
    @RestClient // Injects the MicroProfile Rest Client
    TodoClient todoClient;

    /**
     * Retrieves all todo items for a specific user, identified by their email from IAP.
     * @param userEmail The email of the user provided by the IAP header.
     * @return A list of TodoItem objects.
     */
    public List<TodoItem> findAllTodos(String userEmail) {
        // Assumes TodoClient is updated to pass the user's email, e.g., in a header.
        return todoClient.getTodos(userEmail);
    }

    /**
     * Retrieves a single todo item by its ID for a specific user.
     * @param userEmail The email of the user.
     * @param todoId The ID of the todo item.
     * @return The TodoItem object.
     * @throws NotFoundException if the todo item with the given ID is not found.
     */
    public TodoItem findTodoById(String userEmail, String todoId) {
        try {
            // The client would be updated to pass the userEmail and todoId.
            return todoClient.getTodoById(userEmail, todoId);
        } catch (jakarta.ws.rs.WebApplicationException e) {
            if (e.getResponse().getStatus() == 404) {
                throw new NotFoundException("Todo item with ID " + todoId + " not found for user " + userEmail);
            }
            throw e; // Re-throw other exceptions
        }
    }

    /**
     * Creates a new todo item for a specific user.
     * @param userEmail The email of the user creating the todo.
     * @param todoItem The TodoItem object to create.
     * @return The created TodoItem object.
     */
    public TodoItem createTodo(String userEmail, TodoItem todoItem) {
        if (todoItem.getId() == null || todoItem.getId().isEmpty()) {
            todoItem.setId(UUID.randomUUID().toString()); // Assign a unique ID if not provided
        }
        // The client would be updated to pass the userEmail.
        return todoClient.createTodo(userEmail, todoItem);
    }

    /**
     * Updates an existing todo item.
     * @param userEmail The email of the user.
     * @param todoId The ID of the todo item to update.
     * @param todoItem The updated TodoItem object.
     * @return The updated TodoItem object.
     * @throws NotFoundException if the todo item with the given ID is not found.
     */
    public TodoItem updateTodo(String userEmail, String todoId, TodoItem todoItem) {
        // Ensure the ID in the path matches the ID in the body for consistency
        if (!todoId.equals(todoItem.getId())) {
            // Depending on business logic, you might throw an IllegalArgumentException here
            // or simply use the path ID. For this example, we'll ensure they match.
            todoItem.setId(todoId);
        }
        try {
            // The client would be updated to pass the userEmail.
            return todoClient.updateTodo(userEmail, todoId, todoItem);
        } catch (jakarta.ws.rs.WebApplicationException e) {
            if (e.getResponse().getStatus() == 404) {
                throw new NotFoundException("Todo item with ID " + todoId + " not found for update.");
            }
            throw e;
        }
    }

    /**
     * Deletes a todo item by its ID.
     * @param userEmail The email of the user.
     * @param todoId The ID of the todo item to delete.
     * @throws NotFoundException if the todo item with the given ID is not found.
     */
    public void deleteTodo(String userEmail, String todoId) {
        try {
            // The client would be updated to pass the userEmail.
            todoClient.deleteTodo(userEmail, todoId);
        } catch (jakarta.ws.rs.WebApplicationException e) {
            if (e.getResponse().getStatus() == 404) {
                throw new NotFoundException("Todo item with ID " + todoId + " not found for deletion.");
            }
            throw e;
        }
    }

    /**
     * Generates insights from the list of all todo items for a specific user, identified by email.
     * @param userEmail The email of the user.
     * @return A TodoInsights object containing statistics.
     */
    public TodoInsights getInsights(String userEmail) {
        List<TodoItem> allTodos = findAllTodos(userEmail);

        if (allTodos == null || allTodos.isEmpty()) {
            return new TodoInsights(0, 0, 0.0, Collections.emptyMap());
        }

        long totalTasks = allTodos.size();
        long completedTasks = allTodos.stream().filter(TodoItem::isCompleted).count();
        double completionRatio = (totalTasks > 0) ? (double) completedTasks / totalTasks : 0.0;

        // A simple list of common English "stop words" to exclude from keyword analysis.
        List<String> stopWords = Arrays.asList(
            "a", "an", "the", "to", "in", "on", "for", "with", "is", "of", "and", "buy", "get", "it", "me", "my", "i"
        );

        // Process titles to find the most common words
        Map<String, Long> wordCounts = allTodos.stream()
                .map(TodoItem::getTitle)
                .flatMap(title -> Arrays.stream(title.toLowerCase().split("[^a-zA-Z0-9]+"))) // Split by non-alphanumeric
                .filter(word -> !word.isEmpty() && !stopWords.contains(word)) // Filter out empty strings and stop words
                .collect(Collectors.groupingBy(Function.identity(), Collectors.counting()));

        // Get the top 5 most common words, sorted by frequency
        Map<String, Long> topWords = wordCounts.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder())
                        // Add a secondary sort by key to make the sort stable for ties
                        .thenComparing(Map.Entry.comparingByKey())
                )
                .limit(5)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (e1, e2) -> e1, // In case of a tie, keep the first one
                        java.util.LinkedHashMap::new // Preserve the sorted order
                ));

        return new TodoInsights(totalTasks, completedTasks, completionRatio, topWords);
    }
}
