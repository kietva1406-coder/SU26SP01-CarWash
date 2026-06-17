package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class LoyaltyTransaction {
    private UUID id;
    private UUID customer_id;
    private UUID booking_id;
    private int points;
    private String transaction_type;
    private String description;
    private String status; // PENDING, COMPLETED, CANCELLED
    private LocalDateTime completed_at;
    private LocalDateTime created_at;

    public LoyaltyTransaction() {}

    public LoyaltyTransaction(UUID customer_id, UUID booking_id, int points, String transaction_type) {
        this.id = UUID.randomUUID();
        this.customer_id = customer_id;
        this.booking_id = booking_id;
        this.points = points;
        this.transaction_type = transaction_type;
        this.status = "PENDING";
        this.created_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCustomer_id() { return customer_id; }
    public void setCustomer_id(UUID customer_id) { this.customer_id = customer_id; }

    public UUID getBooking_id() { return booking_id; }
    public void setBooking_id(UUID booking_id) { this.booking_id = booking_id; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }

    public String getTransaction_type() { return transaction_type; }
    public void setTransaction_type(String transaction_type) { this.transaction_type = transaction_type; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCompleted_at() { return completed_at; }
    public void setCompleted_at(LocalDateTime completed_at) { this.completed_at = completed_at; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    @Override
    public String toString() {
        return "LoyaltyTransaction{" + "id=" + id + ", points=" + points + ", type='" + transaction_type + '\'' + '}';
    }
}
