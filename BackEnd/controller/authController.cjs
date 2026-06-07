const { sql } = require("../config/db.cjs");

exports.register = async (req, res) => {

    console.log('Received REGISTER request', req.method, req.url, req.body);

    try {

        const { fullName, email, password } = req.body;

        const checkUser = await sql.query(`
            SELECT *
            FROM Users
            WHERE Email = '${email}'
        `);

        if (checkUser.recordset.length > 0) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }

        await sql.query(`
            INSERT INTO Users
            (FullName, Email, PasswordHash)
            VALUES
            ('${fullName}','${email}','${password}')
        `);

        res.status(201).json({
            message: "Register successful"
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};

exports.login = async (req, res) => {

    console.log('Received LOGIN request', req.method, req.url, req.body);

    try {

        const { email, password } = req.body;

        const result = await sql.query(`
            SELECT *
            FROM Users
            WHERE Email='${email}'
            AND PasswordHash='${password}'
        `);

        if (result.recordset.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user: result.recordset[0]
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
};
