# Kairos - Student & Recruiter Job Portal (Client-Only React App)

A modern, responsive, 100% React-based web application for student jobs and recruiter hiring, running entirely on the client side with persistent **`localStorage`** state management. **No backend or external database is required.**

---

## 🚀 Quick Start (Evaluation Guide)

### 1. Install & Run
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to the local URL (usually `http://localhost:5173`).

---

## 🔑 Demo Login Credentials

The application automatically seeds realistic demo data into `localStorage` upon first load.

### Student Accounts
| Role | Email | Password | College |
| :--- | :--- | :--- | :--- |
| **Student** | `rahul@example.com` | `password123` | Delhi University |
| **Student** | `priya@example.com` | `password123` | St. Xavier's College |
| **Student** | `aarav@example.com` | `password123` | IIT Delhi |

### Recruiter Accounts
| Company | Email | Password | Industry |
| :--- | :--- | :--- | :--- |
| **Blue Tokai Coffee Roasters** | `rohan@bluetokai.com` | `password123` | Food & Hospitality |
| **Urban Culture Co.** | `ananya@urbanculture.in` | `password123` | Retail |
| **TechFlow Labs** | `vikram@techflow.io` | `password123` | Technology |

> **Note:** You can also register brand new Student or Recruiter accounts directly via the Registration page! All changes persist in `localStorage`.

---

## 🌟 Key Features (1st Eval Ready)

1. **Pure React Architecture**:
   - Built with Vite + React 19, React Router v7, and Lucide Icons.
   - Zero backend server dependencies.
   - All state (Users, Jobs, Applications, Saved Jobs) is stored in browser `localStorage`.

2. **Role-Based Authentication & Navigation**:
   - Role switching (Student / Recruiter).
   - Protected routes based on active role.
   - Persistent session across reloads.

3. **Student Features**:
   - Browse active job listings with search, type filters (On-site, Remote, Hybrid), and sorting.
   - Apply for jobs and withdraw applications in real-time.
   - Bookmark / Save favorite jobs.
   - View application history and status.

4. **Recruiter Features**:
   - Post new part-time / student job listings.
   - Manage existing listings (toggle status Active/Paused, delete jobs).
   - View real-time applicant profiles (name, email, degree, availability).

5. **Theme Support**:
   - Dark Mode / Light Mode toggle persisted in storage.
