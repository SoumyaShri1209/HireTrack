const MatchBadge = ({ score }) => {
  const cls = score >= 70 ? 'match-high' : score >= 40 ? 'match-mid' : 'match-low';
  const label = score >= 70 ? '🔥 High Match' : score >= 40 ? '⚡ Mid Match' : '❄ Low Match';
  return (
    <span className={`skill-pill ${cls}`} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700 }}>
      {label} · {score}%
    </span>
  );
};

export default MatchBadge;
