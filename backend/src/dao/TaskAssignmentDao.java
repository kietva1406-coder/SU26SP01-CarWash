package dao;

import model.TaskAssignment;
import utils.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Timestamp;
import java.time.LocalDateTime;

public class TaskAssignmentDao {

    // =========================
    // ASSIGN TASK TO STAFF
    // =========================
    public void assign(TaskAssignment ta) {

        String sql = "INSERT INTO task_assignments "
                + "(id, task_id, staff_id, assigned_by, assigned_at, checkin_at, checkout_at) "
                + "VALUES (?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, ta.getId().toString());
            ps.setString(2, ta.getTaskId().toString());
            ps.setString(3, ta.getStaffId().toString());
            ps.setString(4, ta.getAssignedBy() != null ? ta.getAssignedBy().toString() : null);

            ps.setTimestamp(5, Timestamp.valueOf(ta.getAssignedAt()));
            ps.setTimestamp(6, null);
            ps.setTimestamp(7, null);

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // =========================
    // GET TASK BY STAFF
    // =========================
    public void getTasksByStaff(String staffId) {

        String sql = "SELECT * FROM dbo.task_assignments WHERE staff_id = ?";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, staffId);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                System.out.println("TASK ID = " + rs.getString("task_id"));
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // =========================
    // CHECK-IN (START WORK)
    // =========================
    public void checkIn(String taskId, String staffId) {

        String sql = "UPDATE dbo.task_assignments SET checkin_at = ? "
                + "WHERE task_id = ? AND staff_id = ?";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            ps.setString(2, taskId);
            ps.setString(3, staffId);

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // =========================
    // CHECK-OUT (FINISH WORK)
    // =========================
    public void checkOut(String taskId, String staffId) {

        String sql = "UPDATE dbo.task_assignments SET checkout_at = ? "
                + "WHERE task_id = ? AND staff_id = ?";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setTimestamp(1, Timestamp.valueOf(LocalDateTime.now()));
            ps.setString(2, taskId);
            ps.setString(3, staffId);

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}