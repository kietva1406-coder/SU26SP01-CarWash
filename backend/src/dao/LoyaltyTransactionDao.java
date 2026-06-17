package dao;

import model.LoyaltyTransaction;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class LoyaltyTransactionDao {

    public void insertLoyaltyTransaction(LoyaltyTransaction transaction) {
        String sql = "INSERT INTO loyalty_transactions (id, customer_id, booking_id, points, transaction_type, status, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, transaction.getId().toString());
            pstmt.setString(2, transaction.getCustomer_id().toString());
            
            if (transaction.getBooking_id() != null) {
                pstmt.setString(3, transaction.getBooking_id().toString());
            } else {
                pstmt.setNull(3, Types.VARCHAR);
            }
            
            pstmt.setInt(4, transaction.getPoints());
            pstmt.setString(5, transaction.getTransaction_type());
            pstmt.setString(6, transaction.getStatus());
            pstmt.setTimestamp(7, Timestamp.valueOf(transaction.getCreated_at()));
            pstmt.setTimestamp(8, Timestamp.valueOf(transaction.getUpdated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting loyalty transaction", e);
        }
    }

    public LoyaltyTransaction getLoyaltyTransactionById(UUID id) {
        String sql = "SELECT * FROM loyalty_transactions WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToLoyaltyTransaction(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving loyalty transaction", e);
        }
        return null;
    }

    public List<LoyaltyTransaction> getTransactionsByCustomerId(UUID customerId) {
        String sql = "SELECT * FROM loyalty_transactions WHERE customer_id = ? ORDER BY created_at DESC";
        List<LoyaltyTransaction> transactions = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                transactions.add(mapResultSetToLoyaltyTransaction(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving loyalty transactions", e);
        }
        return transactions;
    }

    public List<LoyaltyTransaction> getTransactionsByStatus(String status) {
        String sql = "SELECT * FROM loyalty_transactions WHERE status = ? ORDER BY created_at DESC";
        List<LoyaltyTransaction> transactions = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, status);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                transactions.add(mapResultSetToLoyaltyTransaction(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving transactions by status", e);
        }
        return transactions;
    }

    public void updateLoyaltyTransaction(LoyaltyTransaction transaction) {
        String sql = "UPDATE loyalty_transactions SET status = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, transaction.getStatus());
            pstmt.setTimestamp(2, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(3, transaction.getId().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating loyalty transaction", e);
        }
    }

    public void deleteLoyaltyTransaction(UUID id) {
        String sql = "DELETE FROM loyalty_transactions WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting loyalty transaction", e);
        }
    }

    private LoyaltyTransaction mapResultSetToLoyaltyTransaction(ResultSet rs) throws SQLException {
        LoyaltyTransaction transaction = new LoyaltyTransaction();
        transaction.setId(UUID.fromString(rs.getString("id")));
        transaction.setCustomer_id(UUID.fromString(rs.getString("customer_id")));
        
        String bookingId = rs.getString("booking_id");
        if (bookingId != null) {
            transaction.setBooking_id(UUID.fromString(bookingId));
        }
        
        transaction.setPoints(rs.getInt("points"));
        transaction.setTransaction_type(rs.getString("transaction_type"));
        transaction.setStatus(rs.getString("status"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            transaction.setCreated_at(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            transaction.setUpdated_at(updatedAt.toLocalDateTime());
        }
        
        return transaction;
    }
}
