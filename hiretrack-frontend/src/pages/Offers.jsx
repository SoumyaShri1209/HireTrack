import { useEffect, useState } from 'react';
import { offersApi } from '../services/api';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import Modal from '../components/shared/Modal';
import toast from 'react-hot-toast';

const fmt = (n) => n ? `₹${Number(n).toLocaleString('en-IN')}` : 'N/A';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [compareData, setCompareData] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({ company: '', role: '', ctc: '', baseSalary: '', city: '', workMode: 'hybrid', offerDeadline: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    offersApi.getAll()
      .then(({ data }) => setOffers(data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load offers'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleSelect = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const compare = async () => {
    if (selectedIds.length < 2) { toast.error('Select at least 2 offers to compare'); return; }
    try {
      const { data } = await offersApi.compare(selectedIds);
      setCompareData(data.data);
      setCompareOpen(true);
    } catch { toast.error('Compare failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this offer?')) return;
    try {
      await offersApi.delete(id);
      toast.success('Offer deleted');
      setOffers((prev) => prev.filter((o) => o._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await offersApi.create({
        company: form.company,
        role: form.role,
        compensation: { ctc: Number(form.ctc), baseSalary: Number(form.baseSalary) },
        location: { city: form.city, workMode: form.workMode },
        offerDeadline: form.offerDeadline || undefined,
      });
      toast.success('Offer saved!');
      setAddOpen(false);
      setForm({ company: '', role: '', ctc: '', baseSalary: '', city: '', workMode: 'hybrid', offerDeadline: '' });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save offer');
    } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  const statusColor = { pending: '#fbbf24', accepted: '#00d084', rejected: '#ff4d6d', negotiating: '#a78bfa' };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{offers.length} offers received</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {selectedIds.length >= 2 && (
            <button className="btn-ghost" style={{ fontSize: 12 }} onClick={compare}>⚖️ Compare ({selectedIds.length})</button>
          )}
          <button className="btn-accent" onClick={() => setAddOpen(true)}>+ Add Offer</button>
        </div>
      </div>

      {error && <div style={{ color: '#ff4d6d', fontSize: 13 }}>⚠️ {error}</div>}

      {offers.length === 0 ? (
        <EmptyState icon="◉" title="No offers yet" subtitle="Add an offer letter you've received to track and compare it" action={{ label: '+ Add Offer', onClick: () => setAddOpen(true) }} />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px', minWidth: 700 }}>
            <thead>
              <tr>
                {['', 'Company', 'Role', 'CTC', 'Base', 'Location', 'Mode', 'Deadline', 'Status', ''].map((h, i) => (
                  <th key={i} style={{ textAlign: 'left', padding: '6px 14px', fontSize: 11, color: 'var(--text-muted)', fontFamily: 'Syne, sans-serif', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o._id} style={{ background: selectedIds.includes(o._id) ? 'rgba(0,208,132,0.05)' : 'var(--surface)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '12px 14px', borderRadius: '12px 0 0 12px', borderLeft: `3px solid ${selectedIds.includes(o._id) ? 'var(--accent)' : 'var(--border)'}` }}>
                    <input type="checkbox" checked={selectedIds.includes(o._id)} onChange={() => toggleSelect(o._id)} style={{ accentColor: 'var(--accent)', width: 15, height: 15, cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '12px 14px', fontFamily: 'Syne, sans-serif', fontWeight: 700, color: 'var(--text-primary)', fontSize: 13 }}>{o.company}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: 13 }}>{o.role}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--accent)', fontWeight: 700, fontSize: 13 }}>{fmt(o.compensation?.ctc)}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: 13 }}>{fmt(o.compensation?.baseSalary)}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{o.location?.city || 'N/A'}</td>
                  <td style={{ padding: '12px 14px' }}><span className="skill-pill">{o.location?.workMode || 'N/A'}</span></td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: 12 }}>{o.offerDeadline ? new Date(o.offerDeadline).toLocaleDateString() : 'N/A'}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: statusColor[o.decision] || 'var(--text-muted)', background: `${statusColor[o.decision] || '#8891aa'}18`, padding: '3px 10px', borderRadius: 99 }}>
                      {o.decision || 'pending'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', borderRadius: '0 12px 12px 0' }}>
                    <button onClick={() => handleDelete(o._id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Compare Modal */}
      <Modal open={compareOpen} onClose={() => setCompareOpen(false)} title="⚖️ Offer Comparison" width={700}>
        {compareData && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--text-muted)', fontSize: 11 }}>Metric</th>
                  {compareData.companies.map((c, i) => (
                    <th key={i} style={{ padding: '8px 12px', color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontSize: 13 }}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Role', compareData.roles],
                  ['Location', compareData.locations],
                  ['CTC', compareData.ctc.map(fmt)],
                  ['Base Salary', compareData.baseSalaries.map(fmt)],
                  ['Work Mode', compareData.workModes],
                  ['Decision', compareData.decisions],
                ].map(([label, vals]) => (
                  <tr key={label} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: 12 }}>{label}</td>
                    {vals.map((v, i) => (
                      <td key={i} style={{ padding: '10px 12px', fontSize: 13, color: label === 'CTC' ? 'var(--accent)' : 'var(--text-primary)', fontWeight: label === 'CTC' ? 700 : 400 }}>
                        {v ?? 'N/A'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Add Offer Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="+ Add Offer" width={480}>
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['company','Company',true],['role','Role',true],['city','City',false]].map(([k,l,r]) => (
            <div key={k}>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>{l}{r&&' *'}</label>
              <input className="input" required={r} value={form[k]} onChange={(e) => setForm(f=>({...f,[k]:e.target.value}))} />
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>CTC (₹)</label>
              <input className="input" type="number" value={form.ctc} onChange={(e)=>setForm(f=>({...f,ctc:e.target.value}))} placeholder="1200000" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Base Salary (₹)</label>
              <input className="input" type="number" value={form.baseSalary} onChange={(e)=>setForm(f=>({...f,baseSalary:e.target.value}))} placeholder="900000" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Work Mode</label>
              <select className="input" value={form.workMode} onChange={(e)=>setForm(f=>({...f,workMode:e.target.value}))}>
                {['remote','hybrid','onsite'].map(m=><option key={m} style={{background:'var(--surface-2)'}}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Deadline</label>
              <input className="input" type="date" value={form.offerDeadline} onChange={(e)=>setForm(f=>({...f,offerDeadline:e.target.value}))} />
            </div>
          </div>
          <button className="btn-accent" type="submit" disabled={saving} style={{ marginTop: 4, justifyContent: 'center' }}>
            {saving ? '⏳ Saving…' : '→ Save Offer'}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Offers;
