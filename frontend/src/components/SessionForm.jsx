import React, { useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import './SessionForm.css';

const blankSession = { title: '', topic: '', level: '', time: '', durationHours: '0', durationMinutes: '0', seats: '', fee: '99', description: '' };

const parseDuration = (duration = '') => {
  const value = String(duration).trim();
  const hours = Number(value.match(/(\d+)\s*(?:h|hour|hours)/i)?.[1] || 0);
  const minutes = Number(value.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/i)?.[1] || 0);
  const totalMinutes = hours * 60 + minutes;
  if (!totalMinutes) return { durationHours: '0', durationMinutes: '0' };
  return { durationHours: String(Math.floor(totalMinutes / 60)), durationMinutes: String(totalMinutes % 60) };
};

function Field({ label, id, error, children }) {
  return <div className="session-form-field"><label htmlFor={id}>{label}</label>{children}{error && <small className="field-error">{error}</small>}</div>;
}

export default function SessionForm({ initialSession, submitLabel, onSubmit, onCancel, saving }) {
  const [form, setForm] = useState(blankSession);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(initialSession ? { title: initialSession.title, topic: initialSession.topic, level: initialSession.level, time: initialSession.time, ...parseDuration(initialSession.duration), seats: String(initialSession.seats), fee: String(initialSession.fee ?? 99), description: initialSession.description } : blankSession);
    setErrors({});
  }, [initialSession]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const validate = () => {
    const next = {};
    if (form.title.trim().length < 4) next.title = 'Use at least 4 characters.';
    if (!form.topic) next.topic = 'Choose a topic.';
    if (!form.level) next.level = 'Choose a level.';
    if (form.time.trim().length < 5) next.time = 'Add a day and time, for example Saturday · 2:00 PM.';
    const totalMinutes = Number(form.durationHours) * 60 + Number(form.durationMinutes);
    if (!Number.isInteger(Number(form.durationHours)) || !Number.isInteger(Number(form.durationMinutes)) || Number(form.durationHours) < 0 || Number(form.durationHours) > 12 || Number(form.durationMinutes) < 0 || Number(form.durationMinutes) > 59 || totalMinutes < 1 || totalMinutes > 720) next.duration = 'Choose up to 12 hours, with minutes from 0 to 59.';
    if (!Number.isInteger(Number(form.seats)) || Number(form.seats) < 1 || Number(form.seats) > 20) next.seats = 'Choose between 1 and 20 seats.';
    if (!Number.isInteger(Number(form.fee)) || Number(form.fee) < 9 || Number(form.fee) > 299) next.fee = 'Choose a fee from ₹9 to ₹299.';
    if (form.description.trim().length < 20) next.description = 'Describe what students will learn in at least 20 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (validate()) {
      const { durationHours, durationMinutes, ...session } = form;
      onSubmit({ ...session, seats: Number(form.seats), fee: Number(form.fee), title: form.title.trim(), time: form.time.trim(), duration: `${Number(durationHours)} hours ${Number(durationMinutes)} minutes`, description: form.description.trim() });
    }
  };

  return <form className="session-form" onSubmit={handleSubmit} noValidate>
    <Field label="Session title" id="sessionTitle" error={errors.title}><input id="sessionTitle" value={form.title} onChange={update('title')} placeholder="Example: React components for beginners" /></Field>
    <div className="session-form-row">
      <Field label="Topic" id="sessionTopic" error={errors.topic}><select id="sessionTopic" value={form.topic} onChange={update('topic')}><option value="">Choose topic</option><option>Development</option><option>Design</option><option>Career</option></select></Field>
      <Field label="Level" id="sessionLevel" error={errors.level}><select id="sessionLevel" value={form.level} onChange={update('level')}><option value="">Choose level</option><option>Beginner</option><option>Intermediate</option><option>All levels</option></select></Field>
    </div>
    <div className="session-form-row session-form-row-details">
      <Field label="Day and time" id="sessionTime" error={errors.time}><input id="sessionTime" value={form.time} onChange={update('time')} placeholder="Saturday · 2:00 PM" /></Field>
      <Field label="Duration" id="sessionDurationHours" error={errors.duration}><div className="session-duration-control"><span><input id="sessionDurationHours" aria-label="Hours" type="number" min="0" max="12" value={form.durationHours} onChange={update('durationHours')} /> Hours</span><span><input id="sessionDurationMinutes" aria-label="Minutes" type="number" min="0" max="59" value={form.durationMinutes} onChange={update('durationMinutes')} /> Minutes</span></div></Field>
      <Field label="Seats" id="sessionSeats" error={errors.seats}><input id="sessionSeats" type="number" min="1" max="20" value={form.seats} onChange={update('seats')} placeholder="5" /></Field>
      <Field label="Session fee" id="sessionFee" error={errors.fee}><div className="session-fee-control"><input id="sessionFee" type="range" min="9" max="299" step="1" value={form.fee} onChange={update('fee')} aria-describedby="sessionFeeValue" style={{ '--fee-progress': `${((Number(form.fee) - 9) / 290) * 100}%` }} /><output id="sessionFeeValue">₹{form.fee}</output></div></Field>
    </div>
    <Field label="What will students learn?" id="sessionDescription" error={errors.description}><textarea id="sessionDescription" value={form.description} onChange={update('description')} placeholder="Explain the hands-on outcome of this session." /></Field>
    <div className="session-form-actions"><button type="button" className="session-cancel-button" onClick={onCancel}><ArrowLeft size={16} /> Cancel</button><button type="submit" className="session-save-button" disabled={saving}>{saving ? 'Saving...' : <><Save size={16} /> {submitLabel}</>}</button></div>
  </form>;
}
