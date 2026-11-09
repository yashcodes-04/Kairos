import React, { useEffect, useState } from 'react';
import { CalendarCheck2, CalendarDays, Clock3, Lock, UsersRound, Video, X } from 'lucide-react';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import './BookedSessionsPage.css';

export default function BookedSessionsPage({ user, onNavigate }) {
  const { addNotification } = useNotifications();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [pendingCancellation, setPendingCancellation] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setSessions(await api.getBookedSkillSessions(user.id, { includeCancelled: true }));
    } catch (error) {
      addNotification({ title: 'Could not load bookings', body: error.message || 'Please try again.', type: 'session' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const handleUpdate = () => load();
    window.addEventListener('kairos_sessions_updated', handleUpdate);
    return () => window.removeEventListener('kairos_sessions_updated', handleUpdate);
  }, [user.id]);

  const cancel = async (session) => {
    if (session.meetingLink && session.meetingLink.trim()) {
      addNotification({ title: 'Cancellation unavailable', body: 'This session cannot be cancelled because the meeting link has already been provided.', type: 'session' });
      return;
    }
    try {
      setCancelling(true);
      const result = await api.cancelSkillSessionBooking(user.id, session.id);
      if (result.refund) {
        setSessions((current) => current.map((item) => item.id === session.id ? { ...item, bookingStatus: 'Cancelled', refund: result.refund } : item));
        setActiveTab('history');
        addNotification({ title: 'Session cancelled', body: `₹${result.refund.amount} will be credited back in 2-3 working hours.`, type: 'session' });
      } else {
        setSessions((current) => current.filter((item) => item.id !== session.id));
        addNotification({ title: 'Session cancelled', body: `${session.title} has been cancelled.`, type: 'session' });
      }
    } catch (error) {
      addNotification({ title: 'Cancellation failed', body: error.message || 'Could not cancel this booking.', type: 'session' });
    } finally {
      setCancelling(false);
      setPendingCancellation(null);
    }
  };

  const requestCancellation = (session) => {
    const amountPaid = Number(session.amountPaid) || 0;
    if (amountPaid > 0) setPendingCancellation(session);
    else cancel(session);
  };

  const visibleSessions = sessions.filter((session) => activeTab === 'history' ? session.bookingStatus === 'Cancelled' : session.bookingStatus !== 'Cancelled');

  return (
    <main className="student-workspace-content session-page">
      <section className="session-page-header booked-page-header">
        <div>
          <p className="small-heading">YOUR LEARNING PLAN</p>
          <h1>Booked sessions</h1>
          <p>These are the peer-learning sessions you have saved a seat in. Meeting links appear here once provided by the host.</p>
        </div>
        <CalendarCheck2 size={40} />
      </section>

      <section className="my-sessions-panel booked-sessions-panel">
        {!loading && sessions.length > 0 && <div className="booked-session-tabs" role="tablist" aria-label="Booked session views">
          <button type="button" role="tab" aria-selected={activeTab === 'upcoming'} className={activeTab === 'upcoming' ? 'active' : ''} onClick={() => setActiveTab('upcoming')}>Upcoming</button>
          <button type="button" role="tab" aria-selected={activeTab === 'history'} className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>History</button>
        </div>}

        {loading ? (
          <p className="session-loading">Loading your booked sessions...</p>
        ) : !visibleSessions.length ? (
          <div className="my-sessions-empty">
            <h2>{activeTab === 'history' ? 'No session history yet' : 'Nothing booked yet'}</h2>
            <p>{activeTab === 'history' ? 'Cancelled paid sessions and their refund details will appear here.' : 'Explore practical sessions taught by fellow students and reserve a seat.'}</p>
            {activeTab === 'upcoming' && <button type="button" className="session-save-button" onClick={() => onNavigate('skills')}>Explore Skill Exchange</button>}
          </div>
        ) : (
          <div className="booked-sessions-grid">
            {visibleSessions.map((session) => (
              <article className="booked-session-card" key={session.bookingId}>
                <div className={`session-avatar ${session.color}`}>
                  {session.teacher.split(' ').map((name) => name[0]).join('')}
                </div>
                <p className="small-heading">{session.topic} · {session.level}</p>
                <h2>{session.title}</h2>
                <p className="session-teacher">Hosted by {session.teacher}</p>
                <p className="session-description">{session.description}</p>

                {session.bookingStatus === 'Cancelled' && session.refund && <div className="refund-status-badge"><strong>Refund initiated (₹{session.refund.amount})</strong><span>{session.refund.status} · Expected in {session.refund.expectedArrival}</span></div>}

                <div className="session-meta">
                  <span>
                    <CalendarDays size={14} />
                    {session.time}
                  </span>
                  <span>
                    <Clock3 size={14} />
                    {session.duration}
                  </span>
                  <span>
                    <UsersRound size={14} />
                    {session.seats} seats left
                  </span>
                </div>

                {session.bookingStatus !== 'Cancelled' && <div className="booked-session-meeting-box">
                  {session.meetingLink ? (
                    <div className="meeting-link-available">
                      <div className="meeting-link-status-badge">
                        <Video size={13} /> Meeting link ready
                      </div>
                      <a
                        href={session.meetingLink.startsWith('http') ? session.meetingLink : `https://${session.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="join-meeting-btn"
                      >
                        <Video size={14} /> Join meeting
                      </a>
                    </div>
                  ) : (
                    <div className="meeting-link-pending">
                      <Clock3 size={14} />
                      <span>Link will be given to you soon.</span>
                    </div>
                  )}
                </div>}

                {session.bookingStatus === 'Cancelled' ? null : session.meetingLink && session.meetingLink.trim() ? (
                  <div className="booking-locked-box">
                    <Lock size={13} />
                    <span>Cancellation locked — meeting link provided</span>
                  </div>
                ) : (
                  <button type="button" className="cancel-booking-button" onClick={() => requestCancellation(session)}>
                    <X size={15} /> Cancel booking
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
      {pendingCancellation && <div className="session-cancel-modal-backdrop" role="presentation">
        <section className="session-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="cancelSessionTitle">
          <h2 id="cancelSessionTitle">Cancel this session?</h2>
          <p>Are you sure? A refund of ₹{pendingCancellation.amountPaid} will be initiated.</p>
          <div className="session-cancel-modal-actions">
            <button type="button" onClick={() => setPendingCancellation(null)} disabled={cancelling}>Keep session</button>
            <button type="button" className="cancel-booking-button" onClick={() => cancel(pendingCancellation)} disabled={cancelling}>{cancelling ? 'Cancelling...' : 'Cancel session'}</button>
          </div>
        </section>
      </div>}
    </main>
  );
}
