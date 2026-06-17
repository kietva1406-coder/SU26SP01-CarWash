package dao;

import model.Customer;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CustomerDao {

    public void insertCustomer(Customer customer) {
        String sql = "INSERT INTO Customer (id, fullName, phoneNumber, createdAt, updatedAt) " +
                "VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customer.getId());
            pstmt.setString(2, customer.getFullName());
            pstmt.setString(3, customer.getPhoneNumber());
            pstmt.setTimestamp(4, Timestamp.valueOf(customer.getCreatedAt()));
            pstmt.setTimestamp(5, Timestamp.valueOf(customer.getUpdatedAt()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting customer", e);
        }
    }

    public Customer getCustomerById(String id) {
        String sql = "SELECT * FROM Customer WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToCustomer(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving customer", e);
        }
        return null;
    }

    public Customer getCustomerByPhoneNumber(String phoneNumber) {
        String sql = "SELECT * FROM Customer WHERE phoneNumber = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, phoneNumber);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToCustomer(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving customer by phone", e);
        }
        return null;
    }

    public List<Customer> getAllCustomers() {
        String sql = "SELECT * FROM Customer";
        List<Customer> customers = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                customers.add(mapResultSetToCustomer(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all customers", e);
        }
        return customers;
    }

    public void updateCustomer(Customer customer) {
        String sql = "UPDATE Customer SET fullName = ?, phoneNumber = ?, updatedAt = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customer.getFullName());
            pstmt.setString(2, customer.getPhoneNumber());
            pstmt.setTimestamp(3, Timestamp.valueOf(java.time.LocalDateTime.now()));
            pstmt.setString(4, customer.getId());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating customer", e);
        }
    }

    public void deleteCustomer(String id) {
        String sql = "DELETE FROM Customer WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting customer", e);
        }
    }

    public long getCustomerCount() {
        String sql = "SELECT COUNT(*) FROM Customer";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error counting customers", e);
        }
        return 0;
    }

    private Customer mapResultSetToCustomer(ResultSet rs) throws SQLException {
        Customer customer = new Customer();
        customer.setId(rs.getString("id"));
        customer.setFullName(rs.getString("fullName"));
        customer.setPhoneNumber(rs.getString("phoneNumber"));
        
        Timestamp createdAt = rs.getTimestamp("createdAt");
        if (createdAt != null) {
            customer.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updatedAt");
        if (updatedAt != null) {
            customer.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return customer;
    }
}
