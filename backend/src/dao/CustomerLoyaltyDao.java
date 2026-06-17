package dao;

import model.CustomerLoyalty;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.UUID;

public class CustomerLoyaltyDao {

    public void insertCustomerLoyalty(CustomerLoyalty loyalty) {
        String sql = "INSERT INTO customer_loyalty (customer_id, total_points, lifetime_points, tier, transaction_count, birthday, last_service_date, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, loyalty.getCustomer_id().toString());
            pstmt.setInt(2, loyalty.getTotal_points());
            pstmt.setInt(3, loyalty.getLifetime_points());
            pstmt.setString(4, loyalty.getTier());
            pstmt.setInt(5, loyalty.getTransaction_count());
            
            if (loyalty.getBirthday() != null) {
                pstmt.setDate(6, java.sql.Date.valueOf(loyalty.getBirthday()));
            } else {
                pstmt.setNull(6, Types.DATE);
            }
            
            if (loyalty.getLast_service_date() != null) {
                pstmt.setDate(7, java.sql.Date.valueOf(loyalty.getLast_service_date()));
            } else {
                pstmt.setNull(7, Types.DATE);
            }
            
            pstmt.setTimestamp(8, Timestamp.valueOf(loyalty.getCreated_at()));
            pstmt.setTimestamp(9, Timestamp.valueOf(loyalty.getUpdated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting customer loyalty", e);
        }
    }

    public CustomerLoyalty getLoyaltyByCustomerId(UUID customerId) {
        String sql = "SELECT * FROM customer_loyalty WHERE customer_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerId.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToLoyalty(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving customer loyalty", e);
        }
        return null;
    }

    public void updateCustomerLoyalty(CustomerLoyalty loyalty) {
        String sql = "UPDATE customer_loyalty SET total_points = ?, lifetime_points = ?, tier = ?, transaction_count = ?, last_service_date = ?, updated_at = ? WHERE customer_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, loyalty.getTotal_points());
            pstmt.setInt(2, loyalty.getLifetime_points());
            pstmt.setString(3, loyalty.getTier());
            pstmt.setInt(4, loyalty.getTransaction_count());
            
            if (loyalty.getLast_service_date() != null) {
                pstmt.setDate(5, java.sql.Date.valueOf(loyalty.getLast_service_date()));
            } else {
                pstmt.setNull(5, Types.DATE);
            }
            
            pstmt.setTimestamp(6, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(7, loyalty.getCustomer_id().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating customer loyalty", e);
        }
    }

    public void deleteCustomerLoyalty(UUID customerId) {
        String sql = "DELETE FROM customer_loyalty WHERE customer_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerId.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting customer loyalty", e);
        }
    }

    private CustomerLoyalty mapResultSetToLoyalty(ResultSet rs) throws SQLException {
        CustomerLoyalty loyalty = new CustomerLoyalty();
        loyalty.setCustomer_id(UUID.fromString(rs.getString("customer_id")));
        loyalty.setTotal_points(rs.getInt("total_points"));
        loyalty.setLifetime_points(rs.getInt("lifetime_points"));
        loyalty.setTier(rs.getString("tier"));
        loyalty.setTransaction_count(rs.getInt("transaction_count"));
        
        java.sql.Date birthday = rs.getDate("birthday");
        if (birthday != null) {
            loyalty.setBirthday(birthday.toLocalDate());
        }
        
        java.sql.Date lastServiceDate = rs.getDate("last_service_date");
        if (lastServiceDate != null) {
            loyalty.setLast_service_date(lastServiceDate.toLocalDate());
        }
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            loyalty.setCreated_at(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            loyalty.setUpdated_at(updatedAt.toLocalDateTime());
        }
        
        return loyalty;
    }
}
