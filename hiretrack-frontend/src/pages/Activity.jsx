import { useEffect, useState } from 'react';
import { activityApi } from '../services/api';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';

const ACTION_META = {
  APPLIED:              { icon: '📤', color: '#38bdf8', label: 'Applied to a job' },
  MOVED_STAGE:          { icon: '🔀', color: '#a78bfa', label: 'Moved pipeline stage' },
  ADDED_INTERVIEW:      { icon: '📅', color: '#fbbf24', label: 'Added interview' },
  UPLOADED_RESUME:      { icon: '📄', color: '#00d084', label: 'Uploaded resume' },
  CREATED_OFFER:        { icon: '🎁', color: '#00d084', label: 'Received offer' },
  UPDATED_APPLICATION:  { icon: '✏️', color: '#8891aa', label: 'Updated application' },
  UPDATED_OFFER:        { icon: '✏️', color: '#8891aa', label: 'Updated offer' },
  DELETED_APPLICATION:  { icon: '🗑', color: '#ff4d6d', label: 'Deleted application' },
  DELETED_OFFER:        { icon: '🗑', color: '#ff4d6d', label: 'Deleted offer' },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

const Activity = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    activityApi.getAll()
      .then(({ data }) => setActivity(data.data || []))
      .catch(() => setActivity([]))
      .finally(() => setLoading(false));
  }, []);

  const types = ['all', ...Object.keys(ACTION_META)];
  const filtered = filter === 'all' ? activity : activity.filter((a) => a.action === filter);

  if (loading) return <Spinner />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 800 }}>
      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {['all', 'APPLIED', 'MOVED_STAGE', 'ADDED_INTERVIEW', 'UPLOADED_RESUME', 'CREATED_OFFER'].map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              padding: '6px 14px', borderRadius: 99, border: 'none', cursor: 'pointer',
              fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, transition: 'all 0.15s',
              background: filter === t ? 'var(--accent)' : 'var(--surface)',
              color: filter === t ? '#000' : 'var(--text-muted)',
              border: filter === t ? 'none' : '1px solid var(--border)',
            }}
          >
            {ACTION_META[t]?.icon || '◈'} {t === 'all' ? 'All' : ACTION_META[t]?.label || t}
          </button>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{filtered.length} events</p>

      {filtered.length === 0 ? (
        <EmptyState icon="◷" title="No activity yet" subtitle="Your actions will appear here as you use HireTrack" />
      ) : (
        <div style={{ position: 'relative' }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 18, top: 0, bottom: 0, width: 2, background: 'var(--border)', zIndex: 0 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {filtered.map((act, i) => {
              const meta = ACTION_META[act.action] || { icon: '●', color: 'var(--text-muted)', label: act.action };
              return (
                <div key={act._id} style={{ display: 'flex', gap: 20, paddingBottom: 20, position: 'relative', zIndex: 1 }}>
                  {/* Dot */}
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: `${meta.color}18`,
                    border: `2px solid ${meta.color}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>
                    {meta.icon}
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 12, padding: '12px 16px',
                    borderLeft: `3px solid ${meta.color}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                          {meta.label}
                        </span>
                        {(act.details?.company || act.details?.jobTitle) && (
                          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            {' '}· {act.details.company || act.details.jobTitle}
                          </span>
                        )}
                        {act.details?.newStage && (
                          <span style={{ fontSize: 12, color: meta.color, marginLeft: 8, fontWeight: 600 }}>
                            → {act.details.newStage.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {timeAgo(act.createdAt)} · {new Date(act.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                      Entity: <span style={{ color: 'var(--text-secondary)' }}>{act.entityType}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;
