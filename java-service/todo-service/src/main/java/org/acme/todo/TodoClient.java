// src/main/java/org/acme/todo/TodoClient.java
package org.acme.todo;

import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import java.util.List;

/**
 * REST Client for the external Todo API.
 * Uses MicroProfile Rest Client, which is similar in concept to Spring Boot's RestClient.
 * The base URL for this client will be configured in application.properties, e.g.,
 * org.acme.todo.TodoClient/mp-rest/url=http://localhost:8081
 */
@RegisterRestClient(configKey = "todo-api") // Use a configKey for easier configuration
@Path("/todos") // Base path for the external API
@Produces(MediaType.APPLICATION_JSON) // Specifies that the client produces JSON
@Consumes(MediaType.APPLICATION_JSON) // Specifies that the client consumes JSON
public interface TodoClient {

    /**
     * Fetches all todo items from the external API.
     * @return A list of TodoItem objects.
     */
    @GET
    List<TodoItem> getAllTodos();

    /**
     * Fetches a single todo item by its ID from the external API.
     * @param id The ID of the todo item.
     * @return The TodoItem object.
     */
    @GET
    @Path("/{id}")
    TodoItem getTodoById(@PathParam("id") String id);

    /**
     * Creates a new todo item on the external API.
     * @param todoItem The TodoItem object to create.
     * @return The created TodoItem object (often with an ID assigned by the server).
     */
    @POST
    TodoItem createTodo(TodoItem todoItem);

    /**
     * Updates an existing todo item on the external API.
     * @param id The ID of the todo item to update.
     * @param todoItem The updated TodoItem object.
     * @return The updated TodoItem object.
     */
    @PUT
    @Path("/{id}")
    TodoItem updateTodo(@PathParam("id") String id, TodoItem todoItem);

    /**
     * Deletes a todo item by its ID from the external API.
     * @param id The ID of the todo item to delete.
     */
    @DELETE
    @Path("/{id}")
    void deleteTodo(@PathParam("id") String id);
}
