package dao;

import model.CustomerVehicle;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CustomerVehicleDao {

    public void insertCustomerVehicle(CustomerVehicle vehicle) {
        String sql = "INSERT INTO customer_vehicles (id, customer_id, plate_number, vehicle_type, is_primary, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, vehicle.getId().toString());
            pstmt.setString(2, vehicle.getCustomer_id().toString());
            pstmt.setString(3, vehicle.getPlate_number());
            pstmt.setString(4, vehicle.getVehicle_type());
            pstmt.setBoolean(5, vehicle.isIs_primary());
            pstmt.setTimestamp(6, Timestamp.valueOf(vehicle.getCreated_at()));
            pstmt.setTimestamp(7, Timestamp.valueOf(vehicle.getUpdated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting customer vehicle", e);
        }
    }

    public CustomerVehicle getVehicleById(UUID id) {
        String sql = "SELECT * FROM customer_vehicles WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToVehicle(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving vehicle", e);
        }
        return null;
    }

    public List<CustomerVehicle> getVehiclesByCustomerId(UUID customerId) {
        String sql = "SELECT * FROM customer_vehicles WHERE customer_id = ? ORDER BY is_primary DESC, created_at";
        List<CustomerVehicle> vehicles = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                vehicles.add(mapResultSetToVehicle(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving customer vehicles", e);
        }
        return vehicles;
    }

    public CustomerVehicle getVehicleByPlateNumber(String plateNumber) {
        String sql = "SELECT * FROM customer_vehicles WHERE plate_number = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, plateNumber);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToVehicle(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving vehicle by plate number", e);
        }
        return null;
    }

    public void updateCustomerVehicle(CustomerVehicle vehicle) {
        String sql = "UPDATE customer_vehicles SET plate_number = ?, vehicle_type = ?, is_primary = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, vehicle.getPlate_number());
            pstmt.setString(2, vehicle.getVehicle_type());
            pstmt.setBoolean(3, vehicle.isIs_primary());
            pstmt.setTimestamp(4, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(5, vehicle.getId().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating customer vehicle", e);
        }
    }

    public void deleteCustomerVehicle(UUID id) {
        String sql = "DELETE FROM customer_vehicles WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting customer vehicle", e);
        }
    }

    private CustomerVehicle mapResultSetToVehicle(ResultSet rs) throws SQLException {
        CustomerVehicle vehicle = new CustomerVehicle();
        vehicle.setId(UUID.fromString(rs.getString("id")));
        vehicle.setCustomer_id(UUID.fromString(rs.getString("customer_id")));
        vehicle.setPlate_number(rs.getString("plate_number"));
        vehicle.setVehicle_type(rs.getString("vehicle_type"));
        vehicle.setIs_primary(rs.getBoolean("is_primary"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            vehicle.setCreated_at(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            vehicle.setUpdated_at(updatedAt.toLocalDateTime());
        }
        
        return vehicle;
    }
}
