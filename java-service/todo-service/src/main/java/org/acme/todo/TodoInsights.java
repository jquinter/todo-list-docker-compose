// src/main/java/org/acme/todo/TodoInsights.java
package org.acme.todo;

import java.util.Map;

/**
 * A DTO (Data Transfer Object) to hold statistical insights about Todo items.
 */
public class TodoInsights {

    private final long totalTasks;
    private final long completedTasks;
    private final double completionRatio;
    private final Map<String, Long> mostCommonWords;

    public TodoInsights(long totalTasks, long completedTasks, double completionRatio, Map<String, Long> mostCommonWords) {
        this.totalTasks = totalTasks;
        this.completedTasks = completedTasks;
        this.completionRatio = completionRatio;
        this.mostCommonWords = mostCommonWords;
    }

    public long getTotalTasks() {
        return totalTasks;
    }

    public long getCompletedTasks() {
        return completedTasks;
    }

    public double getCompletionRatio() {
        return completionRatio;
    }

    public Map<String, Long> getMostCommonWords() {
        return mostCommonWords;
    }
}