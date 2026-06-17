package dao;

import model.BookingStatusHistory;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BookingStatusHistoryDao {

    public void insertBookingStatusHistory(BookingStatusHistory history) {
        String sql = "INSERT INTO booking_status_history (id, booking_id, previous_status, new_status, changed_by, changed_by_role, changed_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, history.getId().toString());
            pstmt.setString(2, history.getBooking_id().toString());
            pstmt.setString(3, history.getPrevious_status());
            pstmt.setString(4, history.getNew_status());
            pstmt.setString(5, history.getChanged_by().toString());
            pstmt.setString(6, history.getChanged_by_role());
            pstmt.setTimestamp(7, Timestamp.valueOf(history.getChanged_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting booking status history", e);
        }
    }

    public BookingStatusHistory getBookingStatusHistoryById(UUID id) {
        String sql = "SELECT * FROM booking_status_history WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToBookingStatusHistory(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving booking status history", e);
        }
        return null;
    }

    public List<BookingStatusHistory> getHistoryByBookingId(UUID bookingId) {
        String sql = "SELECT * FROM booking_status_history WHERE booking_id = ? ORDER BY changed_at DESC";
        List<BookingStatusHistory> histories = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, bookingId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                histories.add(mapResultSetToBookingStatusHistory(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving booking status history", e);
        }
        return histories;
    }

    public List<BookingStatusHistory> getHistoryByStatus(String status) {
        String sql = "SELECT * FROM booking_status_history WHERE new_status = ? ORDER BY changed_at DESC";
        List<BookingStatusHistory> histories = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, status);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                histories.add(mapResultSetToBookingStatusHistory(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving history by status", e);
        }
        return histories;
    }

    public void deleteBookingStatusHistory(UUID id) {
        String sql = "DELETE FROM booking_status_history WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting booking status history", e);
        }
    }

    private BookingStatusHistory mapResultSetToBookingStatusHistory(ResultSet rs) throws SQLException {
        BookingStatusHistory history = new BookingStatusHistory();
        history.setId(UUID.fromString(rs.getString("id")));
        history.setBooking_id(UUID.fromString(rs.getString("booking_id")));
        history.setPrevious_status(rs.getString("previous_status"));
        history.setNew_status(rs.getString("new_status"));
        history.setChanged_by(UUID.fromString(rs.getString("changed_by")));
        history.setChanged_by_role(rs.getString("changed_by_role"));
        
        Timestamp changedAt = rs.getTimestamp("changed_at");
        if (changedAt != null) {
            history.setChanged_at(changedAt.toLocalDateTime());
        }
        
        return history;
    }
}
