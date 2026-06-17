package dao;

import model.BookingService;
import utils.DBConnection;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class BookingServiceDao {

    public void insertBookingService(BookingService bookingService) {
        String sql = "INSERT INTO booking_services (id, booking_id, service_id, created_at) VALUES (?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, bookingService.getId().toString());
            pstmt.setString(2, bookingService.getBooking_id().toString());
            pstmt.setString(3, bookingService.getService_id().toString());
            pstmt.setTimestamp(4, Timestamp.valueOf(bookingService.getCreated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting booking service", e);
        }
    }

    public BookingService getBookingServiceById(UUID id) {
        String sql = "SELECT * FROM booking_services WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToBookingService(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving booking service", e);
        }
        return null;
    }

    public List<BookingService> getServicesByBookingId(UUID bookingId) {
        String sql = "SELECT * FROM booking_services WHERE booking_id = ?";
        List<BookingService> services = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, bookingId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                services.add(mapResultSetToBookingService(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving booking services", e);
        }
        return services;
    }

    public void deleteBookingService(UUID id) {
        String sql = "DELETE FROM booking_services WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting booking service", e);
        }
    }

    private BookingService mapResultSetToBookingService(ResultSet rs) throws SQLException {
        BookingService bookingService = new BookingService();
        bookingService.setId(UUID.fromString(rs.getString("id")));
        bookingService.setBooking_id(UUID.fromString(rs.getString("booking_id")));
        bookingService.setService_id(UUID.fromString(rs.getString("service_id")));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            bookingService.setCreated_at(createdAt.toLocalDateTime());
        }
        
        return bookingService;
    }

