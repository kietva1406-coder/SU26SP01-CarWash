package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLog {
    private UUID id;
    private String action;
    private String entity_type;
    private UUID entity_id;
    private UUID performed_by;
    private String performed_by_role;
    private String details;
    private LocalDateTime created_at;

    public AuditLog() {}

    public AuditLog(String action, String entity_type, UUID entity_id, UUID performed_by, String performed_by_role) {
        this.id = UUID.randomUUID();
        this.action = action;
        this.entity_type = entity_type;
        this.entity_id = entity_id;
        this.performed_by = performed_by;
        this.performed_by_role = performed_by_role;
        this.created_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getEntity_type() { return entity_type; }
    public void setEntity_type(String entity_type) { this.entity_type = entity_type; }

    public UUID getEntity_id() { return entity_id; }
    public void setEntity_id(UUID entity_id) { this.entity_id = entity_id; }

    public UUID getPerformed_by() { return performed_by; }
    public void setPerformed_by(UUID performed_by) { this.performed_by = performed_by; }

    public String getPerformed_by_role() { return performed_by_role; }
    public void setPerformed_by_role(String performed_by_role) { this.performed_by_role = performed_by_role; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    @Override
    public String toString() {
        return "AuditLog{" + "id=" + id + ", action='" + action + '\'' + ", entity='" + entity_type + '\'' + '}';
    }
}
