import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Home, Briefcase, Eye, EyeOff, ArrowRight, Sun, Moon, UserCheck, GraduationCap, Users } from 'lucide-react';

export default function LoginPage() {
  const [role, setRole] = useState('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [company, setCompany] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleFillDemo = (demoRole, demoEmail, demoPass, demoCompany = '') => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setCompany(demoCompany);
    setMessage('');
    setIsError(false);
    setDemoOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email || !password || (role === 'Recruiter' && !company.trim())) {
      setIsError(true);
      setMessage('Please enter all required login details.');
      return;
    }

    setLoading(true);
    try {
      const account = await api.login({
        email: email.trim(),
        password,
        role,
        company: company.trim(),
      });

      login(account);
      setIsError(false);
      setMessage(`Welcome back, ${account.name}!`);

      setTimeout(() => {
        navigate(role === 'Recruiter' ? '/recruiter' : '/student');
      }, 500);
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Could not connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="auth-controls">
        <div className="demo-menu">
          <button type="button" className="demo-menu-trigger" onClick={() => setDemoOpen((open) => !open)} aria-expanded={demoOpen} aria-controls="demo-accounts">
            <Users size={15} /> Demo accounts
          </button>
          {demoOpen && <div id="demo-accounts" className="demo-menu-panel">
            <button type="button" onClick={() => handleFillDemo('Student', 'rahul@example.com', 'password123')}><GraduationCap size={14} /><span>Rahul<span>Student</span></span></button>
            <button type="button" onClick={() => handleFillDemo('Student', 'priya@example.com', 'password123')}><GraduationCap size={14} /><span>Priya<span>Student</span></span></button>
            <button type="button" onClick={() => handleFillDemo('Recruiter', 'rohan@bluetokai.com', 'password123', 'Blue Tokai Coffee Roasters')}><Briefcase size={14} /><span>Blue Tokai<span>Recruiter</span></span></button>
            <button type="button" onClick={() => handleFillDemo('Recruiter', 'ananya@urbanculture.in', 'password123', 'Urban Culture Co.')}><Briefcase size={14} /><span>Urban Culture<span>Recruiter</span></span></button>
          </div>}
        </div>
        <button type="button" className="auth-theme-toggle" onClick={toggleTheme} aria-label="Toggle theme" title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}>
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* Left Welcome Panel */}
      <section className="welcome-panel">
        <Link className="brand" to="/login">
          Kairos<span>.</span>
        </Link>

        <div className="welcome-copy">
          <p className="eyebrow">THE RIGHT MOMENT FOR WORK</p>
          <h1>
            Work that fits
            <br />
            around your life.
          </h1>
          <p className="intro">
            <strong>Kairos</strong> means the right moment. We connect students who need flexible work with trusted local employers looking for capable people.
          </p>
        </div>

        <div className="connection-card">
          <p className="connection-label">HOW KAIROS WORKS</p>
          <div className="connection-flow">
            <span>
              <b>1</b>Create your profile
            </span>
            <i>→</i>
            <span>
              <b>2</b>Find the right match
            </span>
            <i>→</i>
            <span>
              <b>3</b>Start with confidence
            </span>
          </div>
          <p className="trust-note">
            <span><UserCheck size={14} /></span> Built for students and verified employers
          </p>
        </div>
      </section>

      {/* Right Form Panel */}
      <section className="form-panel">
        <div className="form-box">
          <p className="small-heading">WELCOME BACK</p>
          <h2>Sign in to Kairos</h2>
          <p className="form-intro">Choose how you want to use Kairos.</p>

          <div className="role-options" role="group" aria-label="Choose account type">
            <button
              className={`role-card ${role === 'Student' ? 'selected' : ''}`}
              type="button"
              onClick={() => {
                setRole('Student');
                setMessage('');
              }}
              aria-pressed={role === 'Student'}
            >
              <span className="role-icon">
                <Home size={16} />
              </span>
              <span>
                <strong>I'm a student</strong>
                <small>Find part-time opportunities</small>
              </span>
            </button>

            <button
              className={`role-card ${role === 'Recruiter' ? 'selected' : ''}`}
              type="button"
              onClick={() => {
                setRole('Recruiter');
                setMessage('');
              }}
              aria-pressed={role === 'Recruiter'}
            >
              <span className="role-icon">
                <Briefcase size={16} />
              </span>
              <span>
                <strong>I'm a recruiter</strong>
                <small>Hire talented students</small>
              </span>
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {role === 'Recruiter' && (
              <div id="companyField">
                <label htmlFor="loginCompany">Company name</label>
                <input
                  id="loginCompany"
                  type="text"
                  placeholder="Enter your company name"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="password-row">
              <label htmlFor="password">Password</label>
              <a href="#forgot" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
            <div className="password-input">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                id="showPassword"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>

            <button className="sign-in-button" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'} <ArrowRight size={16} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '6px' }} />
            </button>

            {message && (
              <p className={`message ${isError ? 'error-message' : ''}`} aria-live="polite">
                {message}
              </p>
            )}
          </form>

          <p className="signup-text">
            New to Kairos? <Link to="/register">Create an account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
