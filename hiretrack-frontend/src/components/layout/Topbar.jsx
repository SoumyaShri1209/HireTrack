import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Your hiring overview' },
  '/jobs': { title: 'Job Feed', subtitle: 'AI-matched opportunities' },
  '/pipeline': { title: 'Pipeline', subtitle: 'Track your applications' },
  '/offers': { title: 'Offers', subtitle: 'Compare your offer letters' },
  '/resume': { title: 'Resume', subtitle: 'Upload & analyze your CV' },
  '/skill-gap': { title: 'Skill Gap', subtitle: 'What you need to learn' },
  '/activity': { title: 'Activity', subtitle: 'Your action history' },
};

const Topbar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const page = pageTitles[pathname] || { title: 'HireTrack', subtitle: '' };

  return (
    <header style={{
      height: 64,
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>
          {page.title}
        </h1>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>{page.subtitle}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Status indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', boxShadow: '0 0 8px var(--accent-glow)' }} />
          Live
        </div>

        {/* Avatar */}
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent), #00f099)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 14, color: '#000',
          cursor: 'pointer',
        }}>
          {(user?.name || 'U')[0].toUpperCase()}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
