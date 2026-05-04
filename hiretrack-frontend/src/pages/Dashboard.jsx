import { useEffect, useState } from 'react';
import { applicationsApi } from '../services/api';
import { activityApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';

const STAT_CARDS = [
  { key: 'applied',      label: 'Applied',      icon: '📤', color: '#38bdf8' },
  { key: 'interview',    label: 'Interviews',    icon: '🎤', color: '#a78bfa' },
  { key: 'offer',        label: 'Offers',        icon: '🎁', color: '#00d084' },
  { key: 'rejected',     label: 'Rejected',      icon: '❌', color: '#ff4d6d' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kanban, setKanban] = useState(null);
  const [allApps, setAllApps] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([applicationsApi.getAll(), activityApi.getAll()])
      .then(([appRes, actRes]) => {
        setKanban(appRes.data.data.kanban);
        setAllApps(appRes.data.data.all);
        setActivity(actRes.data.data || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const stats = STAT_CARDS.map((s) => ({ ...s, count: kanban?.[s.key]?.length || 0 }));
  const total = allApps.length;
  const topApps = allApps.slice(0, 5);

  // Mini kanban preview: show first 3 columns
  const previewCols = ['applied', 'interview', 'offer'];

  const actionIcon = {
    APPLIED: '📤',
    MOVED_STAGE: '🔀',
    ADDED_INTERVIEW: '📅',
    UPLOADED_RESUME: '📄',
    CREATED_OFFER: '🎁',
    DELETED_APPLICATION: '🗑',
    UPDATED_APPLICATION: '✏️',
    UPDATED_OFFER: '✏️',
    DELETED_OFFER: '🗑',
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, rgba(0,208,132,0.05) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '28px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 24, fontWeight: 800 }}>
            Hey, {user?.name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: 14 }}>
            You have <strong style={{ color: 'var(--accent)' }}>{total}</strong> active applications in your pipeline.
          </p>
        </div>
        <button className="btn-accent" onClick={() => navigate('/jobs')}>
          ⚡ Find Jobs
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        {stats.map((s) => (
          <div key={s.key} className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at top right, ${s.color}12, transparent 70%)`,
              pointerEvents: 'none',
            }} />
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 32, fontWeight: 800, color: s.color }}>
              {s.count}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mini Kanban Preview */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16 }}>Pipeline Preview</h3>
          <button className="btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => navigate('/pipeline')}>
            View Full Board →
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {previewCols.map((col) => (
            <div key={col} className="card" style={{ minHeight: 140 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)' }}>
                  {col.replace('_', ' ')}
                </span>
                <span className={`badge-${col === 'phone_screen' ? 'phone' : col}`} style={{ borderRadius: 99, padding: '2px 8px', fontSize: 11 }}>
                  {kanban?.[col]?.length || 0}
                </span>
              </div>
              {(kanban?.[col] || []).slice(0, 3).map((app) => (
                <div key={app._id} style={{
                  background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px',
                  marginBottom: 6, fontSize: 12, color: 'var(--text-secondary)',
                }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{app.job?.title || 'Unknown'}</div>
                  <div>{app.job?.company || ''}</div>
                </div>
              ))}
              {(kanban?.[col]?.length || 0) === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: 12, textAlign: 'center', paddingTop: 16 }}>Empty</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom: Recent Activity + Top Applications */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, marginBottom: 16 }}>Recent Activity</h3>
          {activity.length === 0 ? (
            <EmptyState icon="◷" title="No activity yet" subtitle="Start applying to see your history" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {activity.slice(0, 8).map((act) => (
                <div key={act._id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div className="timeline-dot" style={{ marginTop: 4 }} />
                  <div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>
                      {actionIcon[act.action] || '●'} {act.action.replace(/_/g, ' ')}
                      {act.details?.company && <span style={{ color: 'var(--text-muted)' }}> · {act.details.company}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(act.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top recent applications */}
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, marginBottom: 16 }}>Latest Applications</h3>
          {topApps.length === 0 ? (
            <EmptyState icon="◈" title="No applications yet" subtitle="Apply to jobs to track them here" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {topApps.map((app) => (
                <div key={app._id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: 'var(--surface-2)', borderRadius: 10,
                }}>
                  <div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13 }}>
                      {app.job?.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{app.job?.company}</div>
                  </div>
                  <span className={`skill-pill badge-${app.status === 'phone_screen' ? 'phone' : app.status}`} style={{ fontSize: 11 }}>
                    {app.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)', textAlign: 'center' }}>{error}</p>}
    </div>
  );
};

export default Dashboard;
