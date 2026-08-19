const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "kairos"
});

db.connect((err) => {
    if (err) {
        console.log("MySQL connection failed:");
        console.log(err.message);
        return;
    }

    console.log("MySQL connected successfully!");
});

module.exports = db;