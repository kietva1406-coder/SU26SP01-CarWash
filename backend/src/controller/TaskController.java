package controller;

import com.google.gson.Gson;
import com.sun.net.httpserver.HttpServer;

import dao.TaskAssignmentDao;
import dao.TaskDao;
import model.Task;
import model.TaskAssignment;


import java.net.InetSocketAddress;
import java.time.LocalDateTime;

import java.util.UUID;

public class TaskController {

    public static void main(String[] args) throws Exception {

        HttpServer server = HttpServer.create(new InetSocketAddress(8081), 0);
        // /api/tasks/{id}
        server.createContext("/api/tasks", exchange -> {

            try {

                String path = exchange.getRequestURI().getPath();
                String[] parts = path.split("/");

                if (parts.length == 4 && "GET".equals(exchange.getRequestMethod())) {

                    String id = parts[3];

                    TaskDao dao = new TaskDao();
                    Task task = dao.getById(id);

                    Gson gson = new Gson();
                    String json = gson.toJson(task);

                    exchange.getResponseHeaders().add("Content-Type", "application/json");
                    exchange.sendResponseHeaders(200, json.getBytes().length);

                    exchange.getResponseBody().write(json.getBytes());
                    exchange.getResponseBody().close();
                }

                // Handle PUT /api/tasks/{id} -> update task status
                if (parts.length == 4 && "PUT".equalsIgnoreCase(exchange.getRequestMethod())) {

                    String id = parts[3];

                    String query = exchange.getRequestURI().getQuery();

                    if (query == null) {
                        String res = "Missing query params: expected status=<STATUS>";
                        exchange.sendResponseHeaders(400, res.getBytes().length);
                        exchange.getResponseBody().write(res.getBytes());
                        exchange.getResponseBody().close();
                        return;
                    }

                    String[] params = query.split("&");
                    String statusStr = null;
                    for (String p : params) {
                        String[] kv = p.split("=");
                        if (kv.length == 2 && "status".equalsIgnoreCase(kv[0])) {
                            statusStr = kv[1];
                            break;
                        }
                    }

                    if (statusStr == null) {
                        String res = "Missing status param";
                        exchange.sendResponseHeaders(400, res.getBytes().length);
                        exchange.getResponseBody().write(res.getBytes());
                        exchange.getResponseBody().close();
                        return;
                    }

                    try {
                        dao.TaskDao dao = new dao.TaskDao();
                        enums.TaskStatus status = enums.TaskStatus.valueOf(statusStr);
                        dao.updateStatus(id, status);

                        String response = "UPDATE SUCCESS";
                        exchange.getResponseHeaders().add("Content-Type", "text/plain");
                        exchange.sendResponseHeaders(200, response.getBytes().length);
                        exchange.getResponseBody().write(response.getBytes());
                        exchange.getResponseBody().close();
                        return;
                    } catch (IllegalArgumentException iae) {
                        String res = "Invalid status value";
                        exchange.sendResponseHeaders(400, res.getBytes().length);
                        exchange.getResponseBody().write(res.getBytes());
                        exchange.getResponseBody().close();
                        return;
                    }
                }

            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        // PUT /api/tasks/assign
        server.createContext("/api/tasks/assign", exchange -> {

            try {
                

                if ("PUT".equalsIgnoreCase(exchange.getRequestMethod())) {

                    String query = exchange.getRequestURI().getQuery();

                    if (query == null) {
                        String res = "Missing query params";
                        exchange.sendResponseHeaders(400, res.getBytes().length);
                        exchange.getResponseBody().write(res.getBytes());
                        exchange.close();
                        return;
                    }

                    String[] params = query.split("&");

                    String taskId = params[0].split("=")[1];
                    String staffId = params[1].split("=")[1];
                    String managerId = params[2].split("=")[1];

                    TaskAssignment ta = new TaskAssignment();

                    ta.setId(UUID.randomUUID());
                    ta.setTaskId(UUID.fromString(taskId));

                    // ✔ FIX QUAN TRỌNG NHẤT
                    ta.setStaffId(staffId);
                    ta.setAssignedBy(managerId);

                    ta.setAssignedAt(LocalDateTime.now());

                    new TaskAssignmentDao().assign(ta);

                    String response = "ASSIGN SUCCESS";

                    exchange.getResponseHeaders().add("Content-Type", "text/plain");
                    exchange.sendResponseHeaders(200, response.getBytes().length);
                    exchange.getResponseBody().write(response.getBytes());
                    exchange.close();

                } else {
                    String res = "METHOD NOT ALLOWED";
                    exchange.sendResponseHeaders(405, res.getBytes().length);
                    exchange.getResponseBody().write(res.getBytes());
                    exchange.close();
                }

            } catch (Exception e) {
                e.printStackTrace();

                String error = "ERROR: " + e.getMessage();
                try {
                    exchange.sendResponseHeaders(500, error.getBytes().length);
                    exchange.getResponseBody().write(error.getBytes());
                    exchange.close();
                } catch (Exception ex) {
                    ex.printStackTrace();
                }
            }
        });

        server.start();

        System.out.println("SERVER STARTED http://localhost:8081");
    }
}