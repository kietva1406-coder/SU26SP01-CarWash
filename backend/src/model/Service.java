package model;

import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;

public class Service {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price_vnd;
    private int estimated_duration_minutes;
    private int min_slot_duration_minutes;
    private boolean is_active;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Service() {
    }

    public Service(String name, BigDecimal price_vnd, int estimated_duration_minutes) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.price_vnd = price_vnd;
        this.estimated_duration_minutes = estimated_duration_minutes;
        this.min_slot_duration_minutes = 30;
        this.is_active = true;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice_vnd() { return price_vnd; }
    public void setPrice_vnd(BigDecimal price_vnd) { this.price_vnd = price_vnd; }

    public int getEstimated_duration_minutes() { return estimated_duration_minutes; }
    public void setEstimated_duration_minutes(int estimated_duration_minutes) { this.estimated_duration_minutes = estimated_duration_minutes; }

    public int getMin_slot_duration_minutes() { return min_slot_duration_minutes; }
    public void setMin_slot_duration_minutes(int min_slot_duration_minutes) { this.min_slot_duration_minutes = min_slot_duration_minutes; }

    public boolean isIs_active() { return is_active; }
    public void setIs_active(boolean is_active) { this.is_active = is_active; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public LocalDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(LocalDateTime updated_at) { this.updated_at = updated_at; }

    @Override
    public String toString() {
        return "Service{" + "id=" + id + ", name='" + name + '\'' + ", price=" + price_vnd + '}';
    }
}
