// LocalStorage-based Mock API Service for Kairos
// Replaces the MySQL database and Express backend with local storage persistence and rich demo data.

const STORAGE_KEYS = {
  STUDENTS: 'kairos_students',
  RECRUITERS: 'kairos_recruiters',
  JOBS: 'kairos_jobs',
  APPLICATIONS: 'kairos_applications',
  SAVED_JOBS: 'kairos_saved_jobs',
  INITIALIZED: 'kairos_mock_data_v1',
};

// Initial Demo Data
const INITIAL_STUDENTS = [
  {
    id: 1,
    full_name: 'Rahul Sharma',
    email: 'rahul@example.com',
    password: 'password123',
    college: 'Delhi University',
    course: 'BCA Computer Applications',
    availability: 'Weekdays',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
  {
    id: 2,
    full_name: 'Priya Patel',
    email: 'priya@example.com',
    password: 'password123',
    college: "St. Xavier's College",
    course: 'B.Com Marketing',
    availability: 'Weekends',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 3,
    full_name: 'Aarav Mehta',
    email: 'aarav@example.com',
    password: 'password123',
    college: 'IIT Delhi',
    course: 'B.Tech Design & Computing',
    availability: 'Both',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
];

const INITIAL_RECRUITERS = [
  {
    recruiter_id: 1,
    full_name: 'Rohan Verma',
    email: 'rohan@bluetokai.com',
    password: 'password123',
    company_name: 'Blue Tokai Coffee Roasters',
    job_title: 'Operations Manager',
    industry: 'Food & hospitality',
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    recruiter_id: 2,
    full_name: 'Ananya Sen',
    email: 'ananya@urbanculture.in',
    password: 'password123',
    company_name: 'Urban Culture Co.',
    job_title: 'Brand Lead',
    industry: 'Retail',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    recruiter_id: 3,
    full_name: 'Vikram Malhotra',
    email: 'vikram@techflow.io',
    password: 'password123',
    company_name: 'TechFlow Labs',
    job_title: 'Engineering Lead',
    industry: 'Technology',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
];

const INITIAL_JOBS = [
  {
    id: 1,
    recruiter_id: 1,
    title: 'Barista & Café Host',
    work_type: 'On-site',
    location: 'Connaught Place, New Delhi',
    hours: '15–20 hours',
    pay: '₹250',
    vacancies: 2,
    description: 'Join our friendly café team! Flexible morning & afternoon shifts, specialty coffee brewing training, and customer experience skills.',
    status: 'Active',
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 2,
    recruiter_id: 2,
    title: 'Social Media & Content Creator',
    work_type: 'Hybrid',
    location: 'Hauz Khas, New Delhi',
    hours: '10–15 hours',
    pay: '₹300',
    vacancies: 1,
    description: 'Create engaging short-form reels, lifestyle stories, and campus marketing campaigns with complete schedule flexibility.',
    status: 'Active',
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 3,
    recruiter_id: 3,
    title: 'Junior Frontend Developer (React)',
    work_type: 'Remote',
    location: 'Remote / Pan-India',
    hours: '15–20 hours',
    pay: '₹450',
    vacancies: 3,
    description: 'Collaborate with our web team building intuitive UI components and responsive student dashboards. Excellent mentorship provided.',
    status: 'Active',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 4,
    recruiter_id: 1,
    title: 'Weekend Inventory Coordinator',
    work_type: 'On-site',
    location: 'Saket, New Delhi',
    hours: '5–10 hours',
    pay: '₹220',
    vacancies: 1,
    description: 'Support weekend stock counts, supply deliveries check, and retail shelf organization. Perfect for weekend-only student availability.',
    status: 'Active',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 5,
    recruiter_id: 2,
    title: 'Retail Experience Associate',
    work_type: 'On-site',
    location: 'Cyber Hub, Gurugram',
    hours: '10–15 hours',
    pay: '₹280',
    vacancies: 2,
    description: 'Engage shoppers in our lifestyle concept store, manage interactive product showcases, and assist during weekend pop-up events.',
    status: 'Active',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 6,
    recruiter_id: 3,
    title: 'UI/UX Design Assistant',
    work_type: 'Remote',
    location: 'Remote',
    hours: '10–15 hours',
    pay: '₹350',
    vacancies: 1,
    description: 'Design intuitive wireframes, Figma prototypes, and user interfaces for digital products. Great portfolio-building role.',
    status: 'Active',
    created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
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
    status: 'Applied',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 4,
    job_id: 3,
    student_id: 3,
    status: 'Applied',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

const INITIAL_SAVED_JOBS = [
  { student_id: 1, job_id: 2, created_at: new Date().toISOString() },
  { student_id: 1, job_id: 3, created_at: new Date().toISOString() },
];

// Helper to seed localStorage
function initializeLocalStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.RECRUITERS, JSON.stringify(INITIAL_RECRUITERS));
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(INITIAL_JOBS));
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_APPLICATIONS));
    localStorage.setItem(STORAGE_KEYS.SAVED_JOBS, JSON.stringify(INITIAL_SAVED_JOBS));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
}

// Initialize on load
initializeLocalStorage();

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
          return {
            application_id: app.id,
            job_id: app.job_id,
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
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  },
};
