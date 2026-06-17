package dao;

import model.Combo;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ComboDao {

    public void insertCombo(Combo combo) {
        String sql = "INSERT INTO combos (id, name, description, total_price_vnd, total_duration_minutes, discount_percent, is_active, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, combo.getId().toString());
            pstmt.setString(2, combo.getName());
            pstmt.setString(3, combo.getDescription());
            pstmt.setBigDecimal(4, combo.getTotal_price_vnd());
            pstmt.setInt(5, combo.getTotal_duration_minutes());
            pstmt.setBigDecimal(6, combo.getDiscount_percent());
            pstmt.setBoolean(7, combo.isIs_active());
            pstmt.setTimestamp(8, Timestamp.valueOf(combo.getCreated_at()));
            pstmt.setTimestamp(9, Timestamp.valueOf(combo.getUpdated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting combo", e);
        }
    }

    public Combo getComboById(UUID id) {
        String sql = "SELECT * FROM combos WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToCombo(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving combo", e);
        }
        return null;
    }

    public List<Combo> getAllActiveCombos() {
        String sql = "SELECT * FROM combos WHERE is_active = 1 ORDER BY name";
        List<Combo> combos = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                combos.add(mapResultSetToCombo(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all combos", e);
        }
        return combos;
    }

    public List<Combo> getAllCombos() {
        String sql = "SELECT * FROM combos ORDER BY name";
        List<Combo> combos = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                combos.add(mapResultSetToCombo(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all combos", e);
        }
        return combos;
    }

    public void updateCombo(Combo combo) {
        String sql = "UPDATE combos SET name = ?, description = ?, total_price_vnd = ?, total_duration_minutes = ?, discount_percent = ?, is_active = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, combo.getName());
            pstmt.setString(2, combo.getDescription());
            pstmt.setBigDecimal(3, combo.getTotal_price_vnd());
            pstmt.setInt(4, combo.getTotal_duration_minutes());
            pstmt.setBigDecimal(5, combo.getDiscount_percent());
            pstmt.setBoolean(6, combo.isIs_active());
            pstmt.setTimestamp(7, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(8, combo.getId().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating combo", e);
        }
    }

    public void deleteCombo(UUID id) {
        String sql = "DELETE FROM combos WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting combo", e);
        }
    }

    private Combo mapResultSetToCombo(ResultSet rs) throws SQLException {
        Combo combo = new Combo();
        combo.setId(UUID.fromString(rs.getString("id")));
        combo.setName(rs.getString("name"));
        combo.setDescription(rs.getString("description"));
        combo.setTotal_price_vnd(rs.getBigDecimal("total_price_vnd"));
        combo.setTotal_duration_minutes(rs.getInt("total_duration_minutes"));
        combo.setDiscount_percent(rs.getBigDecimal("discount_percent"));
        combo.setIs_active(rs.getBoolean("is_active"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            combo.setCreated_at(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            combo.setUpdated_at(updatedAt.toLocalDateTime());
        }
        
        return combo;
    }
}
