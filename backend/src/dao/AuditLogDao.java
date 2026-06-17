package dao;

import model.AuditLog;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AuditLogDao {

    public void insertAuditLog(AuditLog auditLog) {
        String sql = "INSERT INTO audit_logs (id, action, entity_type, entity_id, performed_by, performed_by_role, details, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, auditLog.getId().toString());
            pstmt.setString(2, auditLog.getAction());
            pstmt.setString(3, auditLog.getEntity_type());
            pstmt.setString(4, auditLog.getEntity_id().toString());
            pstmt.setString(5, auditLog.getPerformed_by().toString());
            pstmt.setString(6, auditLog.getPerformed_by_role());
            pstmt.setString(7, auditLog.getDetails());
            pstmt.setTimestamp(8, Timestamp.valueOf(auditLog.getCreated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting audit log", e);
        }
    }

    public AuditLog getAuditLogById(UUID id) {
        String sql = "SELECT * FROM audit_logs WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToAuditLog(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving audit log", e);
        }
        return null;
    }

    public List<AuditLog> getLogsByEntityId(UUID entityId) {
        String sql = "SELECT * FROM audit_logs WHERE entity_id = ? ORDER BY created_at DESC";
        List<AuditLog> logs = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, entityId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                logs.add(mapResultSetToAuditLog(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving audit logs by entity", e);
        }
        return logs;
    }

    public List<AuditLog> getLogsByPerformedBy(UUID performedBy) {
        String sql = "SELECT * FROM audit_logs WHERE performed_by = ? ORDER BY created_at DESC";
        List<AuditLog> logs = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, performedBy.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                logs.add(mapResultSetToAuditLog(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving audit logs by performer", e);
        }
        return logs;
    }

    public List<AuditLog> getLogsByEntityType(String entityType) {
        String sql = "SELECT * FROM audit_logs WHERE entity_type = ? ORDER BY created_at DESC";
        List<AuditLog> logs = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, entityType);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                logs.add(mapResultSetToAuditLog(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving audit logs by entity type", e);
        }
        return logs;
    }

    public void deleteAuditLog(UUID id) {
        String sql = "DELETE FROM audit_logs WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting audit log", e);
        }
    }

    private AuditLog mapResultSetToAuditLog(ResultSet rs) throws SQLException {
        AuditLog auditLog = new AuditLog();
        auditLog.setId(UUID.fromString(rs.getString("id")));
        auditLog.setAction(rs.getString("action"));
        auditLog.setEntity_type(rs.getString("entity_type"));
        auditLog.setEntity_id(UUID.fromString(rs.getString("entity_id")));
        auditLog.setPerformed_by(UUID.fromString(rs.getString("performed_by")));
        auditLog.setPerformed_by_role(rs.getString("performed_by_role"));
        auditLog.setDetails(rs.getString("details"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            auditLog.setCreated_at(createdAt.toLocalDateTime());
        }
        
        return auditLog;
    }
}
