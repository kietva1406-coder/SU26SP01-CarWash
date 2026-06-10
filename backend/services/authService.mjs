import jwt from "jsonwebtoken";
import { getPool } from "../config/db.mjs";

const SECRET = process.env.JWT_SECRET;


export const login = async (email, password) => {
    const db = await getPool();

    const result = await db.request()
        .input("email", email)
        .query("SELECT * FROM Users WHERE email = @email");

    const user = result.recordset[0];

    if (!user) {
        throw new Error("User not found");
    }

    if (user.password !== password) {
        throw new Error("Wrong password");
    }

    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            email: user.email
        },
        SECRET,
        { expiresIn: "1d" }
    );
};