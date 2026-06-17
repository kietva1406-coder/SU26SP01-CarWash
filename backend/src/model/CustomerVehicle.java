package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class CustomerVehicle {
    private UUID id;
    private UUID customer_id;
    private String plate_number;
    private String vehicle_type; // sedan, suv, truck, van, motorcycle
    private boolean is_primary;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public CustomerVehicle() {
    }

    public CustomerVehicle(UUID customer_id, String plate_number, String vehicle_type) {
        this.id = UUID.randomUUID();
        this.customer_id = customer_id;
        this.plate_number = plate_number;
        this.vehicle_type = vehicle_type;
        this.is_primary = false;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCustomer_id() { return customer_id; }
    public void setCustomer_id(UUID customer_id) { this.customer_id = customer_id; }

    public String getPlate_number() { return plate_number; }
    public void setPlate_number(String plate_number) { this.plate_number = plate_number; }

    public String getVehicle_type() { return vehicle_type; }
    public void setVehicle_type(String vehicle_type) { this.vehicle_type = vehicle_type; }

    public boolean isIs_primary() { return is_primary; }
    public void setIs_primary(boolean is_primary) { this.is_primary = is_primary; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public LocalDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(LocalDateTime updated_at) { this.updated_at = updated_at; }

    @Override
    public String toString() {
        return "CustomerVehicle{" + "id=" + id + ", plate_number='" + plate_number + '\'' + '}';
    }
}
