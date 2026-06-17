package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class PointsDecayRecord {
    private UUID id;
    private UUID customer_id;
    private String month; // YYYY-MM format
    private int points_deducted;
    private String reason;
    private LocalDateTime created_at;

    public PointsDecayRecord() {}

    public PointsDecayRecord(UUID customer_id, String month, int points_deducted) {
        this.id = UUID.randomUUID();
        this.customer_id = customer_id;
        this.month = month;
        this.points_deducted = points_deducted;
        this.created_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCustomer_id() { return customer_id; }
    public void setCustomer_id(UUID customer_id) { this.customer_id = customer_id; }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public int getPoints_deducted() { return points_deducted; }
    public void setPoints_deducted(int points_deducted) { this.points_deducted = points_deducted; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    @Override
    public String toString() {
        return "PointsDecayRecord{" + "id=" + id + ", month='" + month + '\'' + ", points=" + points_deducted + '}';
    }
}
