# Kairos - Application User & Data Flow Guide

This document outlines the complete user journeys, data flow, status lifecycles, Razorpay payment & refund flows, and cross-cutting event mechanisms across the Kairos platform.

---

## 1. High-Level System Flow Diagram

```mermaid
flowchart TD
    Start([Visitor Arrives]) --> Landing[Landing Page /]
    Landing -->|Click Get Started / Sign In| Auth[Login & Register /login, /register]
    
    Auth -->|Select Student Role| StudentCheck{Authenticated?}
    Auth -->|Select Recruiter Role| RecruiterCheck{Authenticated?}

    StudentCheck -->|Yes| StudentDash[Student Workspace /student]
    RecruiterCheck -->|Yes| RecruiterDash[Recruiter Workspace /recruiter]

    subgraph StudentFlow ["🎓 Student Workspace Journey"]
        StudentDash --> TabJobs[Job Discovery & Search]
        StudentDash --> TabApps[My Applications]
        StudentDash --> TabSkills[Peer Skill Exchange]
        StudentDash --> TabBooked[Booked Sessions & History]
        StudentDash --> TabCreateSess[Create Skill Session with Fee]
        StudentDash --> TabMySess[My Hosted Sessions]
        StudentDash --> TabProfile[Portfolio & Resume /portfolio/edit]
    end

    subgraph RecruiterFlow ["🏢 Recruiter Workspace Journey"]
        RecruiterDash --> MergedView[Merged View: My Listings & Post Role]
        MergedView -->|Left Column| PostJobForm[Post Part-time Job Form]
        MergedView -->|Right Column| PostedListings[Posted Jobs & Live Applicants]
        RecruiterDash --> TabApplicants[Candidate Review Pipeline]
    end

    subgraph CrossCutting ["⚙️ Cross-Cutting Features"]
        Settings[Sidebar Settings: Profile, Theme Light/Dark, Log out]
        Notifs[Notification Popover & Toast Alerts]
        RazorpayModule[Razorpay Payment & Refund Tracker]
        Shortcuts[Keyboard Shortcut: Ctrl + B to Sign Out]
    end

    StudentDash -.-> CrossCutting
    RecruiterDash -.-> CrossCutting
```

---

## 2. Authentication & Authorization Flow

1. **Visitor Landing**:
   - The user visits the app root (`/#/`).
   - The landing page showcases the value proposition, live stats, student peer exchange, and dual entry points.

2. **Login / Registration**:
   - Route: `/#/login` or `/#/register`.
   - Dual-role switch: `Student` or `Recruiter`.
   - **Demo Accounts Button**: Quick-fill dropdown at the top of the login screen allows instant evaluation without typing credentials.
   - Upon successful credentials verification in `api.login()`, the user object and authentication token are saved in `AuthContext` (persisted in `localStorage`).

3. **Role-Based Redirection (`ProtectedRoute.jsx`)**:
   - Checks if user is authenticated: if not, redirects to `/login`.
   - Checks if user has the required role (`allowedRole`):
     - `Student` trying to access `/recruiter` is redirected to `/student`.
     - `Recruiter` trying to access `/student` is redirected to `/recruiter`.

---

## 3. Student Workflow Details

### A. Job Discovery & Application Flow
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as StudentDashboard
    participant Store as Redux (jobsSlice)
    participant API as api.js (Mock Service)
    participant Recruiter as RecruiterDashboard

    Student->>UI: Enter search term or select filter tab (All/Saved/Applied/Accepted/Rejected)
    UI->>UI: Filter jobs locally using useMemo
    Student->>UI: Click "Apply" on Job Card
    UI->>API: api.applyToJob(studentId, jobId)
    API-->>UI: Return updated application status ("Applied")
    UI->>UI: Trigger toast: "Application submitted"
    UI->>Recruiter: Emit CustomEvent 'kairos_application_updated'
    Note over Recruiter: Recruiter view automatically updates pending applicant count!
    
    alt Recruiter Accepts
        Recruiter->>API: api.updateApplicationStatus(appId, recruiterId, 'Accepted')
        API-->>UI: Student sees green "Accepted" badge & contact details
    else Recruiter Rejects
        Recruiter->>API: api.updateApplicationStatus(appId, recruiterId, 'Rejected')
        API-->>UI: Student sees red "Rejected" badge, callout, and counter
    end
```

1. **Browse Roles**: Students filter through campus and hybrid jobs by keyword, category, or status tab (`All`, `Saved`, `Applied`, `Accepted`, `Rejected`).
2. **Detailed View**: Full role description, recruiter company details, and compensation.
3. **Save for Later**: Clicking the bookmark icon toggles saved jobs instantly.
4. **My Applications Tab**: Tracks all submitted roles with status badges:
   - `Applied / Under Review` (Gold badge)
   - `Accepted` (Green badge with employer contact instructions)
   - `Rejected` (Red badge with respectful feedback notice)
   - `Positions Filled` badge when vacancies run out.
   - `Saved` (Blue badge)

---

### B. Peer Skill Exchange & Razorpay Payment/Refund Flow
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as SkillExchangePage
    participant Razorpay as Razorpay Checkout SDK
    participant API as api.js (Booking Store)
    participant BookedUI as BookedSessionsPage

    Student->>UI: Click "Book session" (Paid role e.g. ₹99)
    UI->>Razorpay: payWithRazorpay({ amount: fee, prefill })
    Razorpay-->>Student: Opens official Razorpay modal (UPI/Card/Netbanking)
    Student->>Razorpay: Simulates payment success
    Razorpay-->>UI: Returns razorpay_payment_id ("pay_...")
    UI->>API: api.bookSkillSession(studentId, sessionId, { paymentId, amountPaid })
    API-->>UI: Booking confirmed (Seat count decreased by 1)
    UI->>UI: Toast: "Payment successful — ₹99 paid"

    opt User Cancels Booking
        Student->>BookedUI: Click "Cancel booking"
        BookedUI->>BookedUI: Displays confirmation dialog with refund notice
        Student->>BookedUI: Confirms cancellation
        BookedUI->>API: api.cancelSkillSessionBooking(studentId, sessionId)
        API->>API: Generates refund_id (rfnd_...), restores seat (+1)
        API-->>BookedUI: Returns refund info
        BookedUI->>BookedUI: Toast: "₹99 will be credited back in 2-3 working hours"
        BookedUI->>BookedUI: Moves booking to "History" tab with refund badge
    end
```

1. **Browse Sessions**: Students discover micro-learning workshops with clear fee badges (`Free` or `₹99`, `₹199`).
2. **Book Paid Session**: Clicking book triggers Razorpay Checkout dynamically. Once approved, `api.bookSkillSession` stores the `paymentId` and marks the session as booked.
3. **Seat Management**: Available seats decrement immediately. Sessions with 0 seats remaining show `Full`.
4. **Cancellation & Refund**:
   - Students can cancel from **"Booked sessions"** before a meeting link is shared.
   - For paid sessions, a modal confirms the refund initiation.
   - Generates a tracking ID (`rfnd_...`), increments the seats back by 1, and moves the session to the **History** tab.
   - Displays: *"Refund initiated (₹XX) · Expected in 2-3 working days"* along with notification alerts.
5. **Attendee-Only Meeting Links**:
   - In "My sessions", the host can provide a Google Meet/Zoom link.
   - Enrolled students receive a notification and a **"Join meeting"** button.
   - Once a link is provided, cancellation is locked to safeguard confirmed sessions.

---

### C. Student Portfolio & Resume Flow
- Accessible from sidebar: **Edit portfolio** (`/#/portfolio/edit`) and **View portfolio** (`/#/profile`).
- Students can update their Bio, add taggable Skills, link GitHub/Live projects, and upload a PDF resume file.
- When applying to jobs, recruiters see the student's name, college, course, bio, and resume link.

---

## 4. Recruiter Workflow Details

### A. Unified Job Posting & Management Flow
1. **My listings**: Displays the merged two-column layout with posted job listings and fast job creation form.
2. **Applicants**: Dedicated candidate review pipeline with live **pending reviews counter badge**.
3. **Publishing a Role**: Validated and added to the store via Redux `createJob` without page reload.
4. **Managing Postings**: Pause/activate listings or remove jobs.

### B. Candidate Review Pipeline Flow
- **Final Decisions**: Once marked **Accepted** or **Rejected**, decisions are permanent.
- **Auto-Pausing & Auto-Rejection**: When the last vacancy for a job is accepted, the listing automatically pauses and remaining applicants receive an auto-rejected status with "Positions Filled" indicators.
- Quick `mailto:` button allows direct email communication with accepted students.

---

## 5. Real-Time Cross-Tab & Event Flow

The app maintains synchronized state across multiple browser tabs and components without a heavy websocket server:
- **Custom Event Bus**: `window.dispatchEvent(new CustomEvent('kairos_application_updated'))` and `new Event('kairos_sessions_updated')`.
- **Storage Sync**: `window.addEventListener('storage', ...)` and `localStorage` persistence sync session and application states.

---

## 6. Theme & Settings Flow

1. **Sidebar Settings Trigger**: Available in both Student and Recruiter sidebars at the bottom.
2. **Appearance Switch**: Clicking **Light** or **Dark** updates `ThemeContext`, adding/removing `.dark-theme` on `document.body`.
3. **Sign Out**: Click "Log out" or press <kbd>Ctrl</kbd> + <kbd>B</kbd> keyboard shortcut.
