package model;

import java.time.LocalDateTime;

public class CheckOut {

    private String id;
    private String taskId;
    private String staffId;
    private LocalDateTime checkoutAt;
    private String notes;
    private LocalDateTime createdAt;

    // Constructors
    public CheckOut() {
    }

    public CheckOut(String taskId, String staffId, String notes) {
        this.id = java.util.UUID.randomUUID().toString();
        this.taskId = taskId;
        this.staffId = staffId;
        this.notes = notes;
        this.checkoutAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
    }

    // Getters & Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTaskId() {
        return taskId;
    }

    public void setTaskId(String taskId) {
        this.taskId = taskId;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public LocalDateTime getCheckoutAt() {
        return checkoutAt;
    }

    public void setCheckoutAt(LocalDateTime checkoutAt) {
        this.checkoutAt = checkoutAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public String toString() {
        return "CheckOut{" +
                "id='" + id + '\'' +
                ", taskId='" + taskId + '\'' +
                ", staffId='" + staffId + '\'' +
                ", checkoutAt=" + checkoutAt +
                ", notes='" + notes + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}
