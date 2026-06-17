package dao;

import model.VoucherApplicableRank;
import utils.DBConnection;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class VoucherApplicableRankDao {

    public void insertVoucherApplicableRank(VoucherApplicableRank rank) {
        String sql = "INSERT INTO voucher_applicable_ranks (id, voucher_id, rank_tier) VALUES (?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, rank.getId().toString());
            pstmt.setString(2, rank.getVoucher_id().toString());
            pstmt.setString(3, rank.getRank_tier());

            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error inserting voucher applicable rank", e);
        }
    }

    public VoucherApplicableRank getVoucherApplicableRankById(UUID id) {
        String sql = "SELECT * FROM voucher_applicable_ranks WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            ResultSet rs = pstmt.executeQuery();

            if (rs.next()) {
                return mapResultSetToVoucherApplicableRank(rs);
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving voucher applicable rank", e);
        }
        return null;
    }

    public List<VoucherApplicableRank> getRanksByVoucherId(UUID voucherId) {
        String sql = "SELECT * FROM voucher_applicable_ranks WHERE voucher_id = ?";
        List<VoucherApplicableRank> ranks = new ArrayList<>();

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, voucherId.toString());
            ResultSet rs = pstmt.executeQuery();

            while (rs.next()) {
                ranks.add(mapResultSetToVoucherApplicableRank(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error retrieving voucher applicable ranks", e);
        }
        return ranks;
    }

    public boolean isRankApplicable(UUID voucherId, String rankTier) {
        String sql = "SELECT 1 FROM voucher_applicable_ranks WHERE voucher_id = ? AND rank_tier = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, voucherId.toString());
            pstmt.setString(2, rankTier);
            ResultSet rs = pstmt.executeQuery();

            return rs.next();
        } catch (SQLException e) {
            throw new RuntimeException("Error checking rank applicability", e);
        }
    }

    public void deleteVoucherApplicableRank(UUID id) {
        String sql = "DELETE FROM voucher_applicable_ranks WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
             PreparedStatement pstmt = conn.prepareStatement(sql)) {

            pstmt.setString(1, id.toString());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            throw new RuntimeException("Error deleting voucher applicable rank", e);
        }
    }

    private VoucherApplicableRank mapResultSetToVoucherApplicableRank(ResultSet rs) throws SQLException {
        VoucherApplicableRank rank = new VoucherApplicableRank();
        rank.setId(UUID.fromString(rs.getString("id")));
        rank.setVoucher_id(UUID.fromString(rs.getString("voucher_id")));
        rank.setRank_tier(rs.getString("rank_tier"));
        return rank;
    }
}
