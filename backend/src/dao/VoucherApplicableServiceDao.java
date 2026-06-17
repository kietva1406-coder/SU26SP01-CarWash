package dao;

import model.VoucherApplicableService;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class VoucherApplicableServiceDao {

    public void insertVoucherApplicableService(VoucherApplicableService service) {
        String sql = "INSERT INTO voucher_applicable_services (id, voucher_id, service_id) VALUES (?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, service.getId().toString());
            pstmt.setString(2, service.getVoucher_id().toString());
            pstmt.setString(3, service.getService_id().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting voucher applicable service", e);
        }
    }

    public VoucherApplicableService getVoucherApplicableServiceById(UUID id) {
        String sql = "SELECT * FROM voucher_applicable_services WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToVoucherApplicableService(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving voucher applicable service", e);
        }
        return null;
    }

    public List<VoucherApplicableService> getServicesByVoucherId(UUID voucherId) {
        String sql = "SELECT * FROM voucher_applicable_services WHERE voucher_id = ?";
        List<VoucherApplicableService> services = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, voucherId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                services.add(mapResultSetToVoucherApplicableService(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving voucher applicable services", e);
        }
        return services;
    }

    public boolean isServiceApplicable(UUID voucherId, UUID serviceId) {
        String sql = "SELECT 1 FROM voucher_applicable_services WHERE voucher_id = ? AND service_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, voucherId.toString());
            pstmt.setString(2, serviceId.toString());
            ResultSet rs = pstmt.executeQuery();

            return rs.next();
        } catch (SQLException e) {
            throw new RuntimeException("Error checking service applicability", e);
        }
    }

    public void deleteVoucherApplicableService(UUID id) {
        String sql = "DELETE FROM voucher_applicable_services WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting voucher applicable service", e);
        }
    }

    private VoucherApplicableService mapResultSetToVoucherApplicableService(ResultSet rs) throws SQLException {
        VoucherApplicableService service = new VoucherApplicableService();
        service.setId(UUID.fromString(rs.getString("id")));
        service.setVoucher_id(UUID.fromString(rs.getString("voucher_id")));
        service.setService_id(UUID.fromString(rs.getString("service_id")));
        return service;
    }
}
