const account = JSON.parse(localStorage.getItem('kairosAccount'));
if (!account || account.role !== 'Recruiter') {
  window.location.replace('index.html');
  throw new Error('Recruiter sign-in required');
}

const jobForm = document.querySelector('#jobForm');
const jobsList = document.querySelector('#jobsList');
const jobCount = document.querySelector('#jobCount');
const jobMessage = document.querySelector('#jobMessage');
const welcomeText = document.querySelector('#welcomeText');
const api = 'http://localhost:5000/api';
let jobs = [];
let applications = [];
let activeOnly = false;

function applyTheme(theme) {
  document.body.classList.toggle('dark-theme', theme === 'dark');
  const button = document.querySelector('#themeToggle');
  button.textContent = theme === 'dark' ? '☀' : '☾';
  button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}
applyTheme(localStorage.getItem('kairosTheme') || 'light');
document.querySelector('#themeToggle').addEventListener('click', () => {
  const theme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
  localStorage.setItem('kairosTheme', theme);
  applyTheme(theme);
});

welcomeText.textContent = `${account.company || 'Your company'} can publish flexible opportunities for students ready to contribute.`;

function renderJobs() {
  const visibleJobs = jobs.filter((job) => !activeOnly || job.status === 'Active');
  jobCount.textContent = jobs.filter((job) => job.status === 'Active').length;

  if (!visibleJobs.length) {
    jobsList.innerHTML = '<div class="empty-jobs"><span>+</span><h3>Your first listing starts here</h3><p>Fill in the form to publish a flexible role for students.</p></div>';
    return;
  }

  jobsList.innerHTML = visibleJobs.map((job) => {
    const jobApps = applications.filter((app) => app.job_id === job.id);

    return `
      <article class="job-card">
        <div class="job-card-top">
          <span class="status ${job.status.toLowerCase()}">${job.status}</span>
          <span>
            <button type="button" class="job-action" data-id="${job.id}">${job.status === 'Active' ? 'Pause' : 'Activate'}</button>
            <button type="button" class="job-action remove-job" data-remove-id="${job.id}">Remove</button>
          </span>
        </div>
        <h3>${job.title}</h3>
        <p class="job-meta">${job.type} · ${job.location}</p>
        <p class="job-pay">${job.pay} <span>· ${job.hours}</span></p>
        <p class="vacancy-note">${job.vacancies || 1} ${Number(job.vacancies || 1) === 1 ? 'vacancy' : 'vacancies'} available</p>
        <p class="job-description">${job.description}</p>
        <p class="job-posted">Posted ${job.posted}</p>

        <!-- Applicants Section & Student Contact Info -->
        <div class="applicants-section">
          <div class="applicants-title">
            <span>Applicants (${jobApps.length})</span>
          </div>
          ${
            jobApps.length === 0
              ? '<p style="margin:0; font-size:11px; color:var(--muted);">No student applicants yet.</p>'
              : `<div class="applicants-list">
                  ${jobApps.map((app) => `
                    <div class="applicant-card">
                      <div class="applicant-info">
                        <strong>${app.student_name}</strong>
                        <p>${app.college} · ${app.course} · ${app.availability || 'Flexible'}</p>
                        <p>Applied ${app.applied_at}</p>
                      </div>
                      <a href="mailto:${app.student_email}" class="contact-student-btn">
                        ✉ Contact (${app.student_email})
                      </a>
                    </div>
                  `).join('')}
                </div>`
          }
        </div>
      </article>
    `;
  }).join('');
}

async function loadJobs() {
  try {
    const [jobsRes, appsRes] = await Promise.all([
      fetch(`${api}/recruiters/${account.id}/jobs`),
      fetch(`${api}/recruiters/${account.id}/applications`)
    ]);

    if (jobsRes.ok) jobs = await jobsRes.json();
    if (appsRes.ok) applications = await appsRes.json();

    renderJobs();
  } catch (err) {
    jobMessage.textContent = 'Could not fetch recruiter data.';
    jobMessage.classList.add('error-message');
  }
}

jobForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!jobForm.checkValidity()) { jobForm.reportValidity(); return; }
  const response = await fetch(`${api}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      recruiterId: account.id,
      title: jobTitle.value,
      type: jobType.value,
      location: jobLocation.value,
      hours: jobHours.value,
      pay: jobPay.value,
      vacancies: jobVacancies.value,
      description: jobDescription.value
    })
  });
  if (!response.ok) {
    jobMessage.textContent = 'Could not publish your job.';
    jobMessage.classList.add('error-message');
    return;
  }
  jobForm.reset();
  jobMessage.classList.remove('error-message');
  jobMessage.textContent = 'Your job is live and ready for students to discover.';
  loadJobs();
});

jobsList.addEventListener('click', async (event) => {
  const removeButton = event.target.closest('.remove-job');
  if (removeButton) {
    await fetch(`${api}/jobs/${removeButton.dataset.removeId}?recruiterId=${account.id}`, { method: 'DELETE' });
    loadJobs();
    return;
  }
  const button = event.target.closest('.job-action');
  if (!button) return;
  const job = jobs.find((item) => item.id === Number(button.dataset.id));
  await fetch(`${api}/jobs/${job.id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recruiterId: account.id, status: job.status === 'Active' ? 'Paused' : 'Active' })
  });
  loadJobs();
});

document.querySelector('#showActiveJobs').addEventListener('click', (event) => {
  activeOnly = !activeOnly;
  event.currentTarget.textContent = activeOnly ? 'Show all jobs' : 'Active only';
  renderJobs();
});

document.querySelector('#signOut').addEventListener('click', () => {
  localStorage.removeItem('kairosAccount');
  window.location.href = 'index.html';
});

loadJobs().catch(() => {
  jobMessage.textContent = 'Start the backend server to load jobs.';
  jobMessage.classList.add('error-message');
});
