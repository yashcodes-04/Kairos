const studentAccount = JSON.parse(localStorage.getItem('kairosAccount'));
if (!studentAccount || studentAccount.role !== 'Student') {
  window.location.replace('index.html');
  throw new Error('Student sign-in required');
}

const studentJobsList = document.querySelector('#studentJobsList');
const liveCount = document.querySelector('#liveCount');
const jobSearch = document.querySelector('#jobSearch');
const savedJobsButton = document.querySelector('#savedJobsButton');
const savedCount = document.querySelector('#savedCount');
const api = 'http://localhost:5000/api';

let jobs = [];
let savedJobs = [];
let appliedJobs = [];
let showingSaved = false;

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

document.querySelector('#studentWelcome').textContent = `Hi ${studentAccount.name.split(' ')[0]}, browse flexible, verified part-time roles from local employers.`;

function renderStudentJobs() {
  const term = jobSearch.value.trim().toLowerCase();
  const filteredJobs = jobs.filter((job) =>
    `${job.title} ${job.location} ${job.type} ${job.company} ${job.recruiter_name || ''}`.toLowerCase().includes(term) &&
    (!showingSaved || savedJobs.includes(job.id))
  );

  liveCount.textContent = jobs.length;
  savedCount.textContent = savedJobs.length;

  if (!filteredJobs.length) {
    studentJobsList.innerHTML = `<div class="student-empty"><span>⌕</span><h3>${term ? 'No roles match that search' : 'New opportunities are on their way'}</h3><p>${term ? 'Try another job title or location.' : 'Check back soon — recruiters can publish jobs here anytime.'}</p></div>`;
    return;
  }

  studentJobsList.innerHTML = filteredJobs.map((job) => {
    const isSaved = savedJobs.includes(job.id);
    const isApplied = appliedJobs.includes(job.id);

    return `
      <article class="student-job-card">
        <div class="job-card-top">
          <span class="status active">Live now</span>
          <span class="opening-chip">${job.vacancies || 1} ${Number(job.vacancies || 1) === 1 ? 'opening' : 'openings'}</span>
        </div>
        <h3>${job.title}</h3>
        <p class="company-line">${job.company || 'Kairos Employer'}</p>

        <div class="job-facts">
          <span>⌖ ${job.location}</span>
          <span>◷ ${job.hours}</span>
          <span>${job.pay}</span>
        </div>
        <p>${job.description}</p>

        <!-- Recruiter Contact Details -->
        <div class="recruiter-contact-box">
          <strong>Employer Contact Info</strong>
          <div>Posted by: <b>${job.recruiter_name || 'Recruiter'}</b> (${job.recruiter_role || 'Hiring Manager'})</div>
          <div>Email: <a href="mailto:${job.recruiter_email}">${job.recruiter_email || 'Contact Recruiter'}</a></div>
        </div>

        <div style="display: flex; gap: 8px; margin-top: 15px;">
          <button type="button" class="interest-button apply-button ${isApplied ? 'saved' : ''}" data-job-id="${job.id}" style="flex: 2; margin-top: 0;">
            ${isApplied ? 'Applied ✓' : 'Apply Now →'}
          </button>
          <button type="button" class="interest-button save-button ${isSaved ? 'saved' : ''}" data-job-id="${job.id}" style="flex: 1; margin-top: 0;">
            ${isSaved ? 'Saved ⭐' : 'Save ⭐'}
          </button>
        </div>
      </article>
    `;
  }).join('');
}

async function loadData() {
  try {
    const [jobsRes, savedRes, appliedRes] = await Promise.all([
      fetch(`${api}/jobs`),
      fetch(`${api}/students/${studentAccount.id}/saved-jobs`),
      fetch(`${api}/students/${studentAccount.id}/applications`)
    ]);

    if (jobsRes.ok) jobs = await jobsRes.json();
    if (savedRes.ok) savedJobs = await savedRes.json();
    if (appliedRes.ok) appliedJobs = await appliedRes.json();

    renderStudentJobs();
  } catch (error) {
    console.error('Error fetching data from database:', error);
  }
}

jobSearch.addEventListener('input', renderStudentJobs);

studentJobsList.addEventListener('click', async (event) => {
  const applyBtn = event.target.closest('.apply-button');
  const saveBtn = event.target.closest('.save-button');

  if (applyBtn) {
    const jobId = Number(applyBtn.dataset.jobId);
    const isApplied = appliedJobs.includes(jobId);

    try {
      if (isApplied) {
        await fetch(`${api}/jobs/${jobId}/apply?studentId=${studentAccount.id}`, { method: 'DELETE' });
        appliedJobs = appliedJobs.filter((id) => id !== jobId);
      } else {
        await fetch(`${api}/jobs/${jobId}/apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: studentAccount.id })
        });
        appliedJobs.push(jobId);
      }
      renderStudentJobs();
    } catch (err) {
      console.error('Error updating application status:', err);
    }
  }

  if (saveBtn) {
    const jobId = Number(saveBtn.dataset.jobId);
    const isSaved = savedJobs.includes(jobId);

    try {
      if (isSaved) {
        await fetch(`${api}/students/${studentAccount.id}/saved-jobs/${jobId}`, { method: 'DELETE' });
        savedJobs = savedJobs.filter((id) => id !== jobId);
      } else {
        await fetch(`${api}/students/${studentAccount.id}/saved-jobs/${jobId}`, { method: 'POST' });
        savedJobs.push(jobId);
      }
      renderStudentJobs();
    } catch (err) {
      console.error('Error updating saved job:', err);
    }
  }
});

savedJobsButton.addEventListener('click', () => {
  showingSaved = !showingSaved;
  savedJobsButton.classList.toggle('selected', showingSaved);
  savedJobsButton.firstChild.textContent = showingSaved ? 'All live jobs ' : 'Saved jobs ';
  renderStudentJobs();
});

document.querySelector('#signOut').addEventListener('click', () => {
  localStorage.removeItem('kairosAccount');
  window.location.href = 'index.html';
});

loadData();
