import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import JobCardStudent from '../components/JobCardStudent';
import StudentSidebar from '../components/StudentSidebar';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { loadActiveJobs } from '../store/jobsSlice';
import { Search, Sparkles, Bookmark, RefreshCw, FileText, XCircle } from 'lucide-react';

import SkillExchangePage from './SkillExchangePage';
import MySessionsPage from './MySessionsPage';
import BookedSessionsPage from './BookedSessionsPage';
import MyApplicationsPage from './MyApplicationsPage';

export default function StudentDashboard() {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const jobs = useSelector((state) => state.jobs.active);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [studentApplications, setStudentApplications] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'accepted' | 'applied' | 'saved'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const initialTab = searchParams.get('tab') || searchParams.get('page') || location.state?.activePage || 'jobs';
  const [activePage, setActivePage] = useState(initialTab);

  useEffect(() => {
    const pageFromUrl = searchParams.get('tab') || searchParams.get('page') || location.state?.activePage;
    if (pageFromUrl && pageFromUrl !== activePage) {
      setActivePage(pageFromUrl);
    }
  }, [searchParams, location.state]);

  const handlePageChange = (page) => {
    if (page === 'settings') {
      navigate('/settings');
      return;
    }
    setActivePage(page);
    setSearchParams(page === 'jobs' ? {} : { tab: page });
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [, apps, savedIds] = await Promise.all([
        dispatch(loadActiveJobs(user.id)).unwrap(),
        api.getStudentApplications(user.id),
        api.getSavedJobIds(user.id),
      ]);
      setStudentApplications(apps);
      setSavedJobIds(savedIds);
    } catch (err) {
      setError('Could not load jobs from storage. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to custom event for instantaneous status sync across components
    const handleSync = () => {
      loadData();
    };
    window.addEventListener('kairos_application_updated', handleSync);
    window.addEventListener('kairos_jobs_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('kairos_application_updated', handleSync);
      window.removeEventListener('kairos_jobs_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [dispatch, user.id]);

  const handleToggleApply = async (jobId) => {
    const targetJob = jobs.find((j) => Number(j.id) === Number(jobId));
    if (targetJob && targetJob.status === 'Paused') {
      alert('This listing is currently paused and cannot accept new applications.');
      return;
    }

    try {
      const existingApp = studentApplications.find((a) => Number(a.job_id) === Number(jobId));
      if (existingApp) {
        if (existingApp.status === 'Accepted') return;
        await api.withdrawApplication(jobId, user.id);
      } else {
        await api.applyToJob(user.id, jobId);
      }
      await loadData();
    } catch (err) {
      alert(err.message || 'Could not update application status.');
    }
  };

  const handleToggleSave = async (jobId) => {
    try {
      if (savedJobIds.includes(jobId)) {
        await api.unsaveJob(user.id, jobId);
        setSavedJobIds((prev) => prev.filter((id) => id !== jobId));
      } else {
        await api.saveJob(user.id, jobId);
        setSavedJobIds((prev) => [...prev, jobId]);
      }
    } catch (err) {
      alert('Could not update saved job status.');
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // Don't show paused jobs unless the student already applied and got accepted
      const app = studentApplications.find((a) => Number(a.job_id) === Number(job.id));
      const vac = job.vacancies !== undefined ? Number(job.vacancies) : 1;
      const isPaused = job.status === 'Paused' || vac <= 0;
      if (isPaused && (!app || app.status !== 'Accepted')) {
        return false;
      }

      // 1. Search term match
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        job.title.toLowerCase().includes(query) ||
        (job.company && job.company.toLowerCase().includes(query)) ||
        (job.location && job.location.toLowerCase().includes(query)) ||
        (job.type && job.type.toLowerCase().includes(query));

      if (!matchesSearch) return false;

      // 2. Tab filter match
      const isSaved = savedJobIds.includes(job.id);
      const isAccepted = app?.status === 'Accepted';
      const isApplied = app?.status === 'Applied';
      const isRejected = app?.status === 'Rejected';

      if (filterTab === 'saved') return isSaved;
      if (filterTab === 'accepted') return isAccepted;
      if (filterTab === 'applied') return isApplied;
      if (filterTab === 'rejected') return isRejected;

      return true;
    });
  }, [jobs, searchTerm, filterTab, savedJobIds, studentApplications]);

  const counts = useMemo(() => {
    return {
      all: jobs.filter((j) => {
        const app = studentApplications.find((a) => Number(a.job_id) === Number(j.id));
        const vac = j.vacancies !== undefined ? Number(j.vacancies) : 1;
        const isPaused = j.status === 'Paused' || vac <= 0;
        return !isPaused || (app && app.status === 'Accepted');
      }).length,
      saved: savedJobIds.length,
      accepted: studentApplications.filter((a) => a.status === 'Accepted').length,
      applied: studentApplications.filter((a) => a.status === 'Applied').length,
      rejected: studentApplications.filter((a) => a.status === 'Rejected').length,
    };
  }, [jobs, savedJobIds, studentApplications]);

  return (
    <div className="student-dashboard">
      <Navbar
        workspaceLabel="STUDENT WORKSPACE"
        activePage={activePage}
        onNavChange={handlePageChange}
      />

      <div className="student-workspace-layout">
        <StudentSidebar activePage={activePage} onChange={handlePageChange} />
        {activePage === 'skills' ? <SkillExchangePage firstName={firstName} user={user} /> : activePage === 'booked-sessions' ? <BookedSessionsPage user={user} onNavigate={handlePageChange} /> : activePage === 'my-sessions' ? <MySessionsPage user={user} /> : activePage === 'applications' ? <MyApplicationsPage user={user} onNavigate={handlePageChange} /> : <main className="dashboard-main student-dashboard-main">
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
            <strong>{jobs.filter((j) => j.status === 'Active' && (j.vacancies === undefined || Number(j.vacancies) > 0)).length}</strong> live jobs
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

        {/* Toolbar & Filter Tabs */}
        <div className="student-toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              id="studentJobSearch"
              placeholder="Search by role, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-chips">
            <button
              type="button"
              className={`chip-button ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              All opportunities <span className="chip-count">{counts.all}</span>
            </button>
            <button
              type="button"
              className={`chip-button ${filterTab === 'applied' ? 'active' : ''}`}
              onClick={() => setFilterTab('applied')}
            >
              <FileText size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
              Applied <span className="chip-count">{counts.applied}</span>
            </button>
            <button
              type="button"
              className={`chip-button ${filterTab === 'accepted' ? 'active' : ''}`}
              onClick={() => setFilterTab('accepted')}
            >
              <Sparkles size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
              Accepted <span className="chip-count">{counts.accepted}</span>
            </button>
            <button
              type="button"
              className={`chip-button ${filterTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilterTab('rejected')}
            >
              <XCircle size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
              Rejected <span className="chip-count">{counts.rejected}</span>
            </button>
            <button
              type="button"
              className={`chip-button ${filterTab === 'saved' ? 'active' : ''}`}
              onClick={() => setFilterTab('saved')}
            >
              <Bookmark size={13} style={{ marginRight: '4px', verticalAlign: '-1px' }} />
              Saved <span className="chip-count">{counts.saved}</span>
            </button>
          </div>
        </div>

        {/* Jobs Grid Section */}
        {loading ? (
          <div className="student-loading">
            <RefreshCw className="spin-icon" size={24} />
            <p>Loading available jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="student-empty-state">
            <div className="empty-icon">💼</div>
            <h3>No opportunities found</h3>
            <p>
              {searchTerm
                ? `No jobs match "${searchTerm}". Try a broader term or clear your search.`
                : filterTab === 'saved'
                ? "You haven't saved any jobs yet. Click the star icon on any card to save it."
                : filterTab === 'accepted'
                ? "You don't have any accepted applications yet. Keep applying to open roles!"
                : filterTab === 'applied'
                ? "You haven't applied to any roles yet. Explore live opportunities below!"
                : filterTab === 'rejected'
                ? "You don't have any declined applications."
                : "No job postings are currently active. Check back soon for new openings."}
            </p>
            {(searchTerm || filterTab !== 'all') && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => {
                  setSearchTerm('');
                  setFilterTab('all');
                }}
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div id="studentJobsList" className="student-jobs-grid">
            {filteredJobs.map((job) => {
              const app = studentApplications.find((a) => Number(a.job_id) === Number(job.id));
              return (
                <JobCardStudent
                  key={job.id}
                  job={job}
                  application={app}
                  isApplied={studentApplications.some((a) => Number(a.job_id) === Number(job.id))}
                  isSaved={savedJobIds.includes(job.id)}
                  onToggleApply={handleToggleApply}
                  onToggleSave={handleToggleSave}
                />
              );
            })}
          </div>
        )}
      </main>}
      </div>
    </div>
  );
}
