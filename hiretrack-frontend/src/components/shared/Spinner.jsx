const Spinner = ({ size = 36 }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
    <div
      className="spinner"
      style={{
        width: size,
        height: size,
        border: '3px solid var(--border)',
        borderTop: '3px solid var(--accent)',
        borderRadius: '50%',
      }}
    />
  </div>
);

export default Spinner;
