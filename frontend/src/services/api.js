// LocalStorage-based Mock API Service for Kairos

const STORAGE_KEYS = {
  STUDENTS: 'kairos_students',
  RECRUITERS: 'kairos_recruiters',
  JOBS: 'kairos_jobs',
  APPLICATIONS: 'kairos_applications',
  SAVED_JOBS: 'kairos_saved_jobs',
  MESSAGES: 'kairos_messages',
  INITIALIZED: 'kairos_mock_data_v2',
  DEMO_VERSION: 'kairos_demo_data_version',
};

const DEMO_DATA_VERSION = 'chitkara-rajpura-v2';

const INITIAL_STUDENTS = [
  { id: 1, full_name: 'Rahul Sharma', email: 'rahul@example.com', password: 'password123', college: 'Chitkara University, Punjab Campus', course: 'BCA', availability: 'Weekdays', created_at: new Date(Date.now() - 7 * 86400000).toISOString() },
  { id: 2, full_name: 'Priya Patel', email: 'priya@example.com', password: 'password123', college: 'Chitkara University, Punjab Campus', course: 'BBA Marketing', availability: 'Weekends', created_at: new Date(Date.now() - 5 * 86400000).toISOString() },
];

const INITIAL_RECRUITERS = [
  { recruiter_id: 1, full_name: 'Gurpreet Singh', email: 'gurpreet@drteacafe.example', password: 'password123', company_name: 'Dr Tea Cafe', job_title: 'Cafe Manager', industry: 'Food & hospitality', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
  { recruiter_id: 2, full_name: 'Mehak Kaur', email: 'mehak@dosahub.example', password: 'password123', company_name: 'Dosa Hub', job_title: 'Shift Supervisor', industry: 'Food & hospitality', created_at: new Date(Date.now() - 10 * 86400000).toISOString() },
];

const INITIAL_JOBS = [
  { id: 1, recruiter_id: 1, title: 'Cafe Counter Assistant', work_type: 'On-site', location: 'Village Jansla, near Chitkara University', hours: '15-20 hours', pay: '250', vacancies: 2, description: 'Handle orders, serve beverages, and keep the counter ready during student rush hours. Morning and evening shifts available.', status: 'Active', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 2, recruiter_id: 2, title: 'Service Crew Member', work_type: 'On-site', location: 'Rajpura-Patiala Highway, near Chitkara', hours: '12-18 hours', pay: '230', vacancies: 1, description: 'Support table service, take orders, and help with takeaway packing during lunch and evening shifts.', status: 'Active', created_at: new Date(Date.now() - 4 * 86400000).toISOString() },
  { id: 3, recruiter_id: 2, title: 'Kitchen and Service Assistant', work_type: 'On-site', location: 'Rajpura-Patiala Highway, near Chitkara', hours: '10-15 hours', pay: '230', vacancies: 1, description: 'Assist the kitchen team with prep, serve customers, and keep the dining area organised during busy periods.', status: 'Active', created_at: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 4, recruiter_id: 1, title: 'Weekend Cafe Helper', work_type: 'On-site', location: 'Village Jansla, near Chitkara University', hours: '6-10 hours', pay: '220', vacancies: 1, description: 'Help with stock checks, counter clean-up, and takeaway orders on weekend mornings and evenings.', status: 'Active', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

const INITIAL_APPLICATIONS = [
  {
    id: 1,
    job_id: 1,
    student_id: 1,
    status: 'Applied',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 2,
    job_id: 1,
    student_id: 2,
    status: 'Applied',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 3,
    job_id: 2,
    student_id: 1,
    status: 'Accepted',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

const INITIAL_SAVED_JOBS = [
  { student_id: 1, job_id: 3, created_at: new Date().toISOString() },
  { student_id: 1, job_id: 4, created_at: new Date().toISOString() },
];

const INITIAL_MESSAGES = [
  { id: 1, application_id: 3, sender_id: 2, sender_role: 'Recruiter', sender_name: 'Mehak Kaur', text: 'Hi Rahul! We have a part-time opening at Dosa Hub near campus and would like to discuss the shifts with you.', created_at: new Date(Date.now() - 1 * 86400000).toISOString() },
  { id: 2, application_id: 3, sender_id: 1, sender_role: 'Student', sender_name: 'Rahul Sharma', text: 'Hello Mehak! Thank you for accepting my application. I can work around my classes and would be happy to discuss the schedule.', created_at: new Date(Date.now() - 18 * 3600000).toISOString() },
  { id: 3, application_id: 3, sender_id: 2, sender_role: 'Recruiter', sender_name: 'Mehak Kaur', text: 'Are you available this Friday around 3:00 PM for a short introduction call?', created_at: new Date(Date.now() - 4 * 3600000).toISOString() },
];

// Helper to seed localStorage
function initializeLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.RECRUITERS, JSON.stringify(INITIAL_RECRUITERS));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(INITIAL_SAVED_JOBS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

function migrateDemoData() {
  if (localStorage.getItem(STORAGE_KEYS.DEMO_VERSION) === DEMO_DATA_VERSION) return;

  const replaceSeededRecords = (key, seededRecords, idField) => {
    const seededIds = new Set(seededRecords.map((record) => Number(record[idField])));
    const currentRecords = getItems(key, []);
    const userRecords = currentRecords.filter((record) => !seededIds.has(Number(record[idField])));
    setItems(key, [...seededRecords, ...userRecords]);
  };

  replaceSeededRecords(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS, 'id');
  replaceSeededRecords(STORAGE_KEYS.RECRUITERS, INITIAL_RECRUITERS, 'recruiter_id');
  replaceSeededRecords(STORAGE_KEYS.JOBS, INITIAL_JOBS, 'id');
  replaceSeededRecords(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS, 'id');
  replaceSeededRecords(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES, 'id');
  setItems(STORAGE_KEYS.SAVED_JOBS, INITIAL_SAVED_JOBS);
  localStorage.setItem(STORAGE_KEYS.DEMO_VERSION, DEMO_DATA_VERSION);
}

// Initialize on load
initializeLocalStorage();
migrateDemoData();

// Storage helper functions
function getItems(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItems(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function formatDate(dateString) {
  if (!dateString) return 'recently';
  const d = new Date(dateString);
  const day = d.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${monthNames[d.getMonth()]}`;
}

// Simulate slight async response for UI smoothness
const asyncWrap = (fn) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const result = fn();
        resolve(result);
      } catch (err) {
        reject(err);
      }
    }, 60);
  });
};

export const api = {
  // Auth: Login
  login: async (credentials) => {
    return asyncWrap(() => {
      const { email, password, role, company = '' } = credentials;
      const normalizedEmail = (email || '').trim().toLowerCase();

      if (role === 'Student') {
        const students = getItems(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
        const student = students.find((s) => s.email.toLowerCase() === normalizedEmail);

        if (!student || student.password !== password) {
          throw new Error('Your email or password does not match.');
        }

        return {
          id: student.id,
          name: student.full_name,
          email: student.email,
          role: 'Student',
          company: '',
        };
      } else {
        const recruiters = getItems(STORAGE_KEYS.RECRUITERS, INITIAL_RECRUITERS);
        const recruiter = recruiters.find((r) => r.email.toLowerCase() === normalizedEmail);

        if (
          !recruiter ||
          recruiter.password !== password ||
          recruiter.company_name.trim().toLowerCase() !== company.trim().toLowerCase()
        ) {
          throw new Error('Your email, password, or company does not match.');
        }

        return {
          id: recruiter.recruiter_id,
          name: recruiter.full_name,
          email: recruiter.email,
          role: 'Recruiter',
          company: recruiter.company_name,
        };
      }
    });
  },

  // Auth: Register
  register: async (userData) => {
    return asyncWrap(() => {
      const { name, email, password, role, college, course, availability, company, jobTitle, industry } = userData;

      if (!name || !email || !password || !['Student', 'Recruiter'].includes(role)) {
        throw new Error('Please complete the required fields.');
      }

      const normalizedEmail = email.trim().toLowerCase();

      if (role === 'Student') {
        if (!college || !course || !availability) {
          throw new Error('Please complete your student profile.');
        }

        const students = getItems(STORAGE_KEYS.STUDENTS, []);
        if (students.some((s) => s.email.toLowerCase() === normalizedEmail)) {
          throw new Error('An account with this email already exists.');
        }

        const newId = students.length > 0 ? Math.max(...students.map((s) => s.id || 0)) + 1 : 1;
        const newStudent = {
          id: newId,
          full_name: name.trim(),
          email: normalizedEmail,
          password,
          college: college.trim(),
          course: course.trim(),
          availability,
          created_at: new Date().toISOString(),
        };

        students.push(newStudent);
        setItems(STORAGE_KEYS.STUDENTS, students);

        return {
          id: newId,
          name: newStudent.full_name,
          email: newStudent.email,
          role: 'Student',
          company: '',
        };
      } else {
        if (!company || !jobTitle || !industry) {
          throw new Error('Please complete your company profile.');
        }

        const recruiters = getItems(STORAGE_KEYS.RECRUITERS, []);
        if (recruiters.some((r) => r.email.toLowerCase() === normalizedEmail)) {
          throw new Error('An account with this email already exists.');
        }

        const newId = recruiters.length > 0 ? Math.max(...recruiters.map((r) => r.recruiter_id || 0)) + 1 : 1;
        const newRecruiter = {
          recruiter_id: newId,
          full_name: name.trim(),
          email: normalizedEmail,
          password,
          company_name: company.trim(),
          job_title: jobTitle.trim(),
          industry,
          created_at: new Date().toISOString(),
        };

        recruiters.push(newRecruiter);
        setItems(STORAGE_KEYS.RECRUITERS, recruiters);

        return {
          id: newId,
          name: newRecruiter.full_name,
          email: newRecruiter.email,
          role: 'Recruiter',
          company: newRecruiter.company_name,
        };
      }
    });
  },

  // Profile Endpoints: Load the complete profile for the signed-in user
  getProfile: async (userId, role) => {
    return asyncWrap(() => {
      if (role === 'Student') {
        const student = getItems(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS).find((item) => Number(item.id) === Number(userId));
        if (!student) throw new Error('Student profile not found.');
        return { name: student.full_name, email: student.email, college: student.college, course: student.course, availability: student.availability };
      }

      const recruiter = getItems(STORAGE_KEYS.RECRUITERS, INITIAL_RECRUITERS).find((item) => Number(item.recruiter_id) === Number(userId));
      if (!recruiter) throw new Error('Recruiter profile not found.');
      return { name: recruiter.full_name, email: recruiter.email, company: recruiter.company_name, jobTitle: recruiter.job_title, industry: recruiter.industry };
    });
  },

  // Profile Endpoints: Update profile details and return the refreshed session user
  updateProfile: async ({ userId, role, profile }) => {
    return asyncWrap(() => {
      const name = profile.name?.trim();
      const email = profile.email?.trim().toLowerCase();
      if (!name || !email) throw new Error('Name and email are required.');

      if (role === 'Student') {
        const college = profile.college?.trim();
        const course = profile.course?.trim();
        if (!college || !course || !profile.availability) throw new Error('Please complete every student profile field.');
        const students = getItems(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
        const index = students.findIndex((item) => Number(item.id) === Number(userId));
        if (index === -1) throw new Error('Student profile not found.');
        if (students.some((item, itemIndex) => itemIndex !== index && item.email.toLowerCase() === email)) throw new Error('An account with this email already exists.');
        students[index] = { ...students[index], full_name: name, email, college, course, availability: profile.availability };
        setItems(STORAGE_KEYS.STUDENTS, students);
        return { id: students[index].id, name, email, role: 'Student', company: '' };
      }

      const company = profile.company?.trim();
      const jobTitle = profile.jobTitle?.trim();
      if (!company || !jobTitle || !profile.industry) throw new Error('Please complete every company profile field.');
      const recruiters = getItems(STORAGE_KEYS.RECRUITERS, INITIAL_RECRUITERS);
      const index = recruiters.findIndex((item) => Number(item.recruiter_id) === Number(userId));
      if (index === -1) throw new Error('Recruiter profile not found.');
      if (recruiters.some((item, itemIndex) => itemIndex !== index && item.email.toLowerCase() === email)) throw new Error('An account with this email already exists.');
      recruiters[index] = { ...recruiters[index], full_name: name, email, company_name: company, job_title: jobTitle, industry: profile.industry };
      setItems(STORAGE_KEYS.RECRUITERS, recruiters);
      return { id: recruiters[index].recruiter_id, name, email, role: 'Recruiter', company };
    });
  },

  // Student Endpoints: Get Active Jobs with Recruiter details
  getActiveJobs: async () => {
    return asyncWrap(() => {
      const jobs = getItems(STORAGE_KEYS.JOBS, INITIAL_JOBS);
      const recruiters = getItems(STORAGE_KEYS.RECRUITERS, INITIAL_RECRUITERS);

      return jobs
        .filter((j) => j.status === 'Active')
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .map((job) => {
          const recruiter = recruiters.find((r) => r.recruiter_id === job.recruiter_id) || {};
          return {
            id: job.id,
            title: job.title,
            company: recruiter.company_name || 'Verified Company',
            recruiter_name: recruiter.full_name || 'Hiring Team',
            recruiter_email: recruiter.email || '',
            recruiter_role: recruiter.job_title || 'Recruiter',
            industry: recruiter.industry || 'General',
            type: job.work_type,
            location: job.location,
            hours: job.hours,
            pay: job.pay,
            vacancies: job.vacancies,
            description: job.description,
            status: job.status,
            posted: formatDate(job.created_at),
          };
        });
    });
  },

  // Student Endpoints: Saved Jobs
  getSavedJobIds: async (studentId) => {
    return asyncWrap(() => {
      const saved = getItems(STORAGE_KEYS.SAVED_JOBS, INITIAL_SAVED_JOBS);
      return saved
        .filter((s) => Number(s.student_id) === Number(studentId))
        .map((s) => Number(s.job_id));
    });
  },

  saveJob: async (studentId, jobId) => {
    return asyncWrap(() => {
      const saved = getItems(STORAGE_KEYS.SAVED_JOBS, []);
      const exists = saved.some(
        (s) => Number(s.student_id) === Number(studentId) && Number(s.job_id) === Number(jobId)
      );
      if (!exists) {
        saved.push({
          student_id: Number(studentId),
          job_id: Number(jobId),
          created_at: new Date().toISOString(),
        });
        setItems(STORAGE_KEYS.SAVED_JOBS, saved);
      }
      return { message: 'Job saved.' };
    });
  },

  removeSavedJob: async (studentId, jobId) => {
    return asyncWrap(() => {
      let saved = getItems(STORAGE_KEYS.SAVED_JOBS, []);
      saved = saved.filter(
        (s) => !(Number(s.student_id) === Number(studentId) && Number(s.job_id) === Number(jobId))
      );
      setItems(STORAGE_KEYS.SAVED_JOBS, saved);
      return { message: 'Saved job removed.' };
    });
  },

  // Student Endpoints: Applications
  getAppliedJobIds: async (studentId) => {
    return asyncWrap(() => {
      const apps = getItems(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      return apps
        .filter((a) => Number(a.student_id) === Number(studentId))
        .map((a) => Number(a.job_id));
    });
  },

  applyForJob: async (jobId, studentId) => {
    return asyncWrap(() => {
      if (!studentId) throw new Error('Student ID is required.');
      const apps = getItems(STORAGE_KEYS.APPLICATIONS, []);
      const exists = apps.some(
        (a) => Number(a.job_id) === Number(jobId) && Number(a.student_id) === Number(studentId)
      );

      if (!exists) {
        const newId = apps.length > 0 ? Math.max(...apps.map((a) => a.id || 0)) + 1 : 1;
        apps.push({
          id: newId,
          job_id: Number(jobId),
          student_id: Number(studentId),
          status: 'Applied',
          created_at: new Date().toISOString(),
        });
        setItems(STORAGE_KEYS.APPLICATIONS, apps);
      }
      return { message: 'Application submitted successfully.' };
    });
  },

  withdrawApplication: async (jobId, studentId) => {
    return asyncWrap(() => {
      if (!studentId) throw new Error('Student ID is required.');
      let apps = getItems(STORAGE_KEYS.APPLICATIONS, []);
      apps = apps.filter(
        (a) => !(Number(a.job_id) === Number(jobId) && Number(a.student_id) === Number(studentId))
      );
      setItems(STORAGE_KEYS.APPLICATIONS, apps);
      return { message: 'Application withdrawn.' };
    });
  },

  // Recruiter Endpoints: Get Jobs Posted by Recruiter
  getRecruiterJobs: async (recruiterId) => {
    return asyncWrap(() => {
      const jobs = getItems(STORAGE_KEYS.JOBS, INITIAL_JOBS);
      return jobs
        .filter((j) => Number(j.recruiter_id) === Number(recruiterId))
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .map((job) => ({
          id: job.id,
          title: job.title,
          type: job.work_type,
          location: job.location,
          hours: job.hours,
          pay: job.pay,
          vacancies: job.vacancies,
          description: job.description,
          status: job.status,
          posted: formatDate(job.created_at),
        }));
    });
  },

  // Recruiter Endpoints: Get Applicants for Recruiter's Jobs
  getRecruiterApplications: async (recruiterId) => {
    return asyncWrap(() => {
      const jobs = getItems(STORAGE_KEYS.JOBS, INITIAL_JOBS);
      const apps = getItems(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      const students = getItems(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

      const recruiterJobIds = new Set(
        jobs.filter((j) => Number(j.recruiter_id) === Number(recruiterId)).map((j) => Number(j.id))
      );

      const relevantApps = apps.filter((a) => recruiterJobIds.has(Number(a.job_id)));

      return relevantApps
        .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
        .map((app) => {
          const student = students.find((s) => Number(s.id) === Number(app.student_id)) || {};
          const job = jobs.find((j) => Number(j.id) === Number(app.job_id)) || {};
          return {
            application_id: app.id,
            job_id: app.job_id,
            job_title: job.title || 'Job Listing',
            status: app.status || 'Applied',
            applied_at: formatDate(app.created_at),
            student_id: student.id || app.student_id,
            student_name: student.full_name || 'Student Applicant',
            student_email: student.email || '',
            college: student.college || 'College',
            course: student.course || 'Degree',
            availability: student.availability || 'Flexible',
          };
        });
    });
  },

  // Recruiter: Accept or Reject an Application
  updateApplicationStatus: async (applicationId, recruiterId, newStatus) => {
    return asyncWrap(() => {
      if (!['Accepted', 'Rejected', 'Applied'].includes(newStatus)) {
        throw new Error('Invalid application status.');
      }

      const apps = getItems(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      const jobs = getItems(STORAGE_KEYS.JOBS, INITIAL_JOBS);
      const recruiters = getItems(STORAGE_KEYS.RECRUITERS, INITIAL_RECRUITERS);
      const students = getItems(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

      const appIndex = apps.findIndex((a) => Number(a.id) === Number(applicationId));
      if (appIndex === -1) {
        throw new Error('Application not found.');
      }

      const app = apps[appIndex];
      const job = jobs.find((j) => Number(j.id) === Number(app.job_id));

      if (!job || Number(job.recruiter_id) !== Number(recruiterId)) {
        throw new Error('Unauthorized to update this application.');
      }

      apps[appIndex].status = newStatus;
      setItems(STORAGE_KEYS.APPLICATIONS, apps);

      // If accepted, check if an introductory message already exists; if not, create one
      if (newStatus === 'Accepted') {
        const messages = getItems(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
        const hasExistingMessage = messages.some((m) => Number(m.application_id) === Number(applicationId));

        if (!hasExistingMessage) {
          const recruiter = recruiters.find((r) => Number(r.recruiter_id) === Number(recruiterId));
          const student = students.find((s) => Number(s.id) === Number(app.student_id));
          const studentFirstName = student?.full_name ? student.full_name.split(' ')[0] : 'there';

          const newMsgId = messages.length > 0 ? Math.max(...messages.map((m) => m.id || 0)) + 1 : 1;
          const introMsg = {
            id: newMsgId,
            application_id: Number(applicationId),
            sender_id: Number(recruiterId),
            sender_role: 'Recruiter',
            sender_name: recruiter?.full_name || 'Hiring Manager',
            text: `Hi ${studentFirstName}! Your application for "${job.title}" has been accepted. We'd love to chat about next steps!`,
            created_at: new Date().toISOString(),
          };
          messages.push(introMsg);
          setItems(STORAGE_KEYS.MESSAGES, messages);
        }
      }

      // Dispatch event so active pages and tabs update
      try {
        window.dispatchEvent(new CustomEvent('kairos_application_updated', { detail: { applicationId, newStatus } }));
      } catch (_) {}

      return { message: `Application ${newStatus.toLowerCase()} successfully.` };
    });
  },

  // Student Endpoints: Get all applications with detailed statuses
  getStudentApplications: async (studentId) => {
    return asyncWrap(() => {
      const apps = getItems(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      const jobs = getItems(STORAGE_KEYS.JOBS, INITIAL_JOBS);
      const recruiters = getItems(STORAGE_KEYS.RECRUITERS, INITIAL_RECRUITERS);

      const studentApps = apps.filter((a) => Number(a.student_id) === Number(studentId));

      return studentApps.map((app) => {
        const job = jobs.find((j) => Number(j.id) === Number(app.job_id)) || {};
        const recruiter = recruiters.find((r) => Number(r.recruiter_id) === Number(job.recruiter_id)) || {};

        return {
          application_id: app.id,
          job_id: app.job_id,
          job_title: job.title || 'Job Listing',
          work_type: job.work_type || 'On-site',
          location: job.location || '',
          pay: job.pay || '',
          hours: job.hours || '',
          status: app.status || 'Applied',
          applied_at: formatDate(app.created_at),
          recruiter_id: recruiter.recruiter_id || job.recruiter_id,
          recruiter_name: recruiter.full_name || 'Hiring Manager',
          company_name: recruiter.company_name || 'Verified Company',
          recruiter_email: recruiter.email || '',
        };
      });
    });
  },

  // Messaging Endpoints: Get active conversation threads for a user
  getConversations: async (userId, role) => {
    return asyncWrap(() => {
      const apps = getItems(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      const jobs = getItems(STORAGE_KEYS.JOBS, INITIAL_JOBS);
      const recruiters = getItems(STORAGE_KEYS.RECRUITERS, INITIAL_RECRUITERS);
      const students = getItems(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
      const messages = getItems(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);

      let eligibleApps = [];

      if (role === 'Recruiter') {
        const recruiterJobIds = new Set(
          jobs.filter((j) => Number(j.recruiter_id) === Number(userId)).map((j) => Number(j.id))
        );
        // Include applications that are accepted or have messages
        eligibleApps = apps.filter((a) => {
          if (!recruiterJobIds.has(Number(a.job_id))) return false;
          const hasMsgs = messages.some((m) => Number(m.application_id) === Number(a.id));
          return a.status === 'Accepted' || hasMsgs;
        });
      } else {
        eligibleApps = apps.filter((a) => {
          if (Number(a.student_id) !== Number(userId)) return false;
          const hasMsgs = messages.some((m) => Number(m.application_id) === Number(a.id));
          return a.status === 'Accepted' || hasMsgs;
        });
      }

      return eligibleApps.map((app) => {
        const job = jobs.find((j) => Number(j.id) === Number(app.job_id)) || {};
        const recruiter = recruiters.find((r) => Number(r.recruiter_id) === Number(job.recruiter_id)) || {};
        const student = students.find((s) => Number(s.id) === Number(app.student_id)) || {};

        const threadMsgs = messages.filter((m) => Number(m.application_id) === Number(app.id));
        const lastMsg = threadMsgs.length > 0 ? threadMsgs[threadMsgs.length - 1] : null;
        const unreadCount = threadMsgs.filter((m) => {
          const isIncoming = Number(m.sender_id) !== Number(userId) || m.sender_role !== role;
          return isIncoming && !m.seen_at;
        }).length;

        return {
          application_id: app.id,
          job_id: app.job_id,
          job_title: job.title || 'Role',
          status: app.status || 'Applied',
          student_id: student.id || app.student_id,
          student_name: student.full_name || 'Student Applicant',
          student_college: student.college || 'College',
          student_email: student.email || '',
          recruiter_id: recruiter.recruiter_id || job.recruiter_id,
          recruiter_name: recruiter.full_name || 'Recruiter',
          company_name: recruiter.company_name || 'Company',
          recruiter_email: recruiter.email || '',
          unread_count: unreadCount,
          last_message: lastMsg ? lastMsg.text : 'Application accepted. Start chatting!',
          last_message_time: lastMsg ? formatDate(lastMsg.created_at) : formatDate(app.created_at),
          message_count: threadMsgs.length,
        };
      });
    });
  },

  // Messaging Endpoints: Get unread message count for a user
  getUnreadMessageCount: async (userId, role) => {
    return asyncWrap(() => {
      if (!userId || !role) return 0;
      const apps = getItems(STORAGE_KEYS.APPLICATIONS, INITIAL_APPLICATIONS);
      const jobs = getItems(STORAGE_KEYS.JOBS, INITIAL_JOBS);
      const messages = getItems(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);

      let eligibleAppIds = new Set();
      if (role === 'Recruiter') {
        const recruiterJobIds = new Set(
          jobs.filter((j) => Number(j.recruiter_id) === Number(userId)).map((j) => Number(j.id))
        );
        apps.forEach((a) => {
          if (recruiterJobIds.has(Number(a.job_id))) {
            eligibleAppIds.add(Number(a.id));
          }
        });
      } else {
        apps.forEach((a) => {
          if (Number(a.student_id) === Number(userId)) {
            eligibleAppIds.add(Number(a.id));
          }
        });
      }

      return messages.filter((m) => {
        const isInApp = eligibleAppIds.has(Number(m.application_id));
        const isIncoming = Number(m.sender_id) !== Number(userId) || m.sender_role !== role;
        return isInApp && isIncoming && !m.seen_at;
      }).length;
    });
  },

  // Messaging Endpoints: Get message stream for a specific application
  getMessages: async (applicationId) => {
    return asyncWrap(() => {
      const messages = getItems(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
      return messages
        .filter((m) => Number(m.application_id) === Number(applicationId))
        .sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    });
  },

  // Messaging Endpoints: Send a message
  sendMessage: async ({ applicationId, senderId, senderRole, senderName, text }) => {
    return asyncWrap(() => {
      if (!applicationId || !senderId || !text || !text.trim()) {
        throw new Error('Message text cannot be empty.');
      }

      const messages = getItems(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
      const newId = messages.length > 0 ? Math.max(...messages.map((m) => m.id || 0)) + 1 : 1;

      const newMsg = {
        id: newId,
        application_id: Number(applicationId),
        sender_id: Number(senderId),
        sender_role: senderRole,
        sender_name: senderName || (senderRole === 'Recruiter' ? 'Recruiter' : 'Student'),
        text: text.trim(),
        created_at: new Date().toISOString(),
      };

      messages.push(newMsg);
      setItems(STORAGE_KEYS.MESSAGES, messages);

      // Trigger custom window events and storage notification for reactive instant UI updates
      try {
        window.dispatchEvent(new CustomEvent('kairos_message_sent', { detail: newMsg }));
      } catch (_) {}

      return newMsg;
    });
  },

  // Messaging Endpoints: Mark messages from the other participant as seen
  markMessagesAsSeen: async ({ applicationId, viewerId, viewerRole }) => {
    return asyncWrap(() => {
      if (!applicationId || !viewerId || !viewerRole) return [];

      const messages = getItems(STORAGE_KEYS.MESSAGES, INITIAL_MESSAGES);
      const seenAt = new Date().toISOString();
      const seenMessages = [];
      let changed = false;

      const updatedMessages = messages.map((message) => {
        const isInConversation = Number(message.application_id) === Number(applicationId);
        const isIncoming = Number(message.sender_id) !== Number(viewerId) || message.sender_role !== viewerRole;

        if (!isInConversation || !isIncoming || message.seen_at) return message;

        const updatedMessage = { ...message, seen_at: seenAt, seen_by_id: Number(viewerId) };
        seenMessages.push(updatedMessage);
        changed = true;
        return updatedMessage;
      });

      if (changed) {
        setItems(STORAGE_KEYS.MESSAGES, updatedMessages);
        try {
          window.dispatchEvent(new CustomEvent('kairos_messages_seen', { detail: { applicationId, messages: seenMessages } }));
        } catch (_) {}
      }

      return seenMessages;
    });
  },

  // Recruiter Endpoints: Post New Job
  postJob: async (jobData) => {
    return asyncWrap(() => {
      const { recruiterId, title, type, location, hours, pay, vacancies, description } = jobData;
      if (!recruiterId || !title || !type || !location || !hours || !pay || !vacancies || !description) {
        throw new Error('Please complete every job field.');
      }

      const jobs = getItems(STORAGE_KEYS.JOBS, []);
      const newId = jobs.length > 0 ? Math.max(...jobs.map((j) => j.id || 0)) + 1 : 1;

      const newJob = {
        id: newId,
        recruiter_id: Number(recruiterId),
        title: title.trim(),
        work_type: type,
        location: location.trim(),
        hours,
        pay: pay.trim(),
        vacancies: Number(vacancies) || 1,
        description: description.trim(),
        status: 'Active',
        created_at: new Date().toISOString(),
      };

      jobs.unshift(newJob);
      setItems(STORAGE_KEYS.JOBS, jobs);

      return { id: newId };
    });
  },

  // Recruiter Endpoints: Update Job Status
  updateJobStatus: async (jobId, recruiterId, status) => {
    return asyncWrap(() => {
      if (!recruiterId || !['Active', 'Paused'].includes(status)) {
        throw new Error('Invalid job update.');
      }

      const jobs = getItems(STORAGE_KEYS.JOBS, []);
      const index = jobs.findIndex(
        (j) => Number(j.id) === Number(jobId) && Number(j.recruiter_id) === Number(recruiterId)
      );

      if (index === -1) {
        throw new Error('Job not found.');
      }

      jobs[index].status = status;
      setItems(STORAGE_KEYS.JOBS, jobs);

      return { message: 'Job updated.' };
    });
  },

  // Recruiter Endpoints: Delete Job
  deleteJob: async (jobId, recruiterId) => {
    return asyncWrap(() => {
      let jobs = getItems(STORAGE_KEYS.JOBS, []);
      jobs = jobs.filter(
        (j) => !(Number(j.id) === Number(jobId) && Number(j.recruiter_id) === Number(recruiterId))
      );
      setItems(STORAGE_KEYS.JOBS, jobs);

      // Clean up applications & saved jobs for this deleted job
      let apps = getItems(STORAGE_KEYS.APPLICATIONS, []);
      apps = apps.filter((a) => Number(a.job_id) !== Number(jobId));
      setItems(STORAGE_KEYS.APPLICATIONS, apps);

      let saved = getItems(STORAGE_KEYS.SAVED_JOBS, []);
      saved = saved.filter((s) => Number(s.job_id) !== Number(jobId));
      setItems(STORAGE_KEYS.SAVED_JOBS, saved);

      return { message: 'Job removed.' };
    });
  },

  // Utility to reset demo data back to fresh state
  resetToDemoData: () => {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.RECRUITERS, JSON.stringify(INITIAL_RECRUITERS));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(INITIAL_SAVED_JOBS));
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(INITIAL_MESSAGES));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },
};
