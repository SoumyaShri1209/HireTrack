import { useEffect, useState } from 'react';
import { resumeApi, jobsApi } from '../services/api';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import { useNavigate } from 'react-router-dom';

const SkillGap = () => {
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    resumeApi.get()
      .then(({ data }) => {
        setResume(data.data);
        return jobsApi.feed({});
      })
      .then(({ data }) => setJobs(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  if (!resume) {
    return (
      <EmptyState
        icon="◎"
        title="No resume found"
        subtitle="Upload your resume first to see your skill gap analysis"
        action={{ label: '→ Upload Resume', onClick: () => navigate('/resume') }}
      />
    );
  }

  const mySkills = new Set();
  Object.values(resume?.parsedData?.skills || {}).forEach((arr) => {
    if (Array.isArray(arr)) arr.forEach((s) => mySkills.add(s.toLowerCase().trim()));
  });

  const missingFreq = {};
  const matchedFreq = {};
  jobs.forEach((job) => {
    (job.missingSkills || []).forEach((s) => { const k = s.toLowerCase().trim(); missingFreq[k] = (missingFreq[k] || 0) + 1; });
    (job.matchedSkills || []).forEach((s) => { const k = s.toLowerCase().trim(); matchedFreq[k] = (matchedFreq[k] || 0) + 1; });
  });

  const topMissing = Object.entries(missingFreq).sort((a, b) => b[1] - a[1]).slice(0, 20);
  const topMatched = Object.entries(matchedFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const avgMatch = jobs.length > 0 ? Math.round(jobs.reduce((a, j) => a + (j.matchScore || 0), 0) / jobs.length) : 0;
  const insights = resume?.aiInsights;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {error && <div style={{ color: '#ff4d6d', fontSize: 13 }}>⚠️ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
        {[
          { label: 'Your Skills', value: mySkills.size, icon: '✓', color: 'var(--accent)' },
          { label: 'Skills Missing', value: topMissing.length, icon: '✗', color: '#ff4d6d' },
          { label: 'Avg Match Score', value: `${avgMatch}%`, icon: '◎', color: '#a78bfa' },
          { label: 'Jobs Analyzed', value: jobs.length, icon: '◈', color: '#38bdf8' },
        ].map((stat) => (
          <div key={stat.label} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: stat.color, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 28, fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, color: 'var(--accent)', marginBottom: 16 }}>
            ✓ Your Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>({mySkills.size})</span>
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[...mySkills].map((s) => <span key={s} className="skill-pill matched">{s}</span>)}
          </div>
          {!mySkills.size && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No skills parsed yet.</p>}
        </div>

        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, color: '#ff4d6d', marginBottom: 16 }}>
            ✗ Missing Skills <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}>(from jobs)</span>
          </h3>
          {topMissing.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No major gaps detected!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topMissing.map(([skill, count]) => (
                <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="skill-pill missing" style={{ minWidth: 110 }}>{skill}</span>
                  <div style={{ flex: 1 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${Math.min(100, (count / Math.max(jobs.length, 1)) * 100)}%`, background: 'linear-gradient(90deg,#ff4d6d,#ff8fa3)' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 36, textAlign: 'right' }}>{count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {topMatched.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, marginBottom: 16 }}>🔥 Your Most In-Demand Skills</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {topMatched.map(([skill, count]) => (
              <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="skill-pill matched" style={{ minWidth: 140 }}>{skill}</span>
                <div style={{ flex: 1 }}>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${Math.min(100, (count / Math.max(jobs.length, 1)) * 100)}%` }} />
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--accent)', minWidth: 36, textAlign: 'right', fontWeight: 700 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {insights?.areasToImprove?.length > 0 && (
        <div className="card">
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, marginBottom: 16 }}>🤖 AI Recommendations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {insights.areasToImprove.map((rec, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 10, borderLeft: '3px solid #a78bfa' }}>
                <span style={{ color: '#a78bfa', fontWeight: 700 }}>{i + 1}.</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGap;
