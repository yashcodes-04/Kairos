import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Settings, Sun, Moon, LogOut, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ workspaceLabel }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    if (!user?.id) return;
    try {
      const convos = await api.getConversations(user.id, user.role);
      const unread = (convos || []).reduce((sum, c) => sum + (c.unread_count || 0), 0);
      setUnreadCount(unread);
    } catch (_) {}
  };

  useEffect(() => {
    loadUnreadCount();
    const handleUpdate = () => loadUnreadCount();
    window.addEventListener('kairos_application_updated', handleUpdate);
    window.addEventListener('kairos_message_sent', handleUpdate);
    window.addEventListener('kairos_messages_seen', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('kairos_application_updated', handleUpdate);
      window.removeEventListener('kairos_message_sent', handleUpdate);
      window.removeEventListener('kairos_messages_seen', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user?.id, user?.role]);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  const handleMessagesClick = () => {
    navigate('/messages');
  };

  return (
    <>
      <header className="dashboard-header">
        <Link to={user?.role === 'Recruiter' ? '/recruiter' : '/student'} className="dashboard-brand">
          <img src="/favicon.png" alt="Kairos" className="dashboard-brand-logo-img" />
          <span>Kairos<span className="brand-dot">.</span></span>
        </Link>

        {workspaceLabel && (
          <span className="workspace-label">{workspaceLabel}</span>
        )}

        <div className="header-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user && (
            <button
              className="navbar-chat-btn"
              type="button"
              onClick={handleMessagesClick}
              title="Open Messages"
            >
              <MessageSquare size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Messages
              {unreadCount > 0 && (
                <span className="navbar-chat-count">{unreadCount}</span>
              )}
            </button>
          )}

          <button className="theme-button" type="button" onClick={() => navigate('/settings')} aria-label="Edit profile" title="Settings">
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
    </>
  );
}
