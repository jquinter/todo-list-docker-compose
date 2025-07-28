// src/main/java/org/acme/todo/TodoResource.java
package org.acme.todo;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.NotFoundException;
import java.net.URI;
import java.util.List;

/**
 * RESTful API endpoints for the Todo Service.
 * This resource exposes endpoints for CRUD operations on Todo items.
 */
@Path("/todos") // Base path for this service's endpoints
@Produces(MediaType.APPLICATION_JSON) // Specifies that this resource produces JSON responses
@Consumes(MediaType.APPLICATION_JSON) // Specifies that this resource consumes JSON requests
public class TodoResource {

    @Inject
    TodoService todoService; // Injects the TodoService

    /**
     * Retrieves all todo items.
     * GET /todos
     * @return A list of TodoItem objects.
     */
    @GET
    public List<TodoItem> getAllTodos() {
        return todoService.findAllTodos();
    }

    /**
     * Retrieves insights about the todo list.
     * GET /todos/insights
     * @return A TodoInsights object with statistics.
     */
    @GET
    @Path("/insights")
    public Response getInsights() {
        return Response.ok(todoService.getInsights()).build();
    }

    /**
     * Retrieves a single todo item by its ID.
     * GET /todos/{id}
     * @param id The ID of the todo item.
     * @return The TodoItem object.
     */
    @GET
    @Path("/{id}")
    public Response getTodoById(@PathParam("id") String id) {
        try {
            TodoItem todoItem = todoService.findTodoById(id);
            return Response.ok(todoItem).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }

    /**
     * Creates a new todo item.
     * POST /todos
     * @param todoItem The TodoItem object to create.
     * @return A Response with status 201 Created and the location of the new resource.
     */
    @POST
    public Response createTodo(TodoItem todoItem) {
        TodoItem createdTodo = todoService.createTodo(todoItem);
        // Return 201 Created with the location header
        return Response.created(URI.create("/todos/" + createdTodo.getId()))
                       .entity(createdTodo)
                       .build();
    }

    /**
     * Updates an existing todo item.
     * PUT /todos/{id}
     * @param id The ID of the todo item to update.
     * @param todoItem The updated TodoItem object.
     * @return The updated TodoItem object.
     */
    @PUT
    @Path("/{id}")
    public Response updateTodo(@PathParam("id") String id, TodoItem todoItem) {
        try {
            TodoItem updatedTodo = todoService.updateTodo(id, todoItem);
            return Response.ok(updatedTodo).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }

    /**
     * Deletes a todo item by its ID.
     * DELETE /todos/{id}
     * @param id The ID of the todo item to delete.
     * @return A Response with status 204 No Content.
     */
    @DELETE
    @Path("/{id}")
    public Response deleteTodo(@PathParam("id") String id) {
        try {
            todoService.deleteTodo(id);
            return Response.noContent().build(); // 204 No Content for successful deletion
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND).entity(e.getMessage()).build();
        }
    }
}
