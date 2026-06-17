package dao;

import model.Task;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class TaskDao {

    public void insertTask(Task task) {
        String sql = "INSERT INTO Task (id, bookingId, staffId, status, createdAt, updatedAt) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, task.getId());
            pstmt.setString(2, task.getBookingId());
            pstmt.setString(3, task.getStaffId());
            pstmt.setString(4, task.getStatus());
            pstmt.setTimestamp(5, Timestamp.valueOf(task.getCreatedAt()));
            pstmt.setTimestamp(6, Timestamp.valueOf(task.getUpdatedAt()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting task", e);
        }
    }

    public Task getTaskById(String id) {
        String sql = "SELECT * FROM Task WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToTask(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving task", e);
        }
        return null;
    }

    public List<Task> getTasksByBookingId(String bookingId) {
        String sql = "SELECT * FROM Task WHERE bookingId = ? ORDER BY createdAt DESC";
        List<Task> tasks = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, bookingId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                tasks.add(mapResultSetToTask(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving tasks by booking", e);
        }
        return tasks;
    }

    public List<Task> getTasksByStaffId(String staffId) {
        String sql = "SELECT * FROM Task WHERE staffId = ? ORDER BY createdAt DESC";
        List<Task> tasks = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staffId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                tasks.add(mapResultSetToTask(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving tasks by staff", e);
        }
        return tasks;
    }

    public List<Task> getTasksByStatus(String status) {
        String sql = "SELECT * FROM Task WHERE status = ? ORDER BY createdAt DESC";
        List<Task> tasks = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, status);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                tasks.add(mapResultSetToTask(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving tasks by status", e);
        }
        return tasks;
    }

    public List<Task> getAllTasks() {
        String sql = "SELECT * FROM Task ORDER BY createdAt DESC";
        List<Task> tasks = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                tasks.add(mapResultSetToTask(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all tasks", e);
        }
        return tasks;
    }

    public void updateTask(Task task) {
        String sql = "UPDATE Task SET bookingId = ?, staffId = ?, status = ?, updatedAt = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, task.getBookingId());
            pstmt.setString(2, task.getStaffId());
            pstmt.setString(3, task.getStatus());
            pstmt.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(5, task.getId());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating task", e);
        }
    }

    public void deleteTask(String id) {
        String sql = "DELETE FROM Task WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting task", e);
        }
    }

    public long getTaskCount() {
        String sql = "SELECT COUNT(*) FROM Task";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error counting tasks", e);
        }
        return 0;
    }

    private Task mapResultSetToTask(ResultSet rs) throws SQLException {
        Task task = new Task();
        task.setId(rs.getString("id"));
        task.setBookingId(rs.getString("bookingId"));
        task.setStaffId(rs.getString("staffId"));
        task.setStatus(rs.getString("status"));
        
        Timestamp createdAt = rs.getTimestamp("createdAt");
        if (createdAt != null) {
            task.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updatedAt");
        if (updatedAt != null) {
            task.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return task;
    }
}