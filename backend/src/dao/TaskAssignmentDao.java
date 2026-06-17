package dao;

import model.TaskAssignment;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TaskAssignmentDao {

    public void insertTaskAssignment(TaskAssignment assignment) {
        String sql = "INSERT INTO TaskAssignment (taskId, staffId, assignedBy, assignedAt, checkinAt, checkoutAt) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, assignment.getTaskId().toString());
            pstmt.setString(2, assignment.getStaffId());
            pstmt.setString(3, assignment.getAssignedBy());
            pstmt.setTimestamp(4, Timestamp.valueOf(assignment.getAssignedAt()));
            pstmt.setTimestamp(5, assignment.getCheckinAt() != null ? Timestamp.valueOf(assignment.getCheckinAt()) : null);
            pstmt.setTimestamp(6, assignment.getCheckoutAt() != null ? Timestamp.valueOf(assignment.getCheckoutAt()) : null);

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting task assignment", e);
        }
    }

    public TaskAssignment getTaskAssignmentById(String taskId, String staffId) {
        String sql = "SELECT * FROM TaskAssignment WHERE taskId = ? AND staffId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, taskId);
            pstmt.setString(2, staffId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToTaskAssignment(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving task assignment", e);
        }
        return null;
    }

    public List<TaskAssignment> getAssignmentsByTaskId(String taskId) {
        String sql = "SELECT * FROM TaskAssignment WHERE taskId = ? ORDER BY assignedAt DESC";
        List<TaskAssignment> assignments = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, taskId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                assignments.add(mapResultSetToTaskAssignment(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving assignments by task", e);
        }
        return assignments;
    }

    public List<TaskAssignment> getAssignmentsByStaffId(String staffId) {
        String sql = "SELECT * FROM TaskAssignment WHERE staffId = ? ORDER BY assignedAt DESC";
        List<TaskAssignment> assignments = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staffId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                assignments.add(mapResultSetToTaskAssignment(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving assignments by staff", e);
        }
        return assignments;
    }

    public List<TaskAssignment> getAllTaskAssignments() {
        String sql = "SELECT * FROM TaskAssignment ORDER BY assignedAt DESC";
        List<TaskAssignment> assignments = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                assignments.add(mapResultSetToTaskAssignment(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all task assignments", e);
        }
        return assignments;
    }

    public void updateTaskAssignmentCheckIn(String taskId, String staffId) {
        String sql = "UPDATE TaskAssignment SET checkinAt = ? WHERE taskId = ? AND staffId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(2, taskId);
            pstmt.setString(3, staffId);

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating check in", e);
        }
    }

    public void updateTaskAssignmentCheckOut(String taskId, String staffId) {
        String sql = "UPDATE TaskAssignment SET checkoutAt = ? WHERE taskId = ? AND staffId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(2, taskId);
            pstmt.setString(3, staffId);

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating check out", e);
        }
    }

    public void deleteTaskAssignment(String taskId, String staffId) {
        String sql = "DELETE FROM TaskAssignment WHERE taskId = ? AND staffId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, taskId);
            pstmt.setString(2, staffId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting task assignment", e);
        }
    }

    public long getAssignmentCountByStaffId(String staffId) {
        String sql = "SELECT COUNT(*) FROM TaskAssignment WHERE staffId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staffId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error counting assignments", e);
        }
        return 0;
    }

    private TaskAssignment mapResultSetToTaskAssignment(ResultSet rs) throws SQLException {
        TaskAssignment assignment = new TaskAssignment();
        
        String id = rs.getString("id");
        if (id != null) {
            assignment.setId(java.util.UUID.fromString(id));
        }
        
        String taskId = rs.getString("taskId");
        if (taskId != null) {
            assignment.setTaskId(java.util.UUID.fromString(taskId));
        }
        
        assignment.setStaffId(rs.getString("staffId"));
        assignment.setAssignedBy(rs.getString("assignedBy"));
        
        Timestamp assignedAt = rs.getTimestamp("assignedAt");
        if (assignedAt != null) {
            assignment.setAssignedAt(assignedAt.toLocalDateTime());
        }
        
        Timestamp checkinAt = rs.getTimestamp("checkinAt");
        if (checkinAt != null) {
            assignment.setCheckinAt(checkinAt.toLocalDateTime());
        }
        
        Timestamp checkoutAt = rs.getTimestamp("checkoutAt");
        if (checkoutAt != null) {
            assignment.setCheckoutAt(checkoutAt.toLocalDateTime());
        }
        
        return assignment;
    }
}
