package dao;

import model.Task;
import enums.TaskStatus;
import utils.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class TaskDao {

    // =========================
    // INSERT TASK
    // =========================
    public void insert(Task task) {

        String sql = "INSERT INTO dbo.task (id, request_id, status, note, created_at, updated_at) "
                + "VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, task.getId().toString());
            ps.setString(2, task.getRequestId().toString());
            ps.setString(3, task.getStatus().name());
            ps.setString(4, task.getNote());
            ps.setString(5, task.getCreatedAt());
            ps.setString(6, task.getUpdatedAt());

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    // =========================
    // GET BY ID
    // =========================
    public Task getById(String id) {

        String sql = "SELECT * FROM dbo.task WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, id);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                Task task = new Task();

                task.setId(UUID.fromString(rs.getString("id")));
                task.setRequestId(UUID.fromString(rs.getString("request_id")));
                task.setStatus(TaskStatus.valueOf(rs.getString("status")));
                task.setNote(rs.getString("note"));

                task.setCreatedAt(rs.getTimestamp("created_at").toString());
                task.setUpdatedAt(rs.getTimestamp("updated_at").toString());

                return task;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    // =========================
    // GET ALL TASKS
    // =========================
    public List<Task> getAll() {

        List<Task> list = new ArrayList<>();

        String sql = "SELECT * FROM dbo.task";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql);
                ResultSet rs = ps.executeQuery()) {

            while (rs.next()) {
                System.out.println("ROW FOUND = " + rs.getString("id"));
                Task task = new Task();

                task.setId(UUID.fromString(rs.getString("id")));
                task.setRequestId(UUID.fromString(rs.getString("request_id")));
                task.setStatus(TaskStatus.valueOf(rs.getString("status")));
                task.setNote(rs.getString("note"));

                task.setCreatedAt(rs.getTimestamp("created_at").toString());
                task.setUpdatedAt(rs.getTimestamp("updated_at").toString());
                list.add(task);

            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    // =========================
    // UPDATE STATUS
    // =========================
    public void updateStatus(String id, TaskStatus status) {

        String sql = "UPDATE task SET status = ?, updated_at = GETDATE() WHERE id = ?";

        try (Connection conn = DBConnection.getConnection();
                PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, status.name());
            ps.setString(2, id);

            ps.executeUpdate();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}