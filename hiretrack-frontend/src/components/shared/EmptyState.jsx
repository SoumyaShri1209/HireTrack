const EmptyState = ({ icon = '◌', title = 'Nothing here yet', subtitle = '', action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '60px 20px', gap: 16, textAlign: 'center',
  }}>
    <div style={{ fontSize: 48, color: 'var(--text-muted)', lineHeight: 1 }}>{icon}</div>
    <div>
      <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 6 }}>
        {title}
      </h3>
      {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{subtitle}</p>}
    </div>
    {action && (
      <button className="btn-accent" onClick={action.onClick}>{action.label}</button>
    )}
  </div>
);

export default EmptyState;
