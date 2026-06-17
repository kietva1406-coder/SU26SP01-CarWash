package dao;

import model.ComboService;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ComboServiceDao {

    public void insertComboService(ComboService comboService) {
        String sql = "INSERT INTO combo_services (id, combo_id, service_id, sequence_order) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, comboService.getId().toString());
            pstmt.setString(2, comboService.getCombo_id().toString());
            pstmt.setString(3, comboService.getService_id().toString());
            pstmt.setInt(4, comboService.getSequence_order());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting combo service", e);
        }
    }

    public ComboService getComboServiceById(UUID id) {
        String sql = "SELECT * FROM combo_services WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToComboService(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving combo service", e);
        }
        return null;
    }

    public List<ComboService> getServicesByComboId(UUID comboId) {
        String sql = "SELECT * FROM combo_services WHERE combo_id = ? ORDER BY sequence_order";
        List<ComboService> services = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, comboId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                services.add(mapResultSetToComboService(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving combo services", e);
        }
        return services;
    }

    public void deleteComboService(UUID id) {
        String sql = "DELETE FROM combo_services WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting combo service", e);
        }
    }

    private ComboService mapResultSetToComboService(ResultSet rs) throws SQLException {
        ComboService comboService = new ComboService();
        comboService.setId(UUID.fromString(rs.getString("id")));
        comboService.setCombo_id(UUID.fromString(rs.getString("combo_id")));
        comboService.setService_id(UUID.fromString(rs.getString("service_id")));
        comboService.setSequence_order(rs.getInt("sequence_order"));
        return comboService;
    }
}
