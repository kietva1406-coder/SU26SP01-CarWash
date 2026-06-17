package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class BookingService {
    private UUID id;
    private UUID booking_id;
    private UUID service_id;
    private LocalDateTime created_at;

    public BookingService() {}

    public BookingService(UUID booking_id, UUID service_id) {
        this.id = UUID.randomUUID();
        this.booking_id = booking_id;
        this.service_id = service_id;
        this.created_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBooking_id() { return booking_id; }
    public void setBooking_id(UUID booking_id) { this.booking_id = booking_id; }

    public UUID getService_id() { return service_id; }
    public void setService_id(UUID service_id) { this.service_id = service_id; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    @Override
    public String toString() {
        return "BookingService{" + "id=" + id + ", booking_id=" + booking_id + ", service_id=" + service_id + '}';
    }
}
