package model;

import java.time.LocalDateTime;

public class RequestAssignment {

    private String requestId;
    private String staffId;
    private String assignedBy;
    private LocalDateTime assignedAt;

    // Constructors
    public RequestAssignment() {
    }

    public RequestAssignment(String requestId, String staffId, String assignedBy) {
        this.requestId = requestId;
        this.staffId = staffId;
        this.assignedBy = assignedBy;
        this.assignedAt = LocalDateTime.now();
    }

    // Getters & Setters
    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
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

    @Override
    public String toString() {
        return "RequestAssignment{" +
                "requestId='" + requestId + '\'' +
                ", staffId='" + staffId + '\'' +
                ", assignedBy='" + assignedBy + '\'' +
                ", assignedAt=" + assignedAt +
                '}';
    }
}
