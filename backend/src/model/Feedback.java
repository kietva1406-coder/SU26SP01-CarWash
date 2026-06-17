package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Feedback {
    private UUID id;
    private UUID booking_id;
    private UUID customer_id;
    private int rating; // 1-5
    private String comment;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Feedback() {
    }

    public Feedback(UUID booking_id, UUID customer_id, int rating) {
        this.id = UUID.randomUUID();
        this.booking_id = booking_id;
        this.customer_id = customer_id;
        this.rating = rating;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBooking_id() { return booking_id; }
    public void setBooking_id(UUID booking_id) { this.booking_id = booking_id; }

    public UUID getCustomer_id() { return customer_id; }
    public void setCustomer_id(UUID customer_id) { this.customer_id = customer_id; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public LocalDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(LocalDateTime updated_at) { this.updated_at = updated_at; }

    @Override
    public String toString() {
        return "Feedback{" + "id=" + id + ", rating=" + rating + '}';
    }
}
