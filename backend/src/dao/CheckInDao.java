package dao;

import model.CheckIn;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CheckInDao {

    public void insertCheckIn(CheckIn checkIn) {
        String sql = "INSERT INTO CheckIn (id, taskId, staffId, checkinAt, notes, createdAt) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, checkIn.getId());
            pstmt.setString(2, checkIn.getTaskId());
            pstmt.setString(3, checkIn.getStaffId());
            pstmt.setTimestamp(4, Timestamp.valueOf(checkIn.getCheckinAt()));
            pstmt.setString(5, checkIn.getNotes());
            pstmt.setTimestamp(6, Timestamp.valueOf(checkIn.getCreatedAt()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting check in", e);
        }
    }

    public CheckIn getCheckInById(String id) {
        String sql = "SELECT * FROM CheckIn WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToCheckIn(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving check in", e);
        }
        return null;
    }

    public CheckIn getCheckInByTaskId(String taskId) {
        String sql = "SELECT * FROM CheckIn WHERE taskId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, taskId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToCheckIn(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving check in by task", e);
        }
        return null;
    }

    public List<CheckIn> getCheckInsByStaffId(String staffId) {
        String sql = "SELECT * FROM CheckIn WHERE staffId = ? ORDER BY checkinAt DESC";
        List<CheckIn> checkIns = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staffId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                checkIns.add(mapResultSetToCheckIn(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving check ins by staff", e);
        }
        return checkIns;
    }

    public List<CheckIn> getAllCheckIns() {
        String sql = "SELECT * FROM CheckIn ORDER BY checkinAt DESC";
        List<CheckIn> checkIns = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                checkIns.add(mapResultSetToCheckIn(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all check ins", e);
        }
        return checkIns;
    }

    public void updateCheckIn(CheckIn checkIn) {
        String sql = "UPDATE CheckIn SET taskId = ?, staffId = ?, checkinAt = ?, notes = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, checkIn.getTaskId());
            pstmt.setString(2, checkIn.getStaffId());
            pstmt.setTimestamp(3, Timestamp.valueOf(checkIn.getCheckinAt()));
            pstmt.setString(4, checkIn.getNotes());
            pstmt.setString(5, checkIn.getId());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating check in", e);
        }
    }

    public void deleteCheckIn(String id) {
        String sql = "DELETE FROM CheckIn WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting check in", e);
        }
    }

    private CheckIn mapResultSetToCheckIn(ResultSet rs) throws SQLException {
        CheckIn checkIn = new CheckIn();
        checkIn.setId(rs.getString("id"));
        checkIn.setTaskId(rs.getString("taskId"));
        checkIn.setStaffId(rs.getString("staffId"));
        
        Timestamp checkinAt = rs.getTimestamp("checkinAt");
        if (checkinAt != null) {
            checkIn.setCheckinAt(checkinAt.toLocalDateTime());
        }
        
        checkIn.setNotes(rs.getString("notes"));
        
        Timestamp createdAt = rs.getTimestamp("createdAt");
        if (createdAt != null) {
            checkIn.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        return checkIn;
    }
}
