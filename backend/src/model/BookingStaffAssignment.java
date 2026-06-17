package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class BookingStaffAssignment {
    private UUID id;
    private UUID booking_id;
    private UUID staff_id;
    private UUID assigned_by;
    private LocalDateTime assigned_at;
    private String status; // ASSIGNED, IN_PROGRESS, COMPLETED, CANCELLED
    private LocalDateTime created_at;

    public BookingStaffAssignment() {}

    public BookingStaffAssignment(UUID booking_id, UUID staff_id, UUID assigned_by) {
        this.id = UUID.randomUUID();
        this.booking_id = booking_id;
        this.staff_id = staff_id;
        this.assigned_by = assigned_by;
        this.assigned_at = LocalDateTime.now();
        this.status = "ASSIGNED";
        this.created_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBooking_id() { return booking_id; }
    public void setBooking_id(UUID booking_id) { this.booking_id = booking_id; }

    public UUID getStaff_id() { return staff_id; }
    public void setStaff_id(UUID staff_id) { this.staff_id = staff_id; }

    public UUID getAssigned_by() { return assigned_by; }
    public void setAssigned_by(UUID assigned_by) { this.assigned_by = assigned_by; }

    public LocalDateTime getAssigned_at() { return assigned_at; }
    public void setAssigned_at(LocalDateTime assigned_at) { this.assigned_at = assigned_at; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    @Override
    public String toString() {
        return "BookingStaffAssignment{" + "id=" + id + ", status='" + status + '\'' + '}';
    }
}
