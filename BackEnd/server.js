const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// Helper function to query MySQL database
const query = (sql, values = []) =>
  new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => (error ? reject(error) : resolve(results)));
  });

// Handle Database Errors
function databaseError(res, error) {
  console.error("Database Error:", error.message || error);
  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ message: "Already applied or duplicate entry." });
  }
  return res.status(500).json({ message: error.message || "Something went wrong. Please try again." });
}

// 1. User Registration (students or recruiters)
app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, role, college, course, availability, company, jobTitle, industry } = req.body;

  if (!name || !email || !password || !["Student", "Recruiter"].includes(role)) {
    return res.status(400).json({ message: "Please complete the required fields." });
  }

  try {
    if (role === "Student") {
      if (!college || !course || !availability) {
        return res.status(400).json({ message: "Please complete your student profile." });
      }
      const result = await query(
        "INSERT INTO students (full_name, email, password, college, course, availability) VALUES (?, ?, ?, ?, ?, ?)",
        [name.trim(), email.trim().toLowerCase(), password, college.trim(), course.trim(), availability]
      );
      return res.status(201).json({ id: result.insertId, name: name.trim(), email: email.trim().toLowerCase(), role: "Student", company: "" });
    } else {
      if (!company || !jobTitle || !industry) {
        return res.status(400).json({ message: "Please complete your company profile." });
      }
      const result = await query(
        "INSERT INTO recruiters (full_name, email, password, company_name, job_title, industry) VALUES (?, ?, ?, ?, ?, ?)",
        [name.trim(), email.trim().toLowerCase(), password, company.trim(), jobTitle.trim(), industry]
      );
      return res.status(201).json({ id: result.insertId, name: name.trim(), email: email.trim().toLowerCase(), role: "Recruiter", company: company.trim() });
    }
  } catch (error) {
    databaseError(res, error);
  }
});

// 2. User Login (students or recruiters)
app.post("/api/auth/login", async (req, res) => {
  const { email, password, role, company = "" } = req.body;
  try {
    if (role === "Student") {
      const students = await query("SELECT id, full_name AS name, email, password FROM students WHERE email = ?", [email.trim().toLowerCase()]);
      const student = students[0];
      if (!student || student.password !== password) {
        return res.status(401).json({ message: "Your email or password does not match." });
      }
      return res.json({ id: student.id, name: student.name, email: student.email, role: "Student", company: "" });
    } else {
      const recruiters = await query("SELECT recruiter_id AS id, full_name AS name, email, password, company_name AS company FROM recruiters WHERE email = ?", [email.trim().toLowerCase()]);
      const recruiter = recruiters[0];
      if (!recruiter || recruiter.password !== password || recruiter.company !== company.trim()) {
        return res.status(401).json({ message: "Your email, password, or company does not match." });
      }
      return res.json({ id: recruiter.id, name: recruiter.name, email: recruiter.email, role: "Recruiter", company: recruiter.company });
    }
  } catch (error) {
    databaseError(res, error);
  }
});

// 3. Get Active Jobs (JOIN with recruiters table for full Recruiter Contact Details)
app.get("/api/jobs", async (_req, res) => {
  try {
    const jobs = await query(
      "SELECT jobs.id, jobs.title, recruiters.company_name AS company, recruiters.full_name AS recruiter_name, recruiters.email AS recruiter_email, recruiters.job_title AS recruiter_role, recruiters.industry, jobs.work_type AS type, jobs.location, jobs.hours, jobs.pay, jobs.vacancies, jobs.description, jobs.status, DATE_FORMAT(jobs.created_at, '%e %b') AS posted FROM jobs JOIN recruiters ON recruiters.recruiter_id = jobs.recruiter_id WHERE jobs.status = 'Active' ORDER BY jobs.created_at DESC"
    );
    res.json(jobs);
  } catch (error) {
    databaseError(res, error);
  }
});

// 4. Get Jobs Posted by Recruiter
app.get("/api/recruiters/:recruiterId/jobs", async (req, res) => {
  try {
    const jobs = await query(
      "SELECT id, title, work_type AS type, location, hours, pay, vacancies, description, status, DATE_FORMAT(created_at, '%e %b') AS posted FROM jobs WHERE recruiter_id = ? ORDER BY created_at DESC",
      [req.params.recruiterId]
    );
    res.json(jobs);
  } catch (error) {
    databaseError(res, error);
  }
});

// 5. Post New Job
app.post("/api/jobs", async (req, res) => {
  const { recruiterId, title, type, location, hours, pay, vacancies, description } = req.body;
  if (!recruiterId || !title || !type || !location || !hours || !pay || !vacancies || !description) {
    return res.status(400).json({ message: "Please complete every job field." });
  }
  try {
    const result = await query(
      "INSERT INTO jobs (recruiter_id, title, work_type, location, hours, pay, vacancies, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [recruiterId, title.trim(), type, location.trim(), hours, pay.trim(), vacancies, description.trim()]
    );
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    databaseError(res, error);
  }
});

// 6. Update Job Status
app.patch("/api/jobs/:id/status", async (req, res) => {
  const { recruiterId, status } = req.body;
  if (!recruiterId || !["Active", "Paused"].includes(status)) {
    return res.status(400).json({ message: "Invalid job update." });
  }
  try {
    await query("UPDATE jobs SET status = ? WHERE id = ? AND recruiter_id = ?", [status, req.params.id, recruiterId]);
    res.json({ message: "Job updated." });
  } catch (error) {
    databaseError(res, error);
  }
});

// 7. Delete Job
app.delete("/api/jobs/:id", async (req, res) => {
  try {
    await query("DELETE FROM jobs WHERE id = ? AND recruiter_id = ?", [req.params.id, req.query.recruiterId]);
    res.json({ message: "Job removed." });
  } catch (error) {
    databaseError(res, error);
  }
});

// 8. Get Saved Jobs for Student
app.get("/api/students/:studentId/saved-jobs", async (req, res) => {
  try {
    const rows = await query("SELECT job_id FROM saved_jobs WHERE student_id = ?", [req.params.studentId]);
    res.json(rows.map((row) => row.job_id));
  } catch (error) {
    databaseError(res, error);
  }
});

// 9. Save Job for Student
app.post("/api/students/:studentId/saved-jobs/:jobId", async (req, res) => {
  try {
    await query("INSERT IGNORE INTO saved_jobs (student_id, job_id) VALUES (?, ?)", [req.params.studentId, req.params.jobId]);
    res.status(201).json({ message: "Job saved." });
  } catch (error) {
    databaseError(res, error);
  }
});

// 10. Remove Saved Job for Student
app.delete("/api/students/:studentId/saved-jobs/:jobId", async (req, res) => {
  try {
    await query("DELETE FROM saved_jobs WHERE student_id = ? AND job_id = ?", [req.params.studentId, req.params.jobId]);
    res.json({ message: "Saved job removed." });
  } catch (error) {
    databaseError(res, error);
  }
});

// 11. Student Applies for Job
app.post("/api/jobs/:jobId/apply", async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) return res.status(400).json({ message: "Student ID is required." });
  try {
    await query("INSERT INTO applications (job_id, student_id) VALUES (?, ?)", [req.params.jobId, studentId]);
    res.status(201).json({ message: "Application submitted successfully." });
  } catch (error) {
    databaseError(res, error);
  }
});

// 12. Student Withdraws Application
app.delete("/api/jobs/:jobId/apply", async (req, res) => {
  const studentId = req.query.studentId || req.body.studentId;
  if (!studentId) return res.status(400).json({ message: "Student ID is required." });
  try {
    await query("DELETE FROM applications WHERE job_id = ? AND student_id = ?", [req.params.jobId, studentId]);
    res.json({ message: "Application withdrawn." });
  } catch (error) {
    databaseError(res, error);
  }
});

// 13. Get Student Applied Job IDs
app.get("/api/students/:studentId/applications", async (req, res) => {
  try {
    const rows = await query("SELECT job_id FROM applications WHERE student_id = ?", [req.params.studentId]);
    res.json(rows.map((row) => row.job_id));
  } catch (error) {
    databaseError(res, error);
  }
});

// 14. Get Applicants for Recruiter Jobs (with full Student Contact Details)
app.get("/api/recruiters/:recruiterId/applications", async (req, res) => {
  try {
    const applications = await query(
      "SELECT applications.id AS application_id, applications.job_id, DATE_FORMAT(applications.created_at, '%e %b') AS applied_at, students.id AS student_id, students.full_name AS student_name, students.email AS student_email, students.college, students.course, students.availability FROM applications JOIN students ON students.id = applications.student_id JOIN jobs ON jobs.id = applications.job_id WHERE jobs.recruiter_id = ? ORDER BY applications.created_at DESC",
      [req.params.recruiterId]
    );
    res.json(applications);
  } catch (error) {
    databaseError(res, error);
  }
});

app.listen(5000, () => console.log("Backend server running on http://localhost:5000"));
