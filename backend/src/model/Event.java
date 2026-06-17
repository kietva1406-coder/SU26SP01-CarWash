package model;

import java.time.LocalDateTime;
import java.util.UUID;

public class Event {
    private UUID id;
    private String title;
    private String description;
    private String short_description;
    private String banner_url;
    private String thumbnail_url;
    private String event_type;
    private LocalDateTime start_date;
    private LocalDateTime end_date;
    private UUID linked_voucher_id;
    private String linked_voucher_code;
    private int priority;
    private boolean is_visible;
    private int view_count;
    private UUID created_by;
    private LocalDateTime created_at;
    private LocalDateTime updated_at;

    public Event() {
    }

    public Event(String title, String event_type, LocalDateTime start_date, LocalDateTime end_date, UUID created_by) {
        this.id = UUID.randomUUID();
        this.title = title;
        this.event_type = event_type;
        this.start_date = start_date;
        this.end_date = end_date;
        this.created_by = created_by;
        this.is_visible = true;
        this.view_count = 0;
        this.created_at = LocalDateTime.now();
        this.updated_at = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getShort_description() { return short_description; }
    public void setShort_description(String short_description) { this.short_description = short_description; }

    public String getBanner_url() { return banner_url; }
    public void setBanner_url(String banner_url) { this.banner_url = banner_url; }

    public String getThumbnail_url() { return thumbnail_url; }
    public void setThumbnail_url(String thumbnail_url) { this.thumbnail_url = thumbnail_url; }

    public String getEvent_type() { return event_type; }
    public void setEvent_type(String event_type) { this.event_type = event_type; }

    public LocalDateTime getStart_date() { return start_date; }
    public void setStart_date(LocalDateTime start_date) { this.start_date = start_date; }

    public LocalDateTime getEnd_date() { return end_date; }
    public void setEnd_date(LocalDateTime end_date) { this.end_date = end_date; }

    public UUID getLinked_voucher_id() { return linked_voucher_id; }
    public void setLinked_voucher_id(UUID linked_voucher_id) { this.linked_voucher_id = linked_voucher_id; }

    public String getLinked_voucher_code() { return linked_voucher_code; }
    public void setLinked_voucher_code(String linked_voucher_code) { this.linked_voucher_code = linked_voucher_code; }

    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }

    public boolean isIs_visible() { return is_visible; }
    public void setIs_visible(boolean is_visible) { this.is_visible = is_visible; }

    public int getView_count() { return view_count; }
    public void setView_count(int view_count) { this.view_count = view_count; }

    public UUID getCreated_by() { return created_by; }
    public void setCreated_by(UUID created_by) { this.created_by = created_by; }

    public LocalDateTime getCreated_at() { return created_at; }
    public void setCreated_at(LocalDateTime created_at) { this.created_at = created_at; }

    public LocalDateTime getUpdated_at() { return updated_at; }
    public void setUpdated_at(LocalDateTime updated_at) { this.updated_at = updated_at; }

    @Override
    public String toString() {
        return "Event{" + "id=" + id + ", title='" + title + '\'' + '}';
    }
}
