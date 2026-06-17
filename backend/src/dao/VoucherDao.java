package dao;

import model.Voucher;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.math.BigDecimal;

public class VoucherDao {

    public void insertVoucher(Voucher voucher) {
        String sql = "INSERT INTO vouchers (id, code, description, discount_type, discount_value, max_discount_amount, min_order_value, " +
                "usage_limit, used_count, per_user_limit, valid_from, valid_until, is_active, created_by, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, voucher.getId().toString());
            pstmt.setString(2, voucher.getCode());
            pstmt.setString(3, voucher.getDescription());
            pstmt.setString(4, voucher.getDiscount_type());
            pstmt.setBigDecimal(5, voucher.getDiscount_value());
            pstmt.setBigDecimal(6, voucher.getMax_discount_amount());
            pstmt.setBigDecimal(7, voucher.getMin_order_value());
            pstmt.setInt(8, voucher.getUsage_limit());
            pstmt.setInt(9, voucher.getUsed_count());
            pstmt.setInt(10, voucher.getPer_user_limit());
            pstmt.setTimestamp(11, Timestamp.valueOf(voucher.getValid_from()));
            pstmt.setTimestamp(12, Timestamp.valueOf(voucher.getValid_until()));
            pstmt.setBoolean(13, voucher.isIs_active());
            pstmt.setString(14, voucher.getCreated_by().toString());
            pstmt.setTimestamp(15, Timestamp.valueOf(voucher.getCreated_at()));
            pstmt.setTimestamp(16, Timestamp.valueOf(voucher.getUpdated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting voucher", e);
        }
    }

    public Voucher getVoucherById(UUID id) {
        String sql = "SELECT * FROM vouchers WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToVoucher(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving voucher", e);
        }
        return null;
    }

    public Voucher getVoucherByCode(String code) {
        String sql = "SELECT * FROM vouchers WHERE code = ? AND is_active = 1";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, code);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToVoucher(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving voucher by code", e);
        }
        return null;
    }

    public List<Voucher> getAllActiveVouchers() {
        String sql = "SELECT * FROM vouchers WHERE is_active = 1 AND CAST(GETDATE() AS DATE) BETWEEN valid_from AND valid_until ORDER BY created_at DESC";
        List<Voucher> vouchers = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                vouchers.add(mapResultSetToVoucher(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all vouchers", e);
        }
        return vouchers;
    }

    public void updateVoucher(Voucher voucher) {
        String sql = "UPDATE vouchers SET description = ?, discount_value = ?, max_discount_amount = ?, min_order_value = ?, " +
                "usage_limit = ?, used_count = ?, per_user_limit = ?, valid_from = ?, valid_until = ?, is_active = ?, updated_at = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, voucher.getDescription());
            pstmt.setBigDecimal(2, voucher.getDiscount_value());
            pstmt.setBigDecimal(3, voucher.getMax_discount_amount());
            pstmt.setBigDecimal(4, voucher.getMin_order_value());
            pstmt.setInt(5, voucher.getUsage_limit());
            pstmt.setInt(6, voucher.getUsed_count());
            pstmt.setInt(7, voucher.getPer_user_limit());
            pstmt.setTimestamp(8, Timestamp.valueOf(voucher.getValid_from()));
            pstmt.setTimestamp(9, Timestamp.valueOf(voucher.getValid_until()));
            pstmt.setBoolean(10, voucher.isIs_active());
            pstmt.setTimestamp(11, Timestamp.valueOf(LocalDateTime.now()));
            pstmt.setString(12, voucher.getId().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating voucher", e);
        }
    }

    public void deleteVoucher(UUID id) {
        String sql = "DELETE FROM vouchers WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting voucher", e);
        }
    }

    private Voucher mapResultSetToVoucher(ResultSet rs) throws SQLException {
        Voucher voucher = new Voucher();
        voucher.setId(UUID.fromString(rs.getString("id")));
        voucher.setCode(rs.getString("code"));
        voucher.setDescription(rs.getString("description"));
        voucher.setDiscount_type(rs.getString("discount_type"));
        voucher.setDiscount_value(rs.getBigDecimal("discount_value"));
        voucher.setMax_discount_amount(rs.getBigDecimal("max_discount_amount"));
        voucher.setMin_order_value(rs.getBigDecimal("min_order_value"));
        voucher.setUsage_limit(rs.getInt("usage_limit"));
        voucher.setUsed_count(rs.getInt("used_count"));
        voucher.setPer_user_limit(rs.getInt("per_user_limit"));
        Timestamp validFrom = rs.getTimestamp("valid_from");
        if (validFrom != null) {
            voucher.setValid_from(validFrom.toLocalDateTime());
        }
        
        Timestamp validUntil = rs.getTimestamp("valid_until");
        if (validUntil != null) {
            voucher.setValid_until(validUntil.toLocalDateTime());
        }
        voucher.setIs_active(rs.getBoolean("is_active"));
        voucher.setCreated_by(UUID.fromString(rs.getString("created_by")));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            voucher.setCreated_at(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updated_at");
        if (updatedAt != null) {
            voucher.setUpdated_at(updatedAt.toLocalDateTime());
        }
        
        return voucher;
    }
}
