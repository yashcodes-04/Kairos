# Kairos - Student & Recruiter Part-Time Job Portal

A modern, responsive, 100% React-based web application connecting students seeking flexible work with local recruiters and employers.

Built with **Vite + React 19**, **React Router v7**, and **Vanilla CSS** featuring state-driven architecture (`useState`, `Context API`), dynamic filtering, dark/light theme switching, and role-based workspaces.

---

## 🚀 Quick Start (Running Locally)

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 2. Setup & Start
```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Open your browser and navigate to the local URL (usually `http://localhost:5173`).

---

## 🔑 Demo Login Accounts

The project includes pre-configured demo accounts for both roles:

### 1. Student Account
| Field | Value |
| :--- | :--- |
| **Role** | Student |
| **Email** | `rahul@example.com` |
| **Password** | `password123` |
| **Profile** | Rahul Sharma • Chitkara University, Punjab Campus • BCA |

### 2. Recruiter Account
| Field | Value |
| :--- | :--- |
| **Role** | Recruiter |
| **Company** | `Dr Tea Cafe` |
| **Email** | `gurpreet@drteacafe.example` |
| **Password** | `password123` |
| **Profile** | Gurpreet Singh • Cafe Manager • Food & hospitality |

> 💡 **Quick Login:** On the sign-in page, click the **"Demo accounts"** dropdown at the top to auto-fill credentials instantly.

---

## 🌟 Core Features

### 🎓 Student Workspace
- **Live Job Feed**: Browse active part-time listings near campus with details on pay, hours, vacancies, and work type.
- **Dynamic Search & Filters**: Instant search across titles, locations, and categories using React state and `.filter()`.
- **Apply & Withdraw**: Apply to openings with real-time status updates (*Applied / Under Review* vs *Accepted*).
- **Bookmark / Save Jobs**: Save jobs for quick access later.

### 🏢 Recruiter Workspace
- **Post Openings**: Publish new roles with custom titles, pay rates, hours, location, and role descriptions.
- **Manage Job Status**: Toggle job listings between *Active* and *Paused*, or delete postings.
- **Applicant Review**: View student applicant profiles (name, university, course, availability) and accept candidates with a single click.
- **Direct Contact**: Quick email link to reach accepted applicants directly.

### 🎨 Design & Utilities
- **Dark Mode / Light Mode**: Smooth theme toggling across the entire application using React Context.
- **Profile Management**: Dedicated settings page for updating personal, academic, and business details.
- **In-Memory State Management**: Pure state-driven architecture (`useState` and in-memory mock service).

---

## 📂 Project Structure

```text
frontend/
├── public/
│   └── favicon.png              # App icon
├── src/
│   ├── components/
│   │   ├── JobCardRecruiter.jsx # Recruiter job card with applicant actions
│   │   ├── JobCardStudent.jsx   # Student job card with apply/save actions
│   │   ├── Navbar.jsx           # Global header with theme toggle & settings
│   │   └── ProtectedRoute.jsx   # Role-based route protection
│   ├── context/
│   │   ├── AuthContext.jsx      # User session state
│   │   └── ThemeContext.jsx     # Dark / Light mode state
│   ├── pages/
│   │   ├── LoginPage.jsx        # Dual-role authentication & demo auto-fill
│   │   ├── RegisterPage.jsx     # Student & Recruiter account registration
│   │   ├── StudentDashboard.jsx # Student job discovery & application center
│   │   ├── RecruiterDashboard.jsx# Recruiter job posting & candidate review
│   │   ├── SettingsPage.jsx     # Profile edit and account preferences
│   │   └── NotFoundPage.jsx     # 404 handler
│   ├── services/
│   │   └── api.js               # Clean in-memory mock service layer
│   ├── App.jsx                  # Main router and providers
│   ├── index.css                # Premium responsive styling & design tokens
│   └── main.jsx                 # Vite application entry point
├── package.json
└── vite.config.js
```

---

## 📅 Evaluation Roadmap

- **Evaluation 1 (Current)**:
  - Core React UI & component breakdown.
  - State management using `useState`, `props`, and `.map()` / `.filter()`.
  - In-memory data store for live demos.
  - Theme toggle (Dark/Light) & Profile updates.
- **Evaluation 2**:
  - `localStorage` client persistence.
  - Advanced multi-criteria filtering & bookmark management.
- **Evaluation 3**:
  - In-app direct messaging between students and recruiters.
  - Backend integration (Node.js/Express REST API).
