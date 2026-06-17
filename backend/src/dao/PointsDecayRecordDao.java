package dao;

import model.PointsDecayRecord;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PointsDecayRecordDao {

    public void insertPointsDecayRecord(PointsDecayRecord record) {
        String sql = "INSERT INTO points_decay_records (id, customer_id, month, points_deducted, created_at) VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, record.getId().toString());
            pstmt.setString(2, record.getCustomer_id().toString());
            pstmt.setString(3, record.getMonth());
            pstmt.setInt(4, record.getPoints_deducted());
            pstmt.setTimestamp(5, Timestamp.valueOf(record.getCreated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting points decay record", e);
        }
    }

    public PointsDecayRecord getPointsDecayRecordById(UUID id) {
        String sql = "SELECT * FROM points_decay_records WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToPointsDecayRecord(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving points decay record", e);
        }
        return null;
    }

    public List<PointsDecayRecord> getRecordsByCustomerId(UUID customerId) {
        String sql = "SELECT * FROM points_decay_records WHERE customer_id = ? ORDER BY month DESC";
        List<PointsDecayRecord> records = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                records.add(mapResultSetToPointsDecayRecord(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving points decay records", e);
        }
        return records;
    }

    public List<PointsDecayRecord> getRecordsByMonth(String month) {
        String sql = "SELECT * FROM points_decay_records WHERE month = ? ORDER BY created_at DESC";
        List<PointsDecayRecord> records = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, month);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                records.add(mapResultSetToPointsDecayRecord(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving records by month", e);
        }
        return records;
    }

    public void deletePointsDecayRecord(UUID id) {
        String sql = "DELETE FROM points_decay_records WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting points decay record", e);
        }
    }

    private PointsDecayRecord mapResultSetToPointsDecayRecord(ResultSet rs) throws SQLException {
        PointsDecayRecord record = new PointsDecayRecord();
        record.setId(UUID.fromString(rs.getString("id")));
        record.setCustomer_id(UUID.fromString(rs.getString("customer_id")));
        record.setMonth(rs.getString("month"));
        record.setPoints_deducted(rs.getInt("points_deducted"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            record.setCreated_at(createdAt.toLocalDateTime());
        }
        
        return record;
    }
}
