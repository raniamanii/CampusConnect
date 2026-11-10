export default function Stars({ value = 0, onChange }) {
  return (
    <span className="stars" aria-label={`${value} sur 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= Math.round(value) ? 'on' : ''}
          onClick={onChange ? () => onChange(n) : undefined} style={onChange ? { cursor: 'pointer' } : null}>★</span>
      ))}
    </span>
  );
}
