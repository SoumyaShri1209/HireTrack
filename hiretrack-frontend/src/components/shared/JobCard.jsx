import MatchBadge from './MatchBadge';
import toast from 'react-hot-toast';
import { applicationsApi } from '../../services/api';
import { useState } from 'react';

const JobCard = ({ job, onApplied }) => {
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(job._applied || false);

  const handleApply = async () => {
    if (applied) return;
    setApplying(true);
    try {
      await applicationsApi.create({
        job: {
          jobId: job.jobId,
          title: job.title,
          company: job.company,
          location: job.location,
          source: job.source,
          url: job.url,
          description: job.description,
          requiredSkills: job.requiredSkills,
          jobType: job.jobType,
        },
        matchScore: job.matchScore,
        status: 'applied',
      });
      setApplied(true);
      toast.success(`Applied to ${job.title} at ${job.company}!`);
      if (onApplied) onApplied(job.jobId);
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg?.includes('already applied')) {
        setApplied(true);
        toast('Already applied to this job', { icon: 'ℹ️' });
      } else {
        toast.error(msg || 'Failed to apply');
      }
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="card fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
            {job.title}
          </h3>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{job.company}</div>
        </div>
        <MatchBadge score={job.matchScore || 0} />
      </div>

      {/* Meta */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {job.location && (
          <span className="skill-pill">📍 {job.location}</span>
        )}
        {job.jobType && (
          <span className="skill-pill">💼 {job.jobType}</span>
        )}
        {job.source && (
          <span className="skill-pill">🔗 {job.source}</span>
        )}
      </div>

      {/* Matched skills */}
      {job.matchedSkills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {job.matchedSkills.slice(0, 5).map((s) => (
            <span key={s} className="skill-pill matched">{s}</span>
          ))}
          {job.matchedSkills.length > 5 && (
            <span className="skill-pill" style={{ color: 'var(--text-muted)' }}>+{job.matchedSkills.length - 5}</span>
          )}
        </div>
      )}

      {/* Missing skills */}
      {job.missingSkills?.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {job.missingSkills.slice(0, 3).map((s) => (
            <span key={s} className="skill-pill missing">{s}</span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
        <button
          onClick={handleApply}
          disabled={applying || applied}
          className="btn-accent"
          style={{ flex: 1, justifyContent: 'center' }}
        >
          {applying ? '⏳ Applying…' : applied ? '✓ Applied' : '⚡ Quick Apply'}
        </button>
        {job.url && (
          <a
            href={job.url}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
            style={{ padding: '10px 14px' }}
          >↗</a>
        )}
      </div>
    </div>
  );
};

export default JobCard;
