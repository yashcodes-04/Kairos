// In-Memory Mock Service for Kairos (State-driven for React evaluations)

const INITIAL_STUDENTS = [
  { id: 1, full_name: 'Rahul Sharma', email: 'rahul@example.com', password: 'password123', college: 'Chitkara University, Punjab Campus', course: 'BCA', availability: 'Weekdays' },
];

const INITIAL_RECRUITERS = [
  { recruiter_id: 1, full_name: 'Gurpreet Singh', email: 'gurpreet@drteacafe.example', password: 'password123', company_name: 'Dr Tea Cafe', job_title: 'Cafe Manager', industry: 'Food & hospitality' },
];

const INITIAL_JOBS = [
  { id: 1, recruiter_id: 1, title: 'Cafe Counter Assistant', work_type: 'On-site', location: 'Village Jansla, near Chitkara University', hours: '15-20 hours', pay: '250', vacancies: 2, description: 'Handle orders, serve beverages, and keep the counter ready during student rush hours. Morning and evening shifts available.', status: 'Active', created_at: new Date(Date.now() - 6 * 86400000).toISOString() },
  { id: 2, recruiter_id: 1, title: 'Weekend Cafe Helper', work_type: 'On-site', location: 'Village Jansla, near Chitkara University', hours: '6-10 hours', pay: '220', vacancies: 1, description: 'Help with stock checks, counter clean-up, and takeaway orders on weekend mornings and evenings.', status: 'Active', created_at: new Date(Date.now() - 2 * 86400000).toISOString() },
];

// In-Memory Store
let students = [...INITIAL_STUDENTS];
let recruiters = [...INITIAL_RECRUITERS];
let jobs = [...INITIAL_JOBS];
let applications = [];
let savedJobs = [];

const asyncWrap = (fn) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (err) {
        reject(err);
      }
    }, 40);
  });

export const api = {
  // Auth
  login: async ({ email, password, role, company = '' }) =>
    asyncWrap(() => {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (role === 'Student') {
        const student = students.find((s) => s.email.toLowerCase() === normalizedEmail);
        if (!student || student.password !== password) throw new Error('Invalid email or password.');
        return { id: student.id, name: student.full_name, email: student.email, role: 'Student', company: '' };
      } else {
        const recruiter = recruiters.find((r) => r.email.toLowerCase() === normalizedEmail);
        if (!recruiter || recruiter.password !== password || recruiter.company_name.trim().toLowerCase() !== company.trim().toLowerCase()) {
          throw new Error('Invalid email, password, or company name.');
        }
        return { id: recruiter.recruiter_id, name: recruiter.full_name, email: recruiter.email, role: 'Recruiter', company: recruiter.company_name };
      }
    }),

  register: async (userData) =>
    asyncWrap(() => {
      const { name, email, password, role, college, course, availability, company, jobTitle, industry } = userData;
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (role === 'Student') {
        if (students.some((s) => s.email.toLowerCase() === normalizedEmail)) throw new Error('Email already registered.');
        const newStudent = { id: Date.now(), full_name: name.trim(), email: normalizedEmail, password, college: college?.trim(), course: course?.trim(), availability };
        students.push(newStudent);
        return { id: newStudent.id, name: newStudent.full_name, email: newStudent.email, role: 'Student', company: '' };
      } else {
        if (recruiters.some((r) => r.email.toLowerCase() === normalizedEmail)) throw new Error('Email already registered.');
        const newRecruiter = { recruiter_id: Date.now(), full_name: name.trim(), email: normalizedEmail, password, company_name: company?.trim(), job_title: jobTitle?.trim(), industry };
        recruiters.push(newRecruiter);
        return { id: newRecruiter.recruiter_id, name: newRecruiter.full_name, email: newRecruiter.email, role: 'Recruiter', company: newRecruiter.company_name };
      }
    }),

  changePassword: async ({ email, role = 'Student', newPassword, confirmPassword }) =>
    asyncWrap(() => {
      const normalizedEmail = (email || '').trim().toLowerCase();
      if (!newPassword || newPassword !== confirmPassword) throw new Error('Passwords do not match.');
      const list = role === 'Student' ? students : recruiters;
      const user = list.find((u) => u.email.toLowerCase() === normalizedEmail);
      if (!user) throw new Error('Account not found with this email.');
      user.password = newPassword;
      return { success: true, message: 'Password reset successfully.' };
    }),

  // Profile
  getProfile: async (userId, role) =>
    asyncWrap(() => {
      if (role === 'Student') {
        const s = students.find((item) => Number(item.id) === Number(userId));
        if (!s) throw new Error('Student not found.');
        return { name: s.full_name, email: s.email, college: s.college, course: s.course, availability: s.availability };
      } else {
        const r = recruiters.find((item) => Number(item.recruiter_id) === Number(userId));
        if (!r) throw new Error('Recruiter not found.');
        return { name: r.full_name, email: r.email, company: r.company_name, jobTitle: r.job_title, industry: r.industry };
      }
    }),

  updateProfile: async ({ userId, role, profile }) =>
    asyncWrap(() => {
      if (role === 'Student') {
        const s = students.find((item) => Number(item.id) === Number(userId));
        if (!s) throw new Error('Student not found.');
        Object.assign(s, { full_name: profile.name, email: profile.email, college: profile.college, course: profile.course, availability: profile.availability });
        return { id: s.id, name: s.full_name, email: s.email, role: 'Student', company: '' };
      } else {
        const r = recruiters.find((item) => Number(item.recruiter_id) === Number(userId));
        if (!r) throw new Error('Recruiter not found.');
        Object.assign(r, { full_name: profile.name, email: profile.email, company_name: profile.company, job_title: profile.jobTitle, industry: profile.industry });
        return { id: r.recruiter_id, name: r.full_name, email: r.email, role: 'Recruiter', company: r.company_name };
      }
    }),

  // Student Actions
  getActiveJobs: async () =>
    asyncWrap(() =>
      jobs
        .filter((j) => j.status === 'Active')
        .map((job) => {
          const recruiter = recruiters.find((r) => r.recruiter_id === job.recruiter_id) || {};
          return {
            id: job.id,
            title: job.title,
            company: recruiter.company_name || 'Dr Tea Cafe',
            recruiter_name: recruiter.full_name || 'Hiring Team',
            recruiter_email: recruiter.email || '',
            recruiter_role: recruiter.job_title || 'Recruiter',
            industry: recruiter.industry || 'Food & hospitality',
            type: job.work_type,
            location: job.location,
            hours: job.hours,
            pay: job.pay,
            vacancies: job.vacancies,
            description: job.description,
            status: job.status,
            posted: 'recently',
          };
        })
    ),

  getSavedJobIds: async (studentId) =>
    asyncWrap(() => savedJobs.filter((s) => Number(s.student_id) === Number(studentId)).map((s) => Number(s.job_id))),

  saveJob: async (studentId, jobId) =>
    asyncWrap(() => {
      if (!savedJobs.some((s) => Number(s.student_id) === Number(studentId) && Number(s.job_id) === Number(jobId))) {
        savedJobs.push({ student_id: Number(studentId), job_id: Number(jobId) });
      }
      return { message: 'Job saved.' };
    }),

  removeSavedJob: async (studentId, jobId) =>
    asyncWrap(() => {
      savedJobs = savedJobs.filter((s) => !(Number(s.student_id) === Number(studentId) && Number(s.job_id) === Number(jobId)));
      return { message: 'Saved job removed.' };
    }),

  applyForJob: async (jobId, studentId) =>
    asyncWrap(() => {
      if (!applications.some((a) => Number(a.job_id) === Number(jobId) && Number(a.student_id) === Number(studentId))) {
        applications.push({ id: Date.now(), job_id: Number(jobId), student_id: Number(studentId), status: 'Applied', created_at: new Date().toISOString() });
      }
      return { message: 'Applied successfully.' };
    }),

  withdrawApplication: async (jobId, studentId) =>
    asyncWrap(() => {
      applications = applications.filter((a) => !(Number(a.job_id) === Number(jobId) && Number(a.student_id) === Number(studentId)));
      return { message: 'Application withdrawn.' };
    }),

  getStudentApplications: async (studentId) =>
    asyncWrap(() =>
      applications
        .filter((a) => Number(a.student_id) === Number(studentId))
        .map((app) => {
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
            recruiter_name: recruiter.full_name || 'Hiring Manager',
            company_name: recruiter.company_name || 'Verified Company',
            recruiter_email: recruiter.email || '',
          };
        })
    ),

  // Recruiter Actions
  getRecruiterJobs: async (recruiterId) =>
    asyncWrap(() =>
      jobs
        .filter((j) => Number(j.recruiter_id) === Number(recruiterId))
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
          posted: 'recently',
        }))
    ),

  getRecruiterApplications: async (recruiterId) =>
    asyncWrap(() => {
      const recruiterJobIds = new Set(jobs.filter((j) => Number(j.recruiter_id) === Number(recruiterId)).map((j) => Number(j.id)));
      return applications
        .filter((a) => recruiterJobIds.has(Number(a.job_id)))
        .map((app) => {
          const student = students.find((s) => Number(s.id) === Number(app.student_id)) || {};
          const job = jobs.find((j) => Number(j.id) === Number(app.job_id)) || {};
          return {
            application_id: app.id,
            job_id: app.job_id,
            job_title: job.title || 'Job Listing',
            status: app.status || 'Applied',
            applied_at: 'recently',
            student_id: student.id || app.student_id,
            student_name: student.full_name || 'Student Applicant',
            student_email: student.email || '',
            college: student.college || 'College',
            course: student.course || 'Degree',
            availability: student.availability || 'Flexible',
          };
        });
    }),

  updateApplicationStatus: async (applicationId, _recruiterId, newStatus) =>
    asyncWrap(() => {
      const app = applications.find((a) => Number(a.id) === Number(applicationId));
      if (!app) throw new Error('Application not found.');
      app.status = newStatus;
      return { message: `Application ${newStatus.toLowerCase()} successfully.` };
    }),

  postJob: async (jobData) =>
    asyncWrap(() => {
      const { recruiterId, title, type, location, hours, pay, vacancies, description } = jobData;
      const newJob = {
        id: Date.now(),
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
      return { id: newJob.id };
    }),

  updateJobStatus: async (jobId, _recruiterId, status) =>
    asyncWrap(() => {
      const job = jobs.find((j) => Number(j.id) === Number(jobId));
      if (!job) throw new Error('Job not found.');
      job.status = status;
      return { message: 'Job updated.' };
    }),

  deleteJob: async (jobId) =>
    asyncWrap(() => {
      jobs = jobs.filter((j) => Number(j.id) !== Number(jobId));
      applications = applications.filter((a) => Number(a.job_id) !== Number(jobId));
      savedJobs = savedJobs.filter((s) => Number(s.job_id) !== Number(jobId));
      return { message: 'Job removed.' };
    }),

  resetToDemoData: () => {
    students = [...INITIAL_STUDENTS];
    recruiters = [...INITIAL_RECRUITERS];
    jobs = [...INITIAL_JOBS];
    applications = [];
    savedJobs = [];
  },
};
