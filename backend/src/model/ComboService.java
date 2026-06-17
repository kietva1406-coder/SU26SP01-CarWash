package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class ComboService {
    private UUID id;
    private UUID combo_id;
    private UUID service_id;
    private LocalDateTime created_at;

    public ComboService() {}

    public ComboService(UUID combo_id, UUID service_id) {
        this.id = UUID.randomUUID();
        this.combo_id = combo_id;
        this.service_id = service_id;
        this.created_at = LocalDateTime.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getCombo_id() { return combo_id; }
    public void setCombo_id(UUID combo_id) { this.combo_id = combo_id; }

    public UUID getService_id() { return service_id; }
    public void setService_id(UUID service_id) { this.service_id = service_id; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    @Override
    public String toString() {
        return "ComboService{" + "id=" + id + ", combo_id=" + combo_id + ", service_id=" + service_id + '}';
    }
}
