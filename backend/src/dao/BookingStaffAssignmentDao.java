package dao;

import model.BookingStaffAssignment;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BookingStaffAssignmentDao {

    public void insertBookingStaffAssignment(BookingStaffAssignment assignment) {
        String sql = "INSERT INTO booking_staff_assignments (id, booking_id, staff_id, assigned_by, status, assigned_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, assignment.getId().toString());
            pstmt.setString(2, assignment.getBooking_id().toString());
            pstmt.setString(3, assignment.getStaff_id().toString());
            pstmt.setString(4, assignment.getAssigned_by().toString());
            pstmt.setString(5, assignment.getStatus());
            pstmt.setTimestamp(6, Timestamp.valueOf(assignment.getAssigned_at()));
            pstmt.setTimestamp(7, Timestamp.valueOf(assignment.getUpdated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting booking staff assignment", e);
        }
    }

    public BookingStaffAssignment getAssignmentById(UUID id) {
        String sql = "SELECT * FROM booking_staff_assignments WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToAssignment(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving booking staff assignment", e);
        }
        return null;
    }

    public List<BookingStaffAssignment> getAssignmentsByBookingId(UUID bookingId) {
        String sql = "SELECT * FROM booking_staff_assignments WHERE booking_id = ? ORDER BY assigned_at DESC";
        List<BookingStaffAssignment> assignments = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, bookingId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                assignments.add(mapResultSetToAssignment(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving assignments by booking", e);
        }
        return assignments;
    }

    public List<BookingStaffAssignment> getAssignmentsByStaffId(UUID staffId) {
        String sql = "SELECT * FROM booking_staff_assignments WHERE staff_id = ? ORDER BY assigned_at DESC";
        List<BookingStaffAssignment> assignments = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staffId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                assignments.add(mapResultSetToAssignment(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving assignments by staff", e);
        }
        return assignments;
    }

    public List<BookingStaffAssignment> getAssignmentsByStatus(String status) {
        String sql = "SELECT * FROM booking_staff_assignments WHERE status = ? ORDER BY assigned_at DESC";
        List<BookingStaffAssignment> assignments = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, status);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                assignments.add(mapResultSetToAssignment(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving assignments by status", e);
        }
        return assignments;
    }

    public void updateAssignmentStatus(UUID id, String status) {
        String sql = "UPDATE booking_staff_assignments SET status = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, status);
            pstmt.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(3, id.toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating assignment status", e);
        }
    }

    public void deleteAssignment(UUID id) {
        String sql = "DELETE FROM booking_staff_assignments WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting booking staff assignment", e);
        }
    }

    private BookingStaffAssignment mapResultSetToAssignment(ResultSet rs) throws SQLException {
        BookingStaffAssignment assignment = new BookingStaffAssignment();
        assignment.setId(UUID.fromString(rs.getString("id")));
        assignment.setBooking_id(UUID.fromString(rs.getString("booking_id")));
        assignment.setStaff_id(UUID.fromString(rs.getString("staff_id")));
        assignment.setAssigned_by(UUID.fromString(rs.getString("assigned_by")));
        assignment.setStatus(rs.getString("status"));
        
        Timestamp assignedAt = rs.getTimestamp("assigned_at");
        if (assignedAt != null) {
            assignment.setAssigned_at(assignedAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            assignment.setUpdated_at(updatedAt.toLocalDateTime());
        }
        
        return assignment;
    }
}
