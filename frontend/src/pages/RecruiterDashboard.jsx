import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import JobCardRecruiter from '../components/JobCardRecruiter';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PlusCircle, Filter, ArrowRight, RefreshCw } from 'lucide-react';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeOnly, setActiveOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [postingLoading, setPostingLoading] = useState(false);
  const [jobMessage, setJobMessage] = useState('');
  const [isJobError, setIsJobError] = useState(false);

  // Chat State

  // Form State
  const [title, setTitle] = useState('');
  const [workType, setWorkType] = useState('');
  const [location, setLocation] = useState('');
  const [hours, setHours] = useState('');
  const [pay, setPay] = useState('');
  const [vacancies, setVacancies] = useState(1);
  const [description, setDescription] = useState('');

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        api.getRecruiterJobs(user.id),
        api.getRecruiterApplications(user.id),
      ]);
      setJobs(Array.isArray(jobsRes) ? jobsRes : []);
      setApplications(Array.isArray(appsRes) ? appsRes : []);
    } catch (err) {
      console.error('Error loading recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for custom application updates & storage events
    const handleAppUpdated = () => {
      loadData();
    };
    window.addEventListener('kairos_application_updated', handleAppUpdated);
    window.addEventListener('storage', handleAppUpdated);
    return () => {
      window.removeEventListener('kairos_application_updated', handleAppUpdated);
      window.removeEventListener('storage', handleAppUpdated);
    };
  }, [user?.id]);

  const handleAcceptApplicant = async (applicationId) => {
    try {
      await api.updateApplicationStatus(applicationId, user.id, 'Accepted');
      // Optimistically update
      setApplications((prev) =>
        prev.map((a) => (a.application_id === applicationId ? { ...a, status: 'Accepted' } : a))
      );
    } catch (err) {
      console.error('Error accepting applicant:', err);
      loadData();
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setJobMessage('');
    setIsJobError(false);

    if (!title || !workType || !location || !hours || !pay || !description) {
      setIsJobError(true);
      setJobMessage('Please complete every job field.');
      return;
    }

    setPostingLoading(true);
    try {
      await api.postJob({
        recruiterId: user.id,
        title: title.trim(),
        type: workType,
        location: location.trim(),
        hours,
        pay: pay.trim(),
        vacancies: Number(vacancies) || 1,
        description: description.trim(),
      });

      setJobMessage('Your job is live and ready for students to discover!');
      setIsJobError(false);

      // Reset form
      setTitle('');
      setWorkType('');
      setLocation('');
      setHours('');
      setPay('');
      setVacancies(1);
      setDescription('');

      await loadData();
    } catch (err) {
      setIsJobError(true);
      setJobMessage(err.message || 'Could not publish your job.');
    } finally {
      setPostingLoading(false);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    try {
      await api.updateJobStatus(jobId, user.id, newStatus);
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      loadData();
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await api.deleteJob(jobId, user.id);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      setApplications((prev) => prev.filter((a) => a.job_id !== jobId));
    } catch (err) {
      console.error('Error deleting job:', err);
      loadData();
    }
  };

  const visibleJobs = useMemo(() => {
    return jobs.filter((job) => !activeOnly || job.status === 'Active');
  }, [jobs, activeOnly]);

  const activeCount = useMemo(() => {
    return jobs.filter((job) => job.status === 'Active').length;
  }, [jobs]);

  return (
    <div className="dashboard-screen">
      <Navbar workspaceLabel="Recruiter workspace" />

      <main className="dashboard-main">
        {/* Intro */}
        <section className="dashboard-intro">
          <div>
            <p className="small-heading">RECRUITER WORKSPACE</p>
            <h1>
              Find the students
              <br />
              your team needs.
            </h1>
            <p id="welcomeText">
              <strong>{user?.company || 'Your company'}</strong> can publish flexible opportunities for students ready to contribute.
            </p>
          </div>
          <div className="intro-stat">
            <strong id="jobCount">{activeCount}</strong>
            <span>active jobs</span>
          </div>
        </section>

        {/* Two-column Grid: Job Posting Form & Listings */}
        <section className="dashboard-grid">
          {/* Post Job Card */}
          <section id="post-job" className="job-form-card">
            <div className="section-heading">
              <div>
                <p className="small-heading">NEW OPPORTUNITY</p>
                <h2>Post a part-time job</h2>
              </div>
              <span className="step-tag">Fast Publish</span>
            </div>

            <form id="jobForm" onSubmit={handlePostJob} noValidate>
              <label htmlFor="jobTitle">Job title</label>
              <input
                id="jobTitle"
                placeholder="e.g. Café Team Member, Social Media Assistant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <div className="two-fields">
                <div>
                  <label htmlFor="jobType">Work arrangement</label>
                  <select
                    id="jobType"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option value="On-site">On-site</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="jobLocation">Location</label>
                  <input
                    id="jobLocation"
                    placeholder="e.g. Connaught Place, South Delhi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="three-fields">
                <div>
                  <label htmlFor="jobHours">Hours per week</label>
                  <select
                    id="jobHours"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Choose
                    </option>
                    <option value="5–10 hours">5–10 hours</option>
                    <option value="10–15 hours">10–15 hours</option>
                    <option value="15–20 hours">15–20 hours</option>
                    <option value="20+ hours">20+ hours</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="jobPay">Pay rate</label>
                  <input
                    id="jobPay"
                    placeholder="e.g. ₹200 / hour"
                    value={pay}
                    onChange={(e) => setPay(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="jobVacancies">Vacancies</label>
                  <input
                    id="jobVacancies"
                    type="number"
                    min="1"
                    max="99"
                    value={vacancies}
                    onChange={(e) => setVacancies(e.target.value)}
                    required
                  />
                </div>
              </div>

              <label htmlFor="jobDescription">About the role</label>
              <textarea
                id="jobDescription"
                maxLength={350}
                placeholder="Describe what the student will do, skills valued, and schedule flexibility..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              <button className="sign-in-button" type="submit" disabled={postingLoading}>
                {postingLoading ? 'Publishing...' : 'Publish job'}{' '}
                <ArrowRight size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
              </button>

              {jobMessage && (
                <p className={`message ${isJobError ? 'error-message' : ''}`} aria-live="polite">
                  {jobMessage}
                </p>
              )}
            </form>
          </section>

          {/* Listings & Applicants Panel */}
          <section id="jobs" className="jobs-panel">
            <div className="section-heading">
              <div>
                <p className="small-heading">YOUR LISTINGS</p>
                <h2>Posted jobs</h2>
              </div>
              <button
                id="showActiveJobs"
                className={`text-action ${activeOnly ? 'selected' : ''}`}
                type="button"
                onClick={() => setActiveOnly(!activeOnly)}
              >
                <Filter size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {activeOnly ? 'Show all jobs' : 'Active only'}
              </button>
            </div>

            {loading ? (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
                <RefreshCw size={22} className="spin-icon" style={{ marginBottom: '10px' }} />
                <p>Loading your posted jobs and applicants...</p>
              </div>
            ) : visibleJobs.length === 0 ? (
              <div className="empty-jobs">
                <span>
                  <PlusCircle size={24} />
                </span>
                <h3>Your first listing starts here</h3>
                <p>Fill in the form on the left to publish a flexible role for students.</p>
              </div>
            ) : (
              <div id="jobsList" className="jobs-list">
                {visibleJobs.map((job) => (
                  <JobCardRecruiter
                    key={job.id}
                    job={job}
                    applications={applications}
                    onToggleStatus={handleToggleStatus}
                    onDeleteJob={handleDeleteJob}
                    onAcceptApplicant={handleAcceptApplicant}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}
