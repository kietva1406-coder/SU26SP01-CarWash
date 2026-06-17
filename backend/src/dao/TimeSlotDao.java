package dao;

import model.TimeSlot;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class TimeSlotDao {

    public void insertTimeSlot(TimeSlot timeSlot) {
        String sql = "INSERT INTO time_slots (id, slot_date, slot_time, max_capacity, current_bookings, duration_minutes, is_locked, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, timeSlot.getId().toString());
            pstmt.setDate(2, java.sql.Date.valueOf(timeSlot.getSlot_date()));
            pstmt.setTime(3, java.sql.Time.valueOf(timeSlot.getSlot_time()));
            pstmt.setInt(4, timeSlot.getMax_capacity());
            pstmt.setInt(5, timeSlot.getCurrent_bookings());
            pstmt.setInt(6, timeSlot.getDuration_minutes());
            pstmt.setBoolean(7, timeSlot.isIs_locked());
            pstmt.setTimestamp(8, Timestamp.valueOf(timeSlot.getCreated_at()));
            pstmt.setTimestamp(9, Timestamp.valueOf(timeSlot.getUpdated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting time slot", e);
        }
    }

    public TimeSlot getTimeSlotById(UUID id) {
        String sql = "SELECT * FROM time_slots WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToTimeSlot(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving time slot", e);
        }
        return null;
    }

    public List<TimeSlot> getTimeSlotsByDate(LocalDate date) {
        String sql = "SELECT * FROM time_slots WHERE slot_date = ? ORDER BY slot_time";
        List<TimeSlot> slots = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDate(1, java.sql.Date.valueOf(date));
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                slots.add(mapResultSetToTimeSlot(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving time slots by date", e);
        }
        return slots;
    }

    public List<TimeSlot> getAvailableTimeSlots(LocalDate date) {
        String sql = "SELECT * FROM time_slots WHERE slot_date = ? AND current_bookings < max_capacity AND is_locked = 0 ORDER BY slot_time";
        List<TimeSlot> slots = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setDate(1, java.sql.Date.valueOf(date));
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                slots.add(mapResultSetToTimeSlot(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving available time slots", e);
        }
        return slots;
    }

    public void updateTimeSlot(TimeSlot timeSlot) {
        String sql = "UPDATE time_slots SET max_capacity = ?, current_bookings = ?, duration_minutes = ?, is_locked = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, timeSlot.getMax_capacity());
            pstmt.setInt(2, timeSlot.getCurrent_bookings());
            pstmt.setInt(3, timeSlot.getDuration_minutes());
            pstmt.setBoolean(4, timeSlot.isIs_locked());
            pstmt.setTimestamp(5, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(6, timeSlot.getId().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating time slot", e);
        }
    }

    public void deleteTimeSlot(UUID id) {
        String sql = "DELETE FROM time_slots WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting time slot", e);
        }
    }

    private TimeSlot mapResultSetToTimeSlot(ResultSet rs) throws SQLException {
        TimeSlot timeSlot = new TimeSlot();
        timeSlot.setId(UUID.fromString(rs.getString("id")));
        timeSlot.setSlot_date(rs.getDate("slot_date").toLocalDate());
        timeSlot.setSlot_time(rs.getTime("slot_time").toLocalTime());
        timeSlot.setMax_capacity(rs.getInt("max_capacity"));
        timeSlot.setCurrent_bookings(rs.getInt("current_bookings"));
        timeSlot.setDuration_minutes(rs.getInt("duration_minutes"));
        timeSlot.setIs_locked(rs.getBoolean("is_locked"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            timeSlot.setCreated_at(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            timeSlot.setUpdated_at(updatedAt.toLocalDateTime());
        }
        
        return timeSlot;
    }
}
