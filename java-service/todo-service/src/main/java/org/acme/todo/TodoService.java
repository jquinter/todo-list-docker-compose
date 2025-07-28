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
     * Retrieves all todo items from the external API.
     * @return A list of TodoItem objects.
     */
    public List<TodoItem> findAllTodos() {
        return todoClient.getAllTodos();
    }

    /**
     * Retrieves a single todo item by its ID.
     * @param id The ID of the todo item.
     * @return The TodoItem object.
     * @throws NotFoundException if the todo item with the given ID is not found.
     */
    public TodoItem findTodoById(String id) {
        // The client might throw a WebApplicationException (e.g., 404) if not found.
        // We can re-throw it or wrap it in a more specific exception if needed.
        try {
            return todoClient.getTodoById(id);
        } catch (jakarta.ws.rs.WebApplicationException e) {
            if (e.getResponse().getStatus() == 404) {
                throw new NotFoundException("Todo item with ID " + id + " not found.");
            }
            throw e; // Re-throw other exceptions
        }
    }

    /**
     * Creates a new todo item.
     * Assigns a new ID if not provided by the client, then sends it to the external API.
     * @param todoItem The TodoItem object to create.
     * @return The created TodoItem object.
     */
    public TodoItem createTodo(TodoItem todoItem) {
        if (todoItem.getId() == null || todoItem.getId().isEmpty()) {
            todoItem.setId(UUID.randomUUID().toString()); // Assign a unique ID if not provided
        }
        return todoClient.createTodo(todoItem);
    }

    /**
     * Updates an existing todo item.
     * @param id The ID of the todo item to update.
     * @param todoItem The updated TodoItem object.
     * @return The updated TodoItem object.
     * @throws NotFoundException if the todo item with the given ID is not found.
     */
    public TodoItem updateTodo(String id, TodoItem todoItem) {
        // Ensure the ID in the path matches the ID in the body for consistency
        if (!id.equals(todoItem.getId())) {
            // Depending on business logic, you might throw an IllegalArgumentException here
            // or simply use the path ID. For this example, we'll ensure they match.
            todoItem.setId(id);
        }
        try {
            return todoClient.updateTodo(id, todoItem);
        } catch (jakarta.ws.rs.WebApplicationException e) {
            if (e.getResponse().getStatus() == 404) {
                throw new NotFoundException("Todo item with ID " + id + " not found for update.");
            }
            throw e;
        }
    }

    /**
     * Deletes a todo item by its ID.
     * @param id The ID of the todo item to delete.
     * @throws NotFoundException if the todo item with the given ID is not found.
     */
    public void deleteTodo(String id) {
        try {
            todoClient.deleteTodo(id);
        } catch (jakarta.ws.rs.WebApplicationException e) {
            if (e.getResponse().getStatus() == 404) {
                throw new NotFoundException("Todo item with ID " + id + " not found for deletion.");
            }
            throw e;
        }
    }

    /**
     * Generates insights from the list of all todo items.
     * @return A TodoInsights object containing statistics.
     */
    public TodoInsights getInsights() {
        List<TodoItem> allTodos = findAllTodos();

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
