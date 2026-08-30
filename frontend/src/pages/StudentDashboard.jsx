import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import JobCardStudent from '../components/JobCardStudent';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Search, Sparkles, Compass, CheckCircle2, Bookmark, RefreshCw } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showingSaved, setShowingSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const loadData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const [jobsRes, savedRes, appliedRes] = await Promise.all([
        api.getActiveJobs(),
        api.getSavedJobIds(user.id),
        api.getAppliedJobIds(user.id),
      ]);
      setJobs(Array.isArray(jobsRes) ? jobsRes : []);
      setSavedJobIds(Array.isArray(savedRes) ? savedRes : []);
      setAppliedJobIds(Array.isArray(appliedRes) ? appliedRes : []);
    } catch (err) {
      console.error('Error loading student jobs:', err);
      setError('Could not load jobs from local storage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const handleToggleApply = async (jobId) => {
    const isApplied = appliedJobIds.includes(jobId);
    try {
      if (isApplied) {
        setAppliedJobIds((prev) => prev.filter((id) => id !== jobId));
        await api.withdrawApplication(jobId, user.id);
      } else {
        setAppliedJobIds((prev) => [...prev, jobId]);
        await api.applyForJob(jobId, user.id);
      }
    } catch (err) {
      console.error('Failed to update application status:', err);
      // Revert
      loadData();
    }
  };

  const handleToggleSave = async (jobId) => {
    const isSaved = savedJobIds.includes(jobId);
    try {
      if (isSaved) {
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
        await api.removeSavedJob(user.id, jobId);
      } else {
        setSavedJobIds((prev) => [...prev, jobId]);
        await api.saveJob(user.id, jobId);
      }
    } catch (err) {
      console.error('Failed to update saved job status:', err);
      // Revert
      loadData();
    }
  };

  const filteredJobs = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return jobs.filter((job) => {
      const matchesSearch =
        !term ||
        `${job.title} ${job.location} ${job.type} ${job.company} ${job.recruiter_name || ''}`
          .toLowerCase()
          .includes(term);

      const matchesTab = !showingSaved || savedJobIds.includes(job.id);
      return matchesSearch && matchesTab;
    });
  }, [jobs, searchTerm, showingSaved, savedJobIds]);

  return (
    <div className="dashboard-screen student-screen">
      <Navbar workspaceLabel="Student workspace" />

      <main className="dashboard-main">
        {/* Hero Section */}
        <section className="student-hero">
          <div>
            <p className="small-heading">OPPORTUNITIES FOR STUDENTS</p>
            <h1>
              Find work that
              <br />
              works for you.
            </h1>
            <p id="studentWelcome">
              Hi <strong>{firstName}</strong>, browse flexible, verified part-time roles from local employers.
            </p>
          </div>

          <div className="live-indicator">
            <span />
            <strong>{jobs.length}</strong> live jobs
          </div>
        </section>

        {error && (
          <div style={{ marginBottom: '20px', padding: '12px 16px', background: '#fdf2f2', color: '#b43c36', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{error}</span>
            <button type="button" onClick={loadData} style={{ background: 'none', border: 'none', color: '#b43c36', cursor: 'pointer', fontWeight: 'bold' }}>
              <RefreshCw size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Retry
            </button>
          </div>
        )}

        {/* Jobs Section */}
        <section id="live-jobs" className="student-jobs-section">
          <div className="student-section-bar">
            <div>
              <p className="small-heading">LIVE OPPORTUNITIES</p>
              <h2>{showingSaved ? 'Your Saved Jobs' : 'Jobs available now'}</h2>
            </div>

            <div className="job-tools">
              <button
                id="savedJobsButton"
                className={`text-action ${showingSaved ? 'selected' : ''}`}
                type="button"
                onClick={() => setShowingSaved(!showingSaved)}
              >
                <Bookmark size={13} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                {showingSaved ? 'All live jobs' : 'Saved jobs'} <span>{savedJobIds.length}</span>
              </button>

              <label className="search-box" htmlFor="jobSearch">
                <Search size={15} style={{ color: 'var(--muted)', flexShrink: 0 }} />
                <input
                  id="jobSearch"
                  type="search"
                  placeholder="Search jobs, companies, or locations"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </label>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <RefreshCw size={24} className="spin-icon" style={{ marginBottom: '10px' }} />
              <p>Loading available opportunities...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="student-empty">
              <span>
                <Search size={22} />
              </span>
              <h3>
                {searchTerm
                  ? 'No roles match that search'
                  : showingSaved
                  ? 'No saved jobs yet'
                  : 'New opportunities are on their way'}
              </h3>
              <p>
                {searchTerm
                  ? 'Try another job title or location.'
                  : showingSaved
                  ? 'Click "Save ⭐" on any job to keep track of roles you like.'
                  : 'Check back soon — recruiters can publish jobs here anytime.'}
              </p>
            </div>
          ) : (
            <div id="studentJobsList" className="student-jobs-grid">
              {filteredJobs.map((job) => (
                <JobCardStudent
                  key={job.id}
                  job={job}
                  isApplied={appliedJobIds.includes(job.id)}
                  isSaved={savedJobIds.includes(job.id)}
                  onToggleApply={handleToggleApply}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>
          )}
        </section>

        {/* Steps / Guidance */}
        <section id="how-it-works" className="student-steps">
          <div>
            <b>1</b>
            <h3>Explore live roles</h3>
            <p>See jobs posted by recruiters as soon as they are active.</p>
          </div>
          <div>
            <b>2</b>
            <h3>Check the fit</h3>
            <p>Review the hours, location, pay, and number of openings.</p>
          </div>
          <div>
            <b>3</b>
            <h3>Apply with confidence</h3>
            <p>Choose work that leaves room for your studies.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
