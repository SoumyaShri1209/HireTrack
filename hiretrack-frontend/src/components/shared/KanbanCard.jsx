import { Draggable } from '@hello-pangea/dnd';

const statusColors = {
  applied: '#38bdf8',
  phone_screen: '#fbbf24',
  interview: '#a78bfa',
  offer: '#00d084',
  accepted: '#34d399',
  rejected: '#ff4d6d',
};

const KanbanCard = ({ app, index, onDelete }) => {
  const color = statusColors[app.status] || '#8891aa';

  return (
    <Draggable draggableId={app._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={snapshot.isDragging ? 'dragging' : ''}
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderLeft: `3px solid ${color}`,
            borderRadius: 12,
            padding: '12px 14px',
            marginBottom: 10,
            cursor: 'grab',
            transition: 'box-shadow 0.2s',
            ...provided.draggableProps.style,
          }}
        >
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 4 }}>
            {app.job?.title || 'Unknown Role'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>
            {app.job?.company || 'Unknown Company'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {app.matchScore != null && (
              <span style={{ fontSize: 11, color, fontWeight: 600 }}>
                {app.matchScore}% match
              </span>
            )}
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {app.appliedDate ? new Date(app.appliedDate).toLocaleDateString() : ''}
            </span>
          </div>
          {app.notes && (
            <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border)', paddingTop: 6 }}>
              {app.notes.slice(0, 80)}{app.notes.length > 80 ? '…' : ''}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
