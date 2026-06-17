package model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public class CustomerLoyalty {
    private UUID id;
    private UUID customer_id;
    private int total_points;
    private int lifetime_points;
    private String tier; // UNRANK, BRONZE, SILVER, GOLD, PLATINUM
    private int transaction_count;
    private LocalDate birthday;
    private LocalDate last_service_date;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public CustomerLoyalty() {
    }

    public CustomerLoyalty(UUID customer_id) {
        this.id = UUID.randomUUID();
        this.customer_id = customer_id;
        this.total_points = 0;
        this.lifetime_points = 0;
        this.tier = "UNRANK";
        this.transaction_count = 0;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCustomer_id() { return customer_id; }
    public void setCustomer_id(UUID customer_id) { this.customer_id = customer_id; }

    public int getTotal_points() { return total_points; }
    public void setTotal_points(int total_points) { this.total_points = total_points; }

    public int getLifetime_points() { return lifetime_points; }
    public void setLifetime_points(int lifetime_points) { this.lifetime_points = lifetime_points; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public int getTransaction_count() { return transaction_count; }
    public void setTransaction_count(int transaction_count) { this.transaction_count = transaction_count; }

    public LocalDate getBirthday() { return birthday; }
    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }

    public LocalDate getLast_service_date() { return last_service_date; }
    public void setLast_service_date(LocalDate last_service_date) { this.last_service_date = last_service_date; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public LocalDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(LocalDateTime updated_at) { this.updated_at = updated_at; }

    @Override
    public String toString() {
        return "CustomerLoyalty{" + "id=" + id + ", tier='" + tier + '\'' + ", points=" + total_points + '}';
    }
}
