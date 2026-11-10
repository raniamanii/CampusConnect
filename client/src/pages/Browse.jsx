import { useEffect, useState } from 'react';
import api from '../api';
import EventCard from '../components/EventCard';
import { CATS, isPast } from '../utils';

export default function Browse() {
  const [events, setEvents] = useState([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('Tous');
  const [tri, setTri] = useState('date');
  const [dispo, setDispo] = useState(false);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => api.get('/events', { params: { q, categorie: cat, tri } }).then(r => setEvents(r.data)), 250);
    return () => clearTimeout(t);
  }, [q, cat, tri]);

  const shown = events.filter(e => (showPast || !isPast(e)) && (!dispo || e.inscrits.length < e.capacite));
  const update = (id, inscrits) => setEvents(l => l.map(x => x._id === id ? { ...x, inscrits } : x));

  return (
    <>
      <header className="top"><h1>Événements</h1><p className="mute">{shown.length} résultat(s)</p></header>
      <div className="filters card">
        <input placeholder="Rechercher un titre, un mot-clé, un tag…" value={q} onChange={e => setQ(e.target.value)} />
        <select value={tri} onChange={e => setTri(e.target.value)}>
          <option value="date">Plus proches d’abord</option><option value="recent">Ajoutés récemment</option>
        </select>
        <label><input type="checkbox" checked={dispo} onChange={e => setDispo(e.target.checked)} /> Places disponibles</label>
        <label><input type="checkbox" checked={showPast} onChange={e => setShowPast(e.target.checked)} /> Événements passés</label>
        <div className="chips">{['Tous', ...CATS].map(c => <button key={c} className={c === cat ? 'chip sel' : 'chip'} onClick={() => setCat(c)}>{c}</button>)}</div>
      </div>
      {shown.map(e => <EventCard key={e._id} e={e} onUpdate={update} />)}
      {!shown.length && <p className="empty">Aucun événement ne correspond. Essayez un autre filtre.</p>}
    </>
  );
}
