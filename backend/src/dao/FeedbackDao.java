package dao;

import model.Feedback;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class FeedbackDao {

    public void insertFeedback(Feedback feedback) {
        String sql = "INSERT INTO feedback (id, booking_id, customer_id, rating, comment, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, feedback.getId().toString());
            pstmt.setString(2, feedback.getBooking_id().toString());
            pstmt.setString(3, feedback.getCustomer_id().toString());
            pstmt.setInt(4, feedback.getRating());
            pstmt.setString(5, feedback.getComment());
            pstmt.setTimestamp(6, Timestamp.valueOf(feedback.getCreated_at()));

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting feedback", e);
        }
    }

    public Feedback getFeedbackById(UUID id) {
        String sql = "SELECT * FROM feedback WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToFeedback(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving feedback", e);
        }
        return null;
    }

    public Feedback getFeedbackByBookingId(UUID bookingId) {
        String sql = "SELECT * FROM feedback WHERE booking_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, bookingId.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToFeedback(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving feedback by booking", e);
        }
        return null;
    }

    public List<Feedback> getFeedbackByCustomerId(UUID customerId) {
        String sql = "SELECT * FROM feedback WHERE customer_id = ? ORDER BY created_at DESC";
        List<Feedback> feedbacks = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                feedbacks.add(mapResultSetToFeedback(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving feedbacks by customer", e);
        }
        return feedbacks;
    }

    public double getAverageRatingByCustomerId(UUID customerId) {
        String sql = "SELECT AVG(CAST(rating AS FLOAT)) as avg_rating FROM feedback WHERE customer_id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, customerId.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return rs.getDouble("avg_rating");
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error calculating average rating", e);
        }
        return 0.0;
    }

    public void updateFeedback(Feedback feedback) {
        String sql = "UPDATE feedback SET rating = ?, comment = ? WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setInt(1, feedback.getRating());
            pstmt.setString(2, feedback.getComment());
            pstmt.setString(3, feedback.getId().toString());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error updating feedback", e);
        }
    }

    public void deleteFeedback(UUID id) {
        String sql = "DELETE FROM feedback WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting feedback", e);
        }
    }

    private Feedback mapResultSetToFeedback(ResultSet rs) throws SQLException {
        Feedback feedback = new Feedback();
        feedback.setId(UUID.fromString(rs.getString("id")));
        feedback.setBooking_id(UUID.fromString(rs.getString("booking_id")));
        feedback.setCustomer_id(UUID.fromString(rs.getString("customer_id")));
        feedback.setRating(rs.getInt("rating"));
        feedback.setComment(rs.getString("comment"));
        
        Timestamp createdAt = rs.getTimestamp("created_at");
        if (createdAt != null) {
            feedback.setCreated_at(createdAt.toLocalDateTime());
        }
        
        return feedback;
    }
}
