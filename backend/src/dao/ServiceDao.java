package dao;

import model.Service;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ServiceDao {

    public void insertService(Service service) {
        String sql = "INSERT INTO services (id, name, description, price_vnd, estimated_duration_minutes, min_slot_duration_minutes, is_active, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, service.getId().toString());
            pstmt.setString(2, service.getName());
            pstmt.setString(3, service.getDescription());
            pstmt.setBigDecimal(4, service.getPrice_vnd());
            pstmt.setInt(5, service.getEstimated_duration_minutes());
            pstmt.setInt(6, service.getMin_slot_duration_minutes());
            pstmt.setBoolean(7, service.isIs_active());
            pstmt.setTimestamp(8, Timestamp.valueOf(service.getCreated_at()));
            pstmt.setTimestamp(9, Timestamp.valueOf(service.getUpdated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting service", e);
        }
    }

    public Service getServiceById(UUID id) {
        String sql = "SELECT * FROM services WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToService(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving service", e);
        }
        return null;
    }

    public List<Service> getAllActiveServices() {
        String sql = "SELECT * FROM services WHERE is_active = 1 ORDER BY name";
        List<Service> services = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                services.add(mapResultSetToService(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all services", e);
        }
        return services;
    }

    public List<Service> getAllServices() {
        String sql = "SELECT * FROM services ORDER BY name";
        List<Service> services = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                services.add(mapResultSetToService(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all services", e);
        }
        return services;
    }

    public void updateService(Service service) {
        String sql = "UPDATE services SET name = ?, description = ?, price_vnd = ?, estimated_duration_minutes = ?, min_slot_duration_minutes = ?, is_active = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, service.getName());
            pstmt.setString(2, service.getDescription());
            pstmt.setBigDecimal(3, service.getPrice_vnd());
            pstmt.setInt(4, service.getEstimated_duration_minutes());
            pstmt.setInt(5, service.getMin_slot_duration_minutes());
            pstmt.setBoolean(6, service.isIs_active());
            pstmt.setTimestamp(7, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(8, service.getId().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating service", e);
        }
    }

    public void deleteService(UUID id) {
        String sql = "DELETE FROM services WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting service", e);
        }
    }

    private Service mapResultSetToService(ResultSet rs) throws SQLException {
        Service service = new Service();
        service.setId(UUID.fromString(rs.getString("id")));
        service.setName(rs.getString("name"));
        service.setDescription(rs.getString("description"));
        service.setPrice_vnd(rs.getBigDecimal("price_vnd"));
        service.setEstimated_duration_minutes(rs.getInt("estimated_duration_minutes"));
        service.setMin_slot_duration_minutes(rs.getInt("min_slot_duration_minutes"));
        service.setIs_active(rs.getBoolean("is_active"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            service.setCreated_at(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            service.setUpdated_at(updatedAt.toLocalDateTime());
        }
        
        return service;
    }
}
