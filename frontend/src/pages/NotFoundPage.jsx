import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

export default function NotFoundPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const homePath = !isAuthenticated
    ? '/login'
    : user?.role === 'Recruiter'
    ? '/recruiter'
    : '/student';

  return (
    <div className="not-found-page" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      background: 'var(--cream)',
      color: 'var(--ink)'
    }}>
      <div style={{
        maxWidth: '480px',
        padding: '40px 32px',
        background: 'var(--surface)',
        borderRadius: '16px',
        border: '1px solid var(--line)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.06)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'var(--light-green)',
          color: 'var(--green)',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto 20px'
        }}>
          <AlertCircle size={32} />
        </div>

        <h1 style={{
          font: '700 36px "Playfair Display", Georgia, serif',
          margin: '0 0 10px',
          color: 'var(--ink)'
        }}>404</h1>
        
        <h2 style={{
          fontSize: '18px',
          fontWeight: 600,
          margin: '0 0 12px'
        }}>Page Not Found</h2>

        <p style={{
          color: 'var(--muted)',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: '0 0 28px'
        }}>
          The page you are looking for does not exist or has been moved.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="settings-back-btn"
            style={{ padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <ArrowLeft size={16} /> Go back
          </button>
          <Link
            to={homePath}
            className="interest-button"
            style={{ padding: '10px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Home size={16} /> Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
