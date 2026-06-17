package dao;

import model.Booking;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookingDao {

    public void insertBooking(Booking booking) {
        String sql = "INSERT INTO Booking (id, customerId, status, createdAt, updatedAt) " +
                "VALUES (?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, booking.getId());
            pstmt.setString(2, booking.getCustomerId());
            pstmt.setString(3, booking.getStatus());
            pstmt.setTimestamp(4, Timestamp.valueOf(booking.getCreatedAt()));
            pstmt.setTimestamp(5, Timestamp.valueOf(booking.getUpdatedAt()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting booking", e);
        }
    }

    public Booking getBookingById(String id) {
        String sql = "SELECT * FROM Booking WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToBooking(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving booking", e);
        }
        return null;
    }

    public List<Booking> getBookingsByCustomerId(String customerId) {
        String sql = "SELECT * FROM Booking WHERE customerId = ? ORDER BY createdAt DESC";
        List<Booking> bookings = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerId);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving bookings by customer", e);
        }
        return bookings;
    }

    public List<Booking> getAllBookings() {
        String sql = "SELECT * FROM Booking ORDER BY createdAt DESC";
        List<Booking> bookings = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);

            while (rs.next()) {
                bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving all bookings", e);
        }
        return bookings;
    }

    public List<Booking> getBookingsByStatus(String status) {
        String sql = "SELECT * FROM Booking WHERE status = ? ORDER BY createdAt DESC";
        List<Booking> bookings = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, status);
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                bookings.add(mapResultSetToBooking(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving bookings by status", e);
        }
        return bookings;
    }

    public void updateBooking(Booking booking) {
        String sql = "UPDATE Booking SET customerId = ?, status = ?, updatedAt = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, booking.getCustomerId());
            pstmt.setString(2, booking.getStatus());
            pstmt.setTimestamp(3, Timestamp.valueOf(java.time.LocalDateTime.now()));
            pstmt.setString(4, booking.getId());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating booking", e);
        }
    }

    public void deleteBooking(String id) {
        String sql = "DELETE FROM Booking WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting booking", e);
        }
    }

    public long getBookingCount() {
        String sql = "SELECT COUNT(*) FROM Booking";

        try (Connection conn = DBConnection.getConnection();
             Statement stmt = conn.createStatement()) {

            ResultSet rs = stmt.executeQuery(sql);
            if (rs.next()) {
                return rs.getLong(1);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error counting bookings", e);
        }
        return 0;
    }

    private Booking mapResultSetToBooking(ResultSet rs) throws SQLException {
        Booking booking = new Booking();
        booking.setId(rs.getString("id"));
        booking.setCustomerId(rs.getString("customerId"));
        booking.setStatus(rs.getString("status"));
        
        Timestamp createdAt = rs.getTimestamp("createdAt");
        if (createdAt != null) {
            booking.setCreatedAt(createdAt.toLocalDateTime());
        }
        
        Timestamp updatedAt = rs.getTimestamp("updatedAt");
        if (updatedAt != null) {
            booking.setUpdatedAt(updatedAt.toLocalDateTime());
        }
        
        return booking;
    }
}
