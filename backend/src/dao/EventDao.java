package dao;

import model.Event;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class EventDao {

    public void insertEvent(Event event) {
        String sql = "INSERT INTO events (id, title, description, short_description, banner_url, thumbnail_url, event_type, " +
                "start_date, end_date, linked_voucher_id, priority, is_visible, view_count, created_by, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, event.getId().toString());
            pstmt.setString(2, event.getTitle());
            pstmt.setString(3, event.getDescription());
            pstmt.setString(4, event.getShort_description());
            pstmt.setString(5, event.getBanner_url());
            pstmt.setString(6, event.getThumbnail_url());
            pstmt.setString(7, event.getEvent_type());
            pstmt.setTimestamp(8, Timestamp.valueOf(event.getStart_date()));
            pstmt.setTimestamp(9, Timestamp.valueOf(event.getEnd_date()));
            
            if (event.getLinked_voucher_id() != null) {
                pstmt.setString(10, event.getLinked_voucher_id().toString());
            } else {
                pstmt.setNull(10, Types.VARCHAR);
            }
            
            pstmt.setInt(11, event.getPriority());
            pstmt.setBoolean(12, event.isIs_visible());
            pstmt.setInt(13, event.getView_count());
            pstmt.setString(14, event.getCreated_by().toString());
            pstmt.setTimestamp(15, Timestamp.valueOf(event.getCreated_at()));
            pstmt.setTimestamp(16, Timestamp.valueOf(event.getUpdated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting event", e);
        }
    }

    public Event getEventById(UUID id) {
        String sql = "SELECT * FROM events WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToEvent(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving event", e);
        }
        return null;
    }

    public List<Event> getVisibleEvents() {
        String sql = "SELECT * FROM events WHERE is_visible = 1 AND CAST(GETDATE() AS DATE) BETWEEN start_date AND end_date ORDER BY priority DESC, start_date";
        List<Event> events = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                events.add(mapResultSetToEvent(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving visible events", e);
        }
        return events;
    }

    public List<Event> getAllEvents() {
        String sql = "SELECT * FROM events ORDER BY start_date DESC";
        List<Event> events = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                events.add(mapResultSetToEvent(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all events", e);
        }
        return events;
    }

    public void updateEvent(Event event) {
        String sql = "UPDATE events SET title = ?, description = ?, short_description = ?, banner_url = ?, thumbnail_url = ?, " +
                "event_type = ?, start_date = ?, end_date = ?, linked_voucher_id = ?, priority = ?, is_visible = ?, view_count = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, event.getTitle());
            pstmt.setString(2, event.getDescription());
            pstmt.setString(3, event.getShort_description());
            pstmt.setString(4, event.getBanner_url());
            pstmt.setString(5, event.getThumbnail_url());
            pstmt.setString(6, event.getEvent_type());
            pstmt.setTimestamp(7, Timestamp.valueOf(event.getStart_date()));
            pstmt.setTimestamp(8, Timestamp.valueOf(event.getEnd_date()));
            
            if (event.getLinked_voucher_id() != null) {
                pstmt.setString(9, event.getLinked_voucher_id().toString());
            } else {
                pstmt.setNull(9, Types.VARCHAR);
            }
            
            pstmt.setInt(10, event.getPriority());
            pstmt.setBoolean(11, event.isIs_visible());
            pstmt.setInt(12, event.getView_count());
            pstmt.setTimestamp(13, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(14, event.getId().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating event", e);
        }
    }

    public void deleteEvent(UUID id) {
        String sql = "DELETE FROM events WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting event", e);
        }
    }

    private Event mapResultSetToEvent(ResultSet rs) throws SQLException {
        Event event = new Event();
        event.setId(UUID.fromString(rs.getString("id")));
        event.setTitle(rs.getString("title"));
        event.setDescription(rs.getString("description"));
        event.setShort_description(rs.getString("short_description"));
        event.setBanner_url(rs.getString("banner_url"));
        event.setThumbnail_url(rs.getString("thumbnail_url"));
        event.setEvent_type(rs.getString("event_type"));
        Timestamp startDate = rs.getTimestamp("start_date");
        if (startDate != null) {
            event.setStart_date(startDate.toLocalDateTime());
        }
        
        Timestamp endDate = rs.getTimestamp("end_date");
        if (endDate != null) {
            event.setEnd_date(endDate.toLocalDateTime());
        }
        
        String linkedVoucherId = rs.getString("linked_voucher_id");
        if (linkedVoucherId != null) {
            event.setLinked_voucher_id(UUID.fromString(linkedVoucherId));
        }
        
        event.setPriority(rs.getInt("priority"));
        event.setIs_visible(rs.getBoolean("is_visible"));
        event.setView_count(rs.getInt("view_count"));
        event.setCreated_by(UUID.fromString(rs.getString("created_by")));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            event.setCreated_at(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            event.setUpdated_at(updatedAt.toLocalDateTime());
        }
        
        return event;
    }
}
