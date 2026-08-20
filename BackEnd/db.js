const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: process.env.DB_PASSWORD,
    database: "kairos"
});

module.exports = db;
