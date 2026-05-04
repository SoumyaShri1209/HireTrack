import { useEffect, useState, useRef } from 'react';
import { resumeApi } from '../services/api';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import toast from 'react-hot-toast';

const Resume = () => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const load = () => {
    resumeApi.get()
      .then(({ data }) => setResume(data.data))
      .catch(() => setResume(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const upload = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') { toast.error('Only PDF files are accepted'); return; }
    setUploading(true);
    try {
      await resumeApi.upload(file);
      toast.success('Resume uploaded & parsed!');
      setLoading(true);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally { setUploading(false); }
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    upload(e.dataTransfer.files[0]);
  };

  const handleDelete = async () => {
    if (!resume || !confirm('Delete your resume?')) return;
    try {
      await resumeApi.delete(resume._id);
      setResume(null);
      toast.success('Resume deleted');
    } catch { toast.error('Delete failed'); }
  };

  if (loading) return <Spinner />;

  const p = resume?.parsedData;
  const insights = resume?.aiInsights;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>

      {/* Upload zone */}
      {!resume ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
          style={{
            border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 20, padding: '60px 40px', textAlign: 'center', cursor: 'pointer',
            background: dragging ? 'var(--accent-dim)' : 'var(--surface)',
            transition: 'all 0.2s',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>{uploading ? '⏳' : '📄'}</div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, marginBottom: 8 }}>
            {uploading ? 'Uploading & parsing with AI…' : 'Drop your resume here'}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
            PDF only · Powered by Gemini AI
          </p>
          {!uploading && (
            <button className="btn-accent" onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}>
              📁 Browse File
            </button>
          )}
          <input ref={fileRef} type="file" accept=".pdf" hidden onChange={(e) => upload(e.target.files[0])} />
        </div>
      ) : (
        <>
          {/* Resume card */}
          <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '1px solid rgba(0,208,132,0.3)' }}>📄</div>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15 }}>{resume.filename}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
                  {(resume.filesize / 1024).toFixed(1)} KB · Status:&nbsp;
                  <span style={{ color: resume.status === 'completed' ? 'var(--accent)' : '#fbbf24', fontWeight: 600 }}>{resume.status}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => { setResume(null); setLoading(false); }}>↑ Replace</button>
              <button onClick={handleDelete} style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 10, padding: '8px 14px', color: '#ff4d6d', cursor: 'pointer', fontSize: 12 }}>🗑 Delete</button>
            </div>
          </div>

          {/* Personal Info */}
          {p?.personalInfo && (
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, marginBottom: 16 }}>👤 Personal Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {Object.entries(p.personalInfo).filter(([,v]) => v).map(([k, v]) => (
                  <div key={k} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'capitalize' }}>{k.replace(/([A-Z])/g, ' $1')}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600, wordBreak: 'break-word' }}>{String(v)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {p?.skills && (
            <div className="card">
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, marginBottom: 16 }}>🛠 Skills</h3>
              {Object.entries(p.skills).filter(([,v]) => Array.isArray(v) && v.length).map(([cat, skills]) => (
                <div key={cat} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'capitalize', fontWeight: 700 }}>{cat}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {skills.map((s) => <span key={s} className="skill-pill matched">{s}</span>)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* AI Insights */}
          {insights && (
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--surface), rgba(0,208,132,0.04))' }}>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, marginBottom: 16 }}>✨ AI Insights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                {insights.strengths?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700, marginBottom: 8 }}>💪 Strengths</div>
                    {insights.strengths.map((s, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• {s}</div>)}
                  </div>
                )}
                {insights.areasToImprove?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: '#fbbf24', fontWeight: 700, marginBottom: 8 }}>📈 Areas to Improve</div>
                    {insights.areasToImprove.map((s, i) => <div key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>• {s}</div>)}
                  </div>
                )}
                {insights.suggestedRoles?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 700, marginBottom: 8 }}>🎯 Suggested Roles</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {insights.suggestedRoles.map((r) => <span key={r} className="skill-pill" style={{ color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.1)' }}>{r}</span>)}
                    </div>
                  </div>
                )}
              </div>
              {insights.experienceLevel && (
                <div style={{ marginTop: 16, padding: '10px 16px', background: 'var(--accent-dim)', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Experience Level:</span>
                  <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 700, textTransform: 'capitalize' }}>{insights.experienceLevel}</span>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Resume;
