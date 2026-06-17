package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class BookingStatusHistory {
    private UUID id;
    private UUID booking_id;
    private String previous_status;
    private String new_status;
    private UUID changed_by;
    private String changed_by_role;
    private String reason;
    private LocalDateTime changed_at;

    public BookingStatusHistory() {}

    public BookingStatusHistory(UUID booking_id, String previous_status, String new_status, UUID changed_by, String changed_by_role) {
        this.id = UUID.randomUUID();
        this.booking_id = booking_id;
        this.previous_status = previous_status;
        this.new_status = new_status;
        this.changed_by = changed_by;
        this.changed_by_role = changed_by_role;
        this.changed_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBooking_id() { return booking_id; }
    public void setBooking_id(UUID booking_id) { this.booking_id = booking_id; }

    public String getPrevious_status() { return previous_status; }
    public void setPrevious_status(String previous_status) { this.previous_status = previous_status; }

    public String getNew_status() { return new_status; }
    public void setNew_status(String new_status) { this.new_status = new_status; }

    public UUID getChanged_by() { return changed_by; }
    public void setChanged_by(UUID changed_by) { this.changed_by = changed_by; }

    public String getChanged_by_role() { return changed_by_role; }
    public void setChanged_by_role(String changed_by_role) { this.changed_by_role = changed_by_role; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getChanged_at() { return changed_at; }
    public void setChanged_at(LocalDateTime changed_at) { this.changed_at = changed_at; }

    @Override
    public String toString() {
        return "BookingStatusHistory{" + "id=" + id + ", " + previous_status + " -> " + new_status + '}';
    }
}
