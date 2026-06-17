package dao;

import model.VoucherUsage;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class VoucherUsageDao {

    public void insertVoucherUsage(VoucherUsage usage) {
        String sql = "INSERT INTO voucher_usages (id, voucher_id, customer_id, booking_id, original_amount, discount_amount, final_amount, used_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, usage.getId().toString());
            pstmt.setString(2, usage.getVoucher_id().toString());
            pstmt.setString(3, usage.getCustomer_id().toString());
            pstmt.setString(4, usage.getBooking_id().toString());
            pstmt.setBigDecimal(5, usage.getOriginal_amount());
            pstmt.setBigDecimal(6, usage.getDiscount_amount());
            pstmt.setBigDecimal(7, usage.getFinal_amount());
            pstmt.setTimestamp(8, Timestamp.valueOf(usage.getUsed_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting voucher usage", e);
        }
    }

    public VoucherUsage getVoucherUsageById(UUID id) {
        String sql = "SELECT * FROM voucher_usages WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToVoucherUsage(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving voucher usage", e);
        }
        return null;
    }

    public List<VoucherUsage> getUsageByVoucherId(UUID voucherId) {
        String sql = "SELECT * FROM voucher_usages WHERE voucher_id = ? ORDER BY used_at DESC";
        List<VoucherUsage> usages = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, voucherId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                usages.add(mapResultSetToVoucherUsage(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving voucher usages by voucher", e);
        }
        return usages;
    }

    public List<VoucherUsage> getUsageByCustomerId(UUID customerId) {
        String sql = "SELECT * FROM voucher_usages WHERE customer_id = ? ORDER BY created_at DESC";
        List<VoucherUsage> usages = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                usages.add(mapResultSetToVoucherUsage(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving voucher usages by customer", e);
        }
        return usages;
    }

    public void deleteVoucherUsage(UUID id) {
        String sql = "DELETE FROM voucher_usages WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting voucher usage", e);
        }
    }

    private VoucherUsage mapResultSetToVoucherUsage(ResultSet rs) throws SQLException {
        VoucherUsage usage = new VoucherUsage();
        usage.setId(UUID.fromString(rs.getString("id")));
        usage.setVoucher_id(UUID.fromString(rs.getString("voucher_id")));
        usage.setCustomer_id(UUID.fromString(rs.getString("customer_id")));
        usage.setBooking_id(UUID.fromString(rs.getString("booking_id")));
        usage.setOriginal_amount(rs.getBigDecimal("original_amount"));
        usage.setDiscount_amount(rs.getBigDecimal("discount_amount"));
        usage.setFinal_amount(rs.getBigDecimal("final_amount"));
        
        Timestamp usedAt = rs.getTimestamp("used_at");
        if (usedAt != null) {
            usage.setUsed_at(usedAt.toLocalDateTime());
        }
        
        return usage;
    }
}
