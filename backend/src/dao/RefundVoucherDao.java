package dao;
 
import model.RefundVoucher;
import utils.DBConnection;
 
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
 
public class RefundVoucherDao {
 
    public void insert(RefundVoucher v) {
        String sql = "INSERT INTO refund_vouchers (id, customer_id, booking_id, code, amount_vnd, original_amount_vnd, description, valid_from, valid_until, is_used, used_at, used_in_booking_id, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
 
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
 
            ps.setString(1, v.getId().toString());
            ps.setString(2, v.getCustomer_id().toString());
            ps.setString(3, v.getBooking_id() != null ? v.getBooking_id().toString() : null);
            ps.setString(4, v.getCode());
            ps.setBigDecimal(5, v.getAmount_vnd());
            ps.setBigDecimal(6, v.getOriginal_amount_vnd());
            ps.setString(7, v.getDescription());
            ps.setTimestamp(8, v.getValid_from() != null ? Timestamp.valueOf(v.getValid_from()) : null);
            ps.setTimestamp(9, v.getValid_until() != null ? Timestamp.valueOf(v.getValid_until()) : null);
            ps.setBoolean(10, v.isIs_used());
            ps.setTimestamp(11, v.getUsed_at() != null ? Timestamp.valueOf(v.getUsed_at()) : null);
            ps.setString(12, v.getUsed_in_booking_id() != null ? v.getUsed_in_booking_id().toString() : null);
            ps.setTimestamp(13, v.getCreated_at() != null ? Timestamp.valueOf(v.getCreated_at()) : null);
 
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting refund voucher", e);
        }
    }
 
    public RefundVoucher getById(UUID id) {
        String sql = "SELECT * FROM refund_vouchers WHERE id = ?";
 
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
 
            ps.setString(1, id.toString());
            ResultSet rs = ps.executeQuery();
 
            if (rs.next()) return map(rs);
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving refund voucher by id", e);
        }
        return null;
    }
 
    public RefundVoucher getByCode(String code) {
        String sql = "SELECT * FROM refund_vouchers WHERE code = ?";
 
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
 
            ps.setString(1, code);
            ResultSet rs = ps.executeQuery();
 
            if (rs.next()) return map(rs);
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving refund voucher by code", e);
        }
        return null;
    }
 
    public List<RefundVoucher> getByCustomerId(UUID customerId) {
        String sql = "SELECT * FROM refund_vouchers WHERE customer_id = ? ORDER BY created_at DESC";
        List<RefundVoucher> list = new ArrayList<>();
 
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
 
            ps.setString(1, customerId.toString());
            ResultSet rs = ps.executeQuery();
 
            while (rs.next()) list.add(map(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving refund vouchers by customer", e);
        }
        return list;
    }
 
    public List<RefundVoucher> getByBookingId(UUID bookingId) {
        String sql = "SELECT * FROM refund_vouchers WHERE booking_id = ?";
        List<RefundVoucher> list = new ArrayList<>();
 
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
 
            ps.setString(1, bookingId.toString());
            ResultSet rs = ps.executeQuery();
 
            while (rs.next()) list.add(map(rs));
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving refund vouchers by booking", e);
        }
        return list;
    }
 
    public void markAsUsed(UUID id, UUID usedInBookingId) {
        String sql = "UPDATE refund_vouchers SET is_used = ?, used_at = ?, used_in_booking_id = ? WHERE id = ?";
 
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
 
            ps.setBoolean(1, true);
            ps.setTimestamp(2, Timestamp.valueOf(java.time.LocalDateTime.now()));
            ps.setString(3, usedInBookingId != null ? usedInBookingId.toString() : null);
            ps.setString(4, id.toString());
 
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error marking refund voucher as used", e);
        }
    }
 
    public void updateAmount(UUID id, java.math.BigDecimal newAmount) {
        String sql = "UPDATE refund_vouchers SET amount_vnd = ? WHERE id = ?";
 
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
 
            ps.setBigDecimal(1, newAmount);
            ps.setString(2, id.toString());
 
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating refund voucher amount", e);
        }
    }
 
    public void delete(UUID id) {
        String sql = "DELETE FROM refund_vouchers WHERE id = ?";
 
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
 
            ps.setString(1, id.toString());
            ps.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting refund voucher", e);
        }
    }
 
    private RefundVoucher map(ResultSet rs) throws SQLException {
        RefundVoucher v = new RefundVoucher();
 
        v.setId(UUID.fromString(rs.getString("id")));
        v.setCustomer_id(UUID.fromString(rs.getString("customer_id")));
 
        String bookingId = rs.getString("booking_id");
        if (bookingId != null) v.setBooking_id(UUID.fromString(bookingId));
 
        v.setCode(rs.getString("code"));
        v.setAmount_vnd(rs.getBigDecimal("amount_vnd"));
        v.setOriginal_amount_vnd(rs.getBigDecimal("original_amount_vnd"));
        v.setDescription(rs.getString("description"));
 
        Timestamp validFrom = rs.getTimestamp("valid_from");
        if (validFrom != null) v.setValid_from(validFrom.toLocalDateTime());
 
        Timestamp validUntil = rs.getTimestamp("valid_until");
        if (validUntil != null) v.setValid_until(validUntil.toLocalDateTime());
 
        v.setIs_used(rs.getBoolean("is_used"));
 
        Timestamp usedAt = rs.getTimestamp("used_at");
        if (usedAt != null) v.setUsed_at(usedAt.toLocalDateTime());
 
        String usedInBookingId = rs.getString("used_in_booking_id");
        if (usedInBookingId != null) v.setUsed_in_booking_id(UUID.fromString(usedInBookingId));
 
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) v.setCreated_at(createdAt.toLocalDateTime());
 
        return v;
    }
}