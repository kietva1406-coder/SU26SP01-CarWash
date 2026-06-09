import { getPool } from "../config/db.mjs";

const getAll = async () => {
    const db = await getPool();
    const result = await db.request().query("SELECT * FROM Requests");
    return result.recordset;
};

const getById = async (id) => {
    const db = await getPool();
    const result = await db.request()
        .input("id", id)
        .query("SELECT * FROM Requests WHERE id = @id");

    return result.recordset[0];
};

const create = async (data) => {
    const db = await getPool();

    await db.request()
        .input("id", data.id)
        .input("customerId", data.customerId)
        .input("title", data.title)
        .input("description", data.description)
        .input("priority", data.priority)
        .query(`
            INSERT INTO Requests (id, customerId, title, description, status, priority, createdAt)
            VALUES (@id, @customerId, @title, @description, 'PENDING', @priority, GETDATE())
        `);
};

export default {
    getAll,
    getById,
    create
};