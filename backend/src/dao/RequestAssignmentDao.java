package dao;

import model.RequestAssignment;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class RequestAssignmentDao {

    public void insertRequestAssignment(RequestAssignment assignment) {
        String sql = "INSERT INTO RequestAssignments (requestId, staffId, assignedBy, assignedAt) " +
                "VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, assignment.getRequestId());
            pstmt.setString(2, assignment.getStaffId());
            pstmt.setString(3, assignment.getAssignedBy());
            pstmt.setTimestamp(4, Timestamp.valueOf(assignment.getAssignedAt()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting request assignment", e);
        }
    }

    public RequestAssignment getRequestAssignment(String requestId, String staffId) {
        String sql = "SELECT * FROM RequestAssignments WHERE requestId = ? AND staffId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, requestId);
            pstmt.setString(2, staffId);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToRequestAssignment(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving request assignment", e);
        }
        return null;
    }

    public List<RequestAssignment> getAssignmentsByRequestId(String requestId) {
        String sql = "SELECT * FROM RequestAssignments WHERE requestId = ? ORDER BY assignedAt DESC";
        List<RequestAssignment> assignments = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, requestId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                assignments.add(mapResultSetToRequestAssignment(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving assignments by request", e);
        }
        return assignments;
    }

    public List<RequestAssignment> getAssignmentsByStaffId(String staffId) {
        String sql = "SELECT * FROM RequestAssignments WHERE staffId = ? ORDER BY assignedAt DESC";
        List<RequestAssignment> assignments = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staffId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                assignments.add(mapResultSetToRequestAssignment(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving assignments by staff", e);
        }
        return assignments;
    }

    public List<RequestAssignment> getAllRequestAssignments() {
        String sql = "SELECT * FROM RequestAssignments ORDER BY assignedAt DESC";
        List<RequestAssignment> assignments = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                assignments.add(mapResultSetToRequestAssignment(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all request assignments", e);
        }
        return assignments;
    }

    public void deleteRequestAssignment(String requestId, String staffId) {
        String sql = "DELETE FROM RequestAssignments WHERE requestId = ? AND staffId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, requestId);
            pstmt.setString(2, staffId);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting request assignment", e);
        }
    }

    public long getAssignmentCountByStaffId(String staffId) {
        String sql = "SELECT COUNT(*) FROM RequestAssignments WHERE staffId = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, staffId);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error counting assignments", e);
        }
        return 0;
    }

    private RequestAssignment mapResultSetToRequestAssignment(ResultSet rs) throws SQLException {
        RequestAssignment assignment = new RequestAssignment();
        assignment.setRequestId(rs.getString("requestId"));
        assignment.setStaffId(rs.getString("staffId"));
        assignment.setAssignedBy(rs.getString("assignedBy"));
        
        Timestamp assignedAt = rs.getTimestamp("assignedAt");
        if (assignedAt != null) {
            assignment.setAssignedAt(assignedAt.toLocalDateTime());
        }
        
        return assignment;
    }
}
