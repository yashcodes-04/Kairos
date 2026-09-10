import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, Sun, Moon, LogOut } from 'lucide-react';

export default function Navbar({ workspaceLabel }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="dashboard-header">
      <Link to={user?.role === 'Recruiter' ? '/recruiter' : '/student'} className="dashboard-brand">
        <img src="/favicon.png" alt="Kairos" className="dashboard-brand-logo-img" />
        <span>Kairos<span className="brand-dot">.</span></span>
      </Link>

      {workspaceLabel && (
        <span className="workspace-label">{workspaceLabel}</span>
      )}

      <div className="header-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="theme-button"
          type="button"
          onClick={() => navigate('/settings')}
          aria-label="Edit profile"
          title="Edit profile & settings"
        >
          <Settings size={17} />
        </button>

        <button
          className="theme-button"
          type="button"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title="Switch theme"
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        <button className="profile-button" type="button" onClick={handleSignOut}>
          <LogOut size={14} style={{ marginRight: '5px', verticalAlign: 'middle' }} />
          Sign out
        </button>
      </div>
    </header>
  );
}
