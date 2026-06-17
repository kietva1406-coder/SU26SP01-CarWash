package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class BookingHistory {
    private UUID id;
    private UUID booking_id;
    private String action;
    private String changes;
    private UUID performed_by;
    private String performed_by_role;
    private LocalDateTime performed_at;

    public BookingHistory() {}

    public BookingHistory(UUID booking_id, String action, UUID performed_by, String performed_by_role) {
        this.id = UUID.randomUUID();
        this.booking_id = booking_id;
        this.action = action;
        this.performed_by = performed_by;
        this.performed_by_role = performed_by_role;
        this.performed_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBooking_id() { return booking_id; }
    public void setBooking_id(UUID booking_id) { this.booking_id = booking_id; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getChanges() { return changes; }
    public void setChanges(String changes) { this.changes = changes; }

    public UUID getPerformed_by() { return performed_by; }
    public void setPerformed_by(UUID performed_by) { this.performed_by = performed_by; }

    public String getPerformed_by_role() { return performed_by_role; }
    public void setPerformed_by_role(String performed_by_role) { this.performed_by_role = performed_by_role; }

    public LocalDateTime getPerformed_at() { return performed_at; }
    public void setPerformed_at(LocalDateTime performed_at) { this.performed_at = performed_at; }

    @Override
    public String toString() {
        return "BookingHistory{" + "id=" + id + ", action='" + action + '\'' + '}';
    }
}
