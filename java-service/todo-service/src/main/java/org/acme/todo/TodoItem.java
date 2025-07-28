// src/main/java/org/acme/todo/TodoItem.java
package org.acme.todo;

import java.util.Objects;

/**
 * Represents a single Todo item.
 */
public class TodoItem {
    private String id;
    private String title;
    private boolean completed;

    // Default constructor for JSON deserialization
    public TodoItem() {
    }

    public TodoItem(String id, String title, boolean completed) {
        this.id = id;
        this.title = title;
        this.completed = completed;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        TodoItem todoItem = (TodoItem) o;
        return completed == todoItem.completed &&
               Objects.equals(id, todoItem.id) &&
               Objects.equals(title, todoItem.title);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, completed);
    }

    @Override
    public String toString() {
        return "TodoItem{" +
               "id='" + id + '\'' +
               ", title='" + title + '\'' +
               ", completed=" + completed +
               '}';
    }
}
