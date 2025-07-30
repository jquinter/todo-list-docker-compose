package org.acme.todo;

import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class TodoItem {

    private String id;
    private String title;
    private boolean completed;
    private Integer userId; // To link with the user

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime completedAt;

    public TodoItem() {
    }

    public TodoItem(String id, String title, boolean completed, Integer userId, OffsetDateTime createdAt, OffsetDateTime completedAt) {
        this.id = id;
        this.title = title;
        this.completed = completed;
        this.userId = userId;
        this.createdAt = createdAt;
        this.completedAt = completedAt;
    }

    // Getters and Setters

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

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(OffsetDateTime completedAt) {
        this.completedAt = completedAt;
    }
}