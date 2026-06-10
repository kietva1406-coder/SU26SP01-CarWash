package model;

import enums.TaskStatus;
import java.util.UUID;

public class Task {

    private UUID id;
    private UUID requestId;
    private TaskStatus status;
    private String createdAt;
    private String updatedAt;

    private String note;

    // ===== GETTER & SETTER =====
   
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getRequestId() {
        return requestId;
    }

    public void setRequestId(UUID requestId) {
        this.requestId = requestId;
    }

    public TaskStatus getStatus() {
        return status;
    }

    public void setStatus(TaskStatus status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }
    public String getCreatedAt() {
        return createdAt;
    }
     public String getUpdatedAt() {
        return updatedAt;
    }
}