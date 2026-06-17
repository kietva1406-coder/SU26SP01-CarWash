package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class TaskAssignment {

    private UUID id;
    private UUID taskId;
    private String staffId;      
    private String assignedBy;   
    private LocalDateTime assignedAt;
    private LocalDateTime checkinAt;
    private LocalDateTime checkoutAt;

    // Constructors
    public TaskAssignment() {
    }

    public TaskAssignment(UUID taskId, String staffId, String assignedBy) {
        this.id = UUID.randomUUID();
        this.taskId = taskId;
        this.staffId = staffId;
        this.assignedBy = assignedBy;
        this.assignedAt = LocalDateTime.now();
    }

    // Getters & Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getTaskId() {
        return taskId;
    }

    public void setTaskId(UUID taskId) {
        this.taskId = taskId;
    }

    public String getStaffId() {
        return staffId;
    }

    public void setStaffId(String staffId) {
        this.staffId = staffId;
    }

    public String getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getCheckinAt() {
        return checkinAt;
    }

    public void setCheckinAt(LocalDateTime checkinAt) {
        this.checkinAt = checkinAt;
    }

    public LocalDateTime getCheckoutAt() {
        return checkoutAt;
    }

    public void setCheckoutAt(LocalDateTime checkoutAt) {
        this.checkoutAt = checkoutAt;
    }

    @Override
    public String toString() {
        return "TaskAssignment{" +
                "id=" + id +
                ", taskId=" + taskId +
                ", staffId='" + staffId + '\'' +
                ", assignedBy='" + assignedBy + '\'' +
                ", assignedAt=" + assignedAt +
                ", checkinAt=" + checkinAt +
                ", checkoutAt=" + checkoutAt +
                '}';
    }
}