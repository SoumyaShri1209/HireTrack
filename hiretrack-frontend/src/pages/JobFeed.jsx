import { useEffect, useState, useCallback } from 'react';
import { jobsApi } from '../services/api';
import JobCard from '../components/shared/JobCard';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import toast from 'react-hot-toast';

const JOB_TYPES = ['all', 'job', 'internship'];

const JobFeed = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [jobType, setJobType] = useState('all');
  const [minScore, setMinScore] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedIds, setAppliedIds] = useState(new Set());

  const fetch = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (query.trim()) params.q = query.trim();
      if (jobType !== 'all') params.type = jobType;
      if (minScore > 0) params.minScore = minScore;

      const { data } = await jobsApi.feed(params);
      setJobs(data.data || []);
      setSearchQuery(data.searchQuery || '');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load jobs';
      setError(msg);
      if (msg.includes('resume')) {
        toast.error('Upload your resume first to get personalized matches!', { duration: 5000 });
      }
    } finally {
      setLoading(false);
    }
  }, [query, jobType, minScore]);

  useEffect(() => { fetch(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetch();
  };

  const markApplied = (jobId) => {
    setAppliedIds((prev) => new Set([...prev, jobId]));
  };

  const displayed = jobs.map((j) => ({ ...j, _applied: appliedIds.has(j.jobId) }));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Search + Filters */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input
          id="job-search"
          type="text"
          className="input"
          placeholder="Search jobs, roles, skills…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />

        {/* Type Filter */}
        <div style={{ display: 'flex', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {JOB_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setJobType(t)}
              style={{
                padding: '10px 16px', border: 'none', cursor: 'pointer',
                fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
                background: jobType === t ? 'var(--accent)' : 'transparent',
                color: jobType === t ? '#000' : 'var(--text-muted)',
                textTransform: 'capitalize',
                transition: 'all 0.15s',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Min Score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 16px' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Min Match:</span>
          <select
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
          >
            {[0, 30, 50, 70, 90].map((v) => (
              <option key={v} value={v} style={{ background: 'var(--surface-2)' }}>{v}%</option>
            ))}
          </select>
        </div>

        <button className="btn-accent" type="submit">🔍 Search</button>
      </form>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16 }}>
            {jobs.length} Jobs Found
          </h2>
          {searchQuery && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              AI query: <em style={{ color: 'var(--accent)' }}>"{searchQuery}"</em>
            </p>
          )}
        </div>
        <button className="btn-ghost" style={{ fontSize: 12, padding: '8px 14px' }} onClick={fetch}>
          ↺ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 12, padding: '16px 20px', color: '#ff4d6d', fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <Spinner />
      ) : jobs.length === 0 ? (
        <EmptyState
          icon="◈"
          title="No jobs found"
          subtitle={error ? '' : 'Try a different search query or upload your resume for personalized matches'}
          action={!error ? { label: '→ Upload Resume', onClick: () => window.location.href = '/resume' } : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
          {displayed.map((job) => (
            <JobCard key={job.jobId} job={job} onApplied={markApplied} />
          ))}
        </div>
      )}
    </div>
  );
};

export default JobFeed;
