import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, Clock3, Lock, Search, UsersRound, X, UserRound } from 'lucide-react';
import { api } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { loadSkillSessions } from '../store/sessionsSlice';
import { useNotifications } from '../context/NotificationContext';
import { Link } from 'react-router-dom';
import { payWithRazorpay } from '../utils/razorpay';
import './SkillExchangePage.css';

export default function SkillExchangePage({ firstName, user }) {
  const { addNotification } = useNotifications();
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('All');
  const sessions = useSelector((state) => state.sessions.items);
  const sessionStatus = useSelector((state) => state.sessions.status);
  const [bookedIds, setBookedIds] = useState([]);
  const [payingSessionId, setPayingSessionId] = useState(null);
  const [pendingCancellation, setPendingCancellation] = useState(null);
  const [cancellingSessionId, setCancellingSessionId] = useState(null);
  const loading = sessionStatus === 'idle' || sessionStatus === 'loading';

  const refreshData = useCallback(async () => {
    try {
      const [, booked] = await Promise.all([dispatch(loadSkillSessions()).unwrap(), api.getBookedSkillSessions(user.id)]);
      setBookedIds(booked.map((session) => String(session.id)));
    } catch {
      // The normal page-level loading state handles data errors.
    }
  }, [dispatch, user.id]);

  useEffect(() => {
    refreshData();
    window.addEventListener('kairos_sessions_updated', refreshData);
    return () => window.removeEventListener('kairos_sessions_updated', refreshData);
  }, [refreshData]);

  const visibleSessions = useMemo(() => sessions.filter((session) => {
    const matchesQuery = `${session.title} ${session.teacher} ${session.topic}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (topic === 'All' || session.topic === topic);
  }), [sessions, query, topic]);

  const cancelBooking = async (session) => {
    try {
      setCancellingSessionId(session.id);
      const result = await api.cancelSkillSessionBooking(user.id, session.id);
      setBookedIds((current) => current.filter((item) => item !== String(session.id)));
      addNotification({ title: 'Session cancelled', body: result.refund ? `Your ₹${result.refund.amount} refund is processing and should arrive in ${result.refund.expectedArrival}.` : `${session.title} has been cancelled.`, type: 'session' });
      dispatch(loadSkillSessions());
    } catch (error) {
      addNotification({ title: 'Cancellation failed', body: error.message || 'Could not cancel this booking.', type: 'session' });
    } finally {
      setCancellingSessionId(null);
      setPendingCancellation(null);
    }
  };

  const toggleJoined = async (session) => {
    const isBooked = bookedIds.includes(String(session.id));
    try {
      if (isBooked) {
        if (session.meetingLink && session.meetingLink.trim()) {
          addNotification({ title: 'Cancellation unavailable', body: 'This session cannot be cancelled because the meeting link has already been provided.', type: 'session' });
          return;
        }
        if (Number(session.fee) > 0) setPendingCancellation(session);
        else await cancelBooking(session);
        return;
      } else {
        if (Number(session.seats) <= 0) {
          addNotification({ title: 'Session unavailable', body: 'No seats are left for this session.', type: 'session' });
          return;
        }
        const fee = Number(session.fee) || 0;
        let payment = {};
        if (fee > 0) {
          setPayingSessionId(session.id);
          const response = await payWithRazorpay({
            amount: fee,
            description: `Booking: ${session.title}`,
            prefill: { name: user.name, email: user.email },
          });
          payment = { paymentId: response.razorpay_payment_id, amountPaid: fee };
        }
        await api.bookSkillSession(user.id, session.id, payment);
        await refreshData();
        addNotification({ title: 'Session booked', body: fee > 0 ? `Payment successful — ₹${fee} paid for ${session.title}.` : `${session.title} has been added to your booked sessions.`, type: 'session' });
      }
      dispatch(loadSkillSessions());
    } catch (error) { addNotification({ title: 'Booking update failed', body: error.message || 'Could not update this booking.', type: 'session' }); }
    finally { setPayingSessionId(null); }
  };

  return (
    <main className="student-workspace-content skill-exchange-page">
      <section className="skill-exchange-hero">
        <div>
          <p className="small-heading">PEER-TO-PEER LEARNING</p>
          <h1>Learn a skill.<br />Share a skill.</h1>
          <p>Hi <strong>{firstName}</strong>, book small, practical sessions taught by students who have already learned the skill.</p>
        </div>
        <div className="skill-hero-stat"><BookOpen size={19} /><strong>{sessions.length}</strong><span>sessions this week</span></div>
      </section>

      <section className="skill-exchange-panel">
        <div className="skill-panel-heading">
          <div><p className="small-heading">DISCOVER SESSIONS</p><h2>What do you want to learn?</h2></div>
          {bookedIds.length > 0 && <span className="joined-count">{bookedIds.length} session{bookedIds.length > 1 ? 's' : ''} booked</span>}
        </div>

        <div className="skill-tools">
          <label className="search-box skill-search" htmlFor="skillSearch"><Search size={16} /><input id="skillSearch" type="search" placeholder="Search skills or teachers" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
          <div className="skill-topic-tabs" aria-label="Filter sessions by topic">
            {['All', 'Development', 'Design', 'Career'].map((item) => <button type="button" key={item} className={topic === item ? 'active' : ''} onClick={() => setTopic(item)}>{item}</button>)}
          </div>
        </div>

        {loading ? <div className="skill-empty"><p>Loading sessions...</p></div> : visibleSessions.length ? <div className="skill-session-grid">
          {visibleSessions.map((session) => {
            const isJoined = bookedIds.includes(String(session.id));
            const isOwnSession = Number(session.student_id) === Number(user.id);
            return <article className="skill-session-card" key={session.id}>
              <div className={`session-avatar ${session.color}`}>{session.teacher.split(' ').map((name) => name[0]).join('')}</div>
              <div className="session-card-top"><span>{session.topic}</span><small>{session.level}</small></div>
              <h3>{session.title}</h3>
              <p className="session-teacher">Hosted by {session.teacher}</p>
              <p className="session-description">{session.description}</p>
              <div className="session-meta">
                <span><CalendarDays size={14} />{session.time}</span>
                <span><Clock3 size={14} />{session.duration}</span>
                <span className="session-fee paid">₹{session.fee}</span>
              </div>
              <footer>
                <span><UsersRound size={14} />{session.seats} seats left</span>
                <div className="session-card-actions">
                  <Link
                    to={`/students/${session.student_id}`}
                    state={{ from: '/student?tab=skills', fromName: 'Skill Exchange', activePage: 'skills' }}
                    className="session-view-profile-btn"
                    title={`View ${session.teacher}'s profile`}
                  >
                    <UserRound size={13} />
                    <span>View profile</span>
                  </Link>
                  {isOwnSession ? (
                    <span className="own-session-label">Your session</span>
                  ) : isJoined && session.meetingLink && session.meetingLink.trim() ? (
                    <span className="session-locked-tag" title="Meeting link provided — cancellation locked">
                      <Lock size={12} /> Confirmed
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={payingSessionId === session.id || cancellingSessionId === session.id || (!isJoined && Number(session.seats) <= 0)}
                      className={isJoined ? 'session-join-button joined' : 'session-join-button'}
                      onClick={() => toggleJoined(session)}
                    >
                      {isJoined ? cancellingSessionId === session.id ? 'Cancelling...' : <><X size={15} /> Leave</> : Number(session.seats) <= 0 ? 'Full' : payingSessionId === session.id ? 'Opening payment...' : (Number(session.fee) > 0 ? `Book · ₹${session.fee}` : 'Book session')}
                    </button>
                  )}
                </div>
              </footer>
            </article>;
          })}
        </div> : <div className="skill-empty"><Search size={23} /><h3>No sessions found</h3><p>Try a different skill or choose another topic.</p></div>}
      </section>
      {pendingCancellation && <div className="skill-cancel-modal-backdrop" role="presentation">
        <section className="skill-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="skillCancelTitle">
          <h2 id="skillCancelTitle">Cancel this session?</h2>
          <p>Are you sure? A refund of ₹{pendingCancellation.fee} will be initiated.</p>
          <div className="skill-cancel-modal-actions">
            <button type="button" onClick={() => setPendingCancellation(null)} disabled={Boolean(cancellingSessionId)}>Keep session</button>
            <button type="button" className="skill-cancel-confirm-button" onClick={() => cancelBooking(pendingCancellation)} disabled={Boolean(cancellingSessionId)}>{cancellingSessionId ? 'Cancelling...' : 'Cancel session'}</button>
          </div>
        </section>
      </div>}
    </main>
  );
}
