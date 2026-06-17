package dao;

import model.BookingHistory;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BookingHistoryDao {

    public void insertBookingHistory(BookingHistory history) {
        String sql = "INSERT INTO booking_history (id, booking_id, action, changes, performed_by, performed_by_role, performed_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, history.getId().toString());
            pstmt.setString(2, history.getBooking_id().toString());
            pstmt.setString(3, history.getAction());
            pstmt.setString(4, history.getChanges());
            pstmt.setString(5, history.getPerformed_by().toString());
            pstmt.setString(6, history.getPerformed_by_role());
            pstmt.setTimestamp(7, Timestamp.valueOf(history.getPerformed_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting booking history", e);
        }
    }

    public BookingHistory getBookingHistoryById(UUID id) {
        String sql = "SELECT * FROM booking_history WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToBookingHistory(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving booking history", e);
        }
        return null;
    }

    public List<BookingHistory> getHistoryByBookingId(UUID bookingId) {
        String sql = "SELECT * FROM booking_history WHERE booking_id = ? ORDER BY performed_at DESC";
        List<BookingHistory> histories = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, bookingId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                histories.add(mapResultSetToBookingHistory(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving booking history", e);
        }
        return histories;
    }

    public List<BookingHistory> getHistoryByAction(String action) {
        String sql = "SELECT * FROM booking_history WHERE action = ? ORDER BY performed_at DESC";
        List<BookingHistory> histories = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, action);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                histories.add(mapResultSetToBookingHistory(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving history by action", e);
        }
        return histories;
    }

    public void deleteBookingHistory(UUID id) {
        String sql = "DELETE FROM booking_history WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting booking history", e);
        }
    }

    private BookingHistory mapResultSetToBookingHistory(ResultSet rs) throws SQLException {
        BookingHistory history = new BookingHistory();
        history.setId(UUID.fromString(rs.getString("id")));
        history.setBooking_id(UUID.fromString(rs.getString("booking_id")));
        history.setAction(rs.getString("action"));
        history.setChanges(rs.getString("changes"));
        history.setPerformed_by(UUID.fromString(rs.getString("performed_by")));
        history.setPerformed_by_role(rs.getString("performed_by_role"));
        
        Timestamp performedAt = rs.getTimestamp("performed_at");
        if (performedAt != null) {
            history.setPerformed_at(performedAt.toLocalDateTime());
        }
        
        return history;
    }
}
