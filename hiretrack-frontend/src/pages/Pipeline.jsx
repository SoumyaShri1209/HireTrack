import { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { applicationsApi } from '../services/api';
import KanbanCard from '../components/shared/KanbanCard';
import Spinner from '../components/shared/Spinner';
import EmptyState from '../components/shared/EmptyState';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const COLUMNS = [
  { id: 'applied',      label: 'Applied',      color: '#38bdf8' },
  { id: 'phone_screen', label: 'Phone Screen',  color: '#fbbf24' },
  { id: 'interview',    label: 'Interview',     color: '#a78bfa' },
  { id: 'offer',        label: 'Offer',         color: '#00d084' },
  { id: 'accepted',     label: 'Accepted',      color: '#34d399' },
  { id: 'rejected',     label: 'Rejected',      color: '#ff4d6d' },
];

const Pipeline = () => {
  const navigate = useNavigate();
  const [kanban, setKanban] = useState({ applied:[], phone_screen:[], interview:[], offer:[], accepted:[], rejected:[] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    applicationsApi.getAll()
      .then(({ data }) => setKanban(data.data.kanban))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    const srcCol = source.droppableId;
    const dstCol = destination.droppableId;
    if (srcCol === dstCol && source.index === destination.index) return;

    const srcItems = Array.from(kanban[srcCol]);
    const [moved] = srcItems.splice(source.index, 1);
    const dstItems = srcCol === dstCol ? srcItems : Array.from(kanban[dstCol]);
    dstItems.splice(destination.index, 0, { ...moved, status: dstCol });

    setKanban((prev) => ({ ...prev, [srcCol]: srcItems, [dstCol]: dstItems }));

    try {
      await applicationsApi.updateStatus(draggableId, dstCol);
      toast.success(`Moved to ${dstCol.replace('_', ' ')}`);
    } catch {
      toast.error('Failed to update status');
      applicationsApi.getAll().then(({ data }) => setKanban(data.data.kanban));
    }
  };

  const total = Object.values(kanban).flat().length;

  if (loading) return <Spinner />;

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{total} applications · drag to update status</p>
        <button className="btn-accent" onClick={() => navigate('/jobs')}>+ Add Application</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 12, padding: '12px 16px', color: '#ff4d6d', fontSize: 13 }}>
          ⚠️ {error}
        </div>
      )}

      {total === 0 ? (
        <EmptyState icon="⬢" title="Pipeline is empty" subtitle="Apply to jobs to start tracking" action={{ label: '⚡ Find Jobs', onClick: () => navigate('/jobs') }} />
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12 }}>
            {COLUMNS.map((col) => (
              <div key={col.id} style={{ minWidth: 240, width: 240, flexShrink: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderTop: `3px solid ${col.color}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 11, color: col.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{col.label}</span>
                  <span style={{ minWidth: 22, height: 22, borderRadius: 6, background: `${col.color}20`, color: col.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{kanban[col.id]?.length || 0}</span>
                </div>
                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: 80, borderRadius: 10, background: snapshot.isDraggingOver ? `${col.color}0a` : 'transparent', transition: 'background 0.15s' }}>
                      {(kanban[col.id] || []).map((app, index) => (
                        <KanbanCard key={app._id} app={app} index={index} />
                      ))}
                      {provided.placeholder}
                      {!kanban[col.id]?.length && !snapshot.isDraggingOver && (
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 12 }}>Drop here</div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}
    </div>
  );
};

export default Pipeline;
