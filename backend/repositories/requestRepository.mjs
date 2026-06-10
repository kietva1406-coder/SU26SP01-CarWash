import { getPool } from "../config/db.mjs";
import sql from "mssql";

export const getAllRequests = async () => {
    const db = await getPool();
    return (await db.request().query(`
        SELECT r.*, 
        (SELECT STRING_AGG(staffId, ',') FROM RequestAssignments WHERE requestId = r.id) as assignedStaffString
        FROM Requests r
    `)).recordset;
};

export const getRequestById = async (id) => {
    const db = await getPool();
    return (await db.request()
        .input("id", id)
        .query("SELECT * FROM Requests WHERE id=@id")).recordset[0];
};

export const createRequest = async (data) => {
    const db = await getPool();

    await db.request()
        .input("id", data.id)
        .input("customerId", data.customerId)
        .input("title", data.title)
        .input("description", data.description)
        .input("priority", data.priority)
        .query(`
            INSERT INTO Requests
            (id, customerId, title, description, status, priority, createdAt)
            VALUES
            (@id, @customerId, @title, @description, 'PENDING', @priority, GETDATE())
        `);
};

export const approveRequest = async (id, managerId) => {
    const db = await getPool();

    await db.request()
        .input("id", id)
        .input("managerId", managerId)
        .query(`
            UPDATE Requests
            SET status='APPROVED',
                approvedBy=@managerId,
                approvedAt=GETDATE()
            WHERE id=@id
        `);
};

export const rejectRequest = async (id, managerId, notes) => {
    const db = await getPool();

    await db.request()
        .input("id", id)
        .input("managerId", managerId)
        .input("notes", notes)
        .query(`
            UPDATE Requests
            SET status='REJECTED',
                approvedBy=@managerId,
                approvedAt=GETDATE(),
                notes=@notes
            WHERE id=@id
        `);
};

export const updateRequest = async (id, title, description, priority) => {
    const db = await getPool();
    await db.request()
        .input("id", id)
        .input("title", title)
        .input("description", description)
        .input("priority", priority)
        .query(`
            UPDATE Requests
            SET title=@title, description=@description, priority=@priority
            WHERE id=@id
        `);
};

export const deleteRequest = async (id) => {
    const db = await getPool();
    await db.request()
        .input("id", id)
        .query("DELETE FROM Requests WHERE id=@id");
};

export const getRequestsByStatus = async (status) => {
    const db = await getPool();
    return (await db.request()
        .input("status", status)
        .query(`
            SELECT r.*, 
            (SELECT STRING_AGG(staffId, ',') FROM RequestAssignments WHERE requestId = r.id) as assignedStaffString
            FROM Requests r
            WHERE r.status=@status
        `)).recordset;
};

export const assignStaffToRequest = async (requestId, staffIds, managerId) => {
    const db = await getPool();
    const transaction = new sql.Transaction(db);
    await transaction.begin();
    try {
        const req1 = new sql.Request(transaction);
        await req1
            .input("requestId", requestId)
            .query("DELETE FROM RequestAssignments WHERE requestId=@requestId");
        
        for (const staffId of staffIds) {
            const req2 = new sql.Request(transaction);
            await req2
                .input("requestId", requestId)
                .input("staffId", staffId)
                .input("managerId", managerId)
                .query(`INSERT INTO RequestAssignments (requestId, staffId, assignedBy, assignedAt) 
                        VALUES (@requestId, @staffId, @managerId, GETDATE())`);
        }
        
        const req3 = new sql.Request(transaction);
        await req3
            .input("requestId", requestId)
            .query("UPDATE Requests SET status='ASSIGNED' WHERE id=@requestId AND status='APPROVED'");
            
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
};

export const getRequestsAssignedToStaff = async (staffId) => {
    const db = await getPool();
    return (await db.request()
        .input("staffId", staffId)
        .query(`
            SELECT r.*, 
            (SELECT STRING_AGG(staffId, ',') FROM RequestAssignments WHERE requestId = r.id) as assignedStaffString
            FROM Requests r
            INNER JOIN RequestAssignments ra ON r.id = ra.requestId
            WHERE ra.staffId = @staffId
        `)).recordset;
};