package model;

import java.time.LocalDateTime;
import java.util.UUID;
import java.math.BigDecimal;

public class Combo {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal total_price_vnd;
    private int total_duration_minutes;
    private BigDecimal discount_percent;
    private boolean is_active;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Combo() {
    }

    public Combo(String name, BigDecimal total_price_vnd, int total_duration_minutes) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.total_price_vnd = total_price_vnd;
        this.total_duration_minutes = total_duration_minutes;
        this.discount_percent = BigDecimal.ZERO;
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

    public BigDecimal getTotal_price_vnd() { return total_price_vnd; }
    public void setTotal_price_vnd(BigDecimal total_price_vnd) { this.total_price_vnd = total_price_vnd; }

    public int getTotal_duration_minutes() { return total_duration_minutes; }
    public void setTotal_duration_minutes(int total_duration_minutes) { this.total_duration_minutes = total_duration_minutes; }

    public BigDecimal getDiscount_percent() { return discount_percent; }
    public void setDiscount_percent(BigDecimal discount_percent) { this.discount_percent = discount_percent; }

    public boolean isIs_active() { return is_active; }
    public void setIs_active(boolean is_active) { this.is_active = is_active; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public LocalDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(LocalDateTime updated_at) { this.updated_at = updated_at; }

    @Override
    public String toString() {
        return "Combo{" + "id=" + id + ", name='" + name + '\'' + ", price=" + total_price_vnd + '}';
    }
}
