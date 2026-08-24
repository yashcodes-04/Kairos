import React from 'react';
import { MapPin, Clock, IndianRupee, Mail, Star, Check } from 'lucide-react';

export default function JobCardStudent({
  job,
  isApplied,
  isSaved,
  onToggleApply,
  onToggleSave,
}) {
  const vacanciesCount = Number(job.vacancies || 1);
  const vacancyLabel = vacanciesCount === 1 ? '1 opening' : `${vacanciesCount} openings`;

  return (
    <article className="student-job-card">
      <div className="job-card-top">
        <span className="status active">Live now</span>
        <span className="opening-chip">{vacancyLabel}</span>
      </div>

      <h3>{job.title}</h3>
      <p className="company-line">{job.company || 'Kairos Employer'}</p>

      <div className="job-facts">
        <span>
          <MapPin size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
          {job.location} ({job.type || 'On-site'})
        </span>
        <span>
          <Clock size={11} style={{ marginRight: '3px', verticalAlign: 'middle' }} />
          {job.hours}
        </span>
        <span>
          {job.pay?.startsWith('₹') || job.pay?.startsWith('Rs') ? job.pay : `₹${job.pay}`} / hour
        </span>
      </div>

      <p className="job-description-text">{job.description}</p>

      {/* Recruiter Contact Details */}
      <div className="recruiter-contact-box">
        <strong>Employer Contact Info</strong>
        <div>
          Posted by: <b>{job.recruiter_name || 'Recruiter'}</b> ({job.recruiter_role || 'Hiring Manager'})
        </div>
        <div>
          Email:{' '}
          {job.recruiter_email ? (
            <a href={`mailto:${job.recruiter_email}`}>
              {job.recruiter_email}
            </a>
          ) : (
            'Contact via Kairos'
          )}
        </div>
      </div>

      <div className="job-card-actions">
        <button
          type="button"
          className={`interest-button apply-button ${isApplied ? 'saved' : ''}`}
          onClick={() => onToggleApply(job.id)}
          style={{ flex: 2, marginTop: 0 }}
        >
          {isApplied ? (
            <>
              <Check size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Applied
            </>
          ) : (
            'Apply Now →'
          )}
        </button>

        <button
          type="button"
          className={`interest-button save-button ${isSaved ? 'saved' : ''}`}
          onClick={() => onToggleSave(job.id)}
          style={{ flex: 1, marginTop: 0 }}
        >
          {isSaved ? 'Saved ⭐' : 'Save ⭐'}
        </button>
      </div>
    </article>
  );
}
