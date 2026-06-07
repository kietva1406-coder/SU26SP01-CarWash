const sql = require("mssql");

const config = {
    user: "sa",
    password: "12345",
    server: "localhost",
    database: "CarWashDB",
    options: {
        trustServerCertificate: true
    }
};

async function connectDB() {
    try {
        await sql.connect(config);
        console.log("Connected to SQL Server");
    } catch (err) {
        console.log("Database Connection Error:");
        console.log(err);
    }
}

module.exports = {
    connectDB,
    sql
};
