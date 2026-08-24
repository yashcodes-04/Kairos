import React from 'react';
import { Mail, Users, Trash2, Power } from 'lucide-react';

export default function JobCardRecruiter({
  job,
  applications,
  onToggleStatus,
  onDeleteJob,
}) {
  const jobApps = applications.filter((app) => app.job_id === job.id);
  const vacanciesCount = Number(job.vacancies || 1);

  return (
    <article className="job-card">
      <div className="job-card-top">
        <span className={`status ${job.status?.toLowerCase()}`}>
          {job.status}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            className="job-action"
            onClick={() => onToggleStatus(job.id, job.status)}
            title={job.status === 'Active' ? 'Pause listings' : 'Activate listings'}
          >
            <Power size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
            {job.status === 'Active' ? 'Pause' : 'Activate'}
          </button>

          <button
            type="button"
            className="job-action remove-job"
            onClick={() => onDeleteJob(job.id)}
            title="Delete this listing"
          >
            <Trash2 size={12} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
            Remove
          </button>
        </div>
      </div>

      <h3>{job.title}</h3>
      <p className="job-meta">
        {job.type} · {job.location}
      </p>

      <p className="job-pay">
        {job.pay?.startsWith('₹') || job.pay?.startsWith('Rs') ? job.pay : `₹${job.pay}`}{' '}
        <span>· {job.hours}</span>
      </p>

      <p className="vacancy-note">
        {vacanciesCount} {vacanciesCount === 1 ? 'vacancy' : 'vacancies'} available
      </p>

      <p className="job-description">{job.description}</p>
      <p className="job-posted">Posted {job.posted || 'recently'}</p>

      {/* Applicants Section */}
      <div className="applicants-section">
        <div className="applicants-title">
          <span>
            <Users size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
            Applicants ({jobApps.length})
          </span>
        </div>

        {jobApps.length === 0 ? (
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--muted)' }}>
            No student applicants yet.
          </p>
        ) : (
          <div className="applicants-list">
            {jobApps.map((app) => (
              <div key={app.application_id || `${app.job_id}-${app.student_id}`} className="applicant-card">
                <div className="applicant-info">
                  <strong>{app.student_name}</strong>
                  <p>
                    {app.college} · {app.course} · {app.availability || 'Flexible'}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--muted)', marginTop: '2px' }}>
                    Applied {app.applied_at}
                  </p>
                </div>
                <a href={`mailto:${app.student_email}`} className="contact-student-btn">
                  <Mail size={12} style={{ marginRight: '4px' }} />
                  Contact ({app.student_email})
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
