const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/register/student", (req, res) => {
    const {
        full_name,
        email,
        college,
        course,
        availability,
        password
    } = req.body;

    const sql = `
        INSERT INTO students
        (full_name, email, college, course, availability, password)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [full_name, email, college, course, availability, password],
        (err, result) => {

            if (err) {
                console.log(err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({
                        message: "Email already registered"
                    });
                }

                return res.status(500).json({
                    message: "Registration failed"
                });
            }

            res.status(201).json({
                message: "Account created successfully!"
            });
        }
    );
});

app.listen(5000, () => {
    console.log("Backend running on http://localhost:5000");
});