package model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

public class TimeSlot {
    private UUID id;
    private LocalDate slot_date;
    private LocalTime slot_time;
    private int max_capacity;
    private int current_bookings;
    private int duration_minutes;
    private boolean is_locked;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public TimeSlot() {
    }

    public TimeSlot(LocalDate slot_date, LocalTime slot_time, int max_capacity, int duration_minutes) {
        this.id = UUID.randomUUID();
        this.slot_date = slot_date;
        this.slot_time = slot_time;
        this.max_capacity = max_capacity;
        this.current_bookings = 0;
        this.duration_minutes = duration_minutes;
        this.is_locked = false;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public LocalDate getSlot_date() { return slot_date; }
    public void setSlot_date(LocalDate slot_date) { this.slot_date = slot_date; }

    public LocalTime getSlot_time() { return slot_time; }
    public void setSlot_time(LocalTime slot_time) { this.slot_time = slot_time; }

    public int getMax_capacity() { return max_capacity; }
    public void setMax_capacity(int max_capacity) { this.max_capacity = max_capacity; }

    public int getCurrent_bookings() { return current_bookings; }
    public void setCurrent_bookings(int current_bookings) { this.current_bookings = current_bookings; }

    public int getDuration_minutes() { return duration_minutes; }
    public void setDuration_minutes(int duration_minutes) { this.duration_minutes = duration_minutes; }

    public boolean isIs_locked() { return is_locked; }
    public void setIs_locked(boolean is_locked) { this.is_locked = is_locked; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public LocalDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(LocalDateTime updated_at) { this.updated_at = updated_at; }

    @Override
    public String toString() {
        return "TimeSlot{" + "id=" + id + ", slot_date=" + slot_date + ", slot_time=" + slot_time + '}';
    }
}
