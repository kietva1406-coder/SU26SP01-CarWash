package dao;

import model.CheckOut;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CheckOutDao {

    public void insertCheckOut(CheckOut checkOut) {
        String sql = "INSERT INTO CheckOut (id, taskId, staffId, checkoutAt, notes, createdAt) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, checkOut.getId());
            pstmt.setString(2, checkOut.getTaskId());
            pstmt.setString(3, checkOut.getStaffId());
            pstmt.setTimestamp(4, Timestamp.valueOf(checkOut.getCheckoutAt()));
            pstmt.setString(5, checkOut.getNotes());
            pstmt.setTimestamp(6, Timestamp.valueOf(checkOut.getCreatedAt()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting check out", e);
        }
    }

    public CheckOut getCheckOutById(String id) {
        String sql = "SELECT * FROM CheckOut WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToCheckOut(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving check out", e);
        }
        return null;
    }

    public CheckOut getCheckOutByTaskId(String taskId) {
        String sql = "SELECT * FROM CheckOut WHERE taskId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, taskId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToCheckOut(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving check out by task", e);
        }
        return null;
    }

    public List<CheckOut> getCheckOutsByStaffId(String staffId) {
        String sql = "SELECT * FROM CheckOut WHERE staffId = ? ORDER BY checkoutAt DESC";
        List<CheckOut> checkOuts = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staffId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                checkOuts.add(mapResultSetToCheckOut(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving check outs by staff", e);
        }
        return checkOuts;
    }

    public List<CheckOut> getAllCheckOuts() {
        String sql = "SELECT * FROM CheckOut ORDER BY checkoutAt DESC";
        List<CheckOut> checkOuts = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                checkOuts.add(mapResultSetToCheckOut(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all check outs", e);
        }
        return checkOuts;
    }

    public void updateCheckOut(CheckOut checkOut) {
        String sql = "UPDATE CheckOut SET taskId = ?, staffId = ?, checkoutAt = ?, notes = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, checkOut.getTaskId());
            pstmt.setString(2, checkOut.getStaffId());
            pstmt.setTimestamp(3, Timestamp.valueOf(checkOut.getCheckoutAt()));
            pstmt.setString(4, checkOut.getNotes());
            pstmt.setString(5, checkOut.getId());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating check out", e);
        }
    }

    public void deleteCheckOut(String id) {
        String sql = "DELETE FROM CheckOut WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting check out", e);
        }
    }

    private CheckOut mapResultSetToCheckOut(ResultSet rs) throws SQLException {
        CheckOut checkOut = new CheckOut();
        checkOut.setId(rs.getString("id"));
        checkOut.setTaskId(rs.getString("taskId"));
        checkOut.setStaffId(rs.getString("staffId"));
        
        Timestamp checkoutAt = rs.getTimestamp("checkoutAt");
        if (checkoutAt != null) {
            checkOut.setCheckoutAt(checkoutAt.toLocalDateTime());
        }
        
        checkOut.setNotes(rs.getString("notes"));
        
        Timestamp createdAt = rs.getTimestamp("createdAt");
        if (createdAt != null) {
            checkOut.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        return checkOut;
    }
}
