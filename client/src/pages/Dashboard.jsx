import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import EventCard from '../components/EventCard';
import { fmtDate, hours, isPast, useCountdown } from '../utils';

function Hero({ e }) {
  const c = useCountdown(e);
  return (
    <section className="hero">
      <div>
        <p>Prochain événement</p>
        <h2>{e.titre}</h2>
        <p>{fmtDate(e.date)} à {e.heureDebut} · {e.lieu}</p>
        <Link className="btn amber" to={`/evenements/${e._id}`}>Voir les détails</Link>
      </div>
      <div className="count">{Object.entries(c).map(([k, v]) => <div key={k}><b>{String(v).padStart(2, '0')}</b><small>{k}</small></div>)}</div>
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [mine, setMine] = useState([]);

  useEffect(() => {
    api.get('/events').then(r => setEvents(r.data));
    if (user) api.get('/events/mes-inscriptions').then(r => setMine(r.data));
  }, [user]);

  const upcoming = events.filter(e => !isPast(e));
  const done = mine.filter(isPast);
  const update = (id, inscrits) => {
    setEvents(l => l.map(x => x._id === id ? { ...x, inscrits } : x));
    if (user) api.get('/events/mes-inscriptions').then(r => setMine(r.data));
  };
  const stats = [
    ['Inscriptions à venir', mine.filter(e => !isPast(e)).length],
    ['Événements suivis', done.length],
    ['Heures de participation', `${Math.round(done.reduce((s, e) => s + hours(e), 0))} h`],
    ['Événements ouverts', upcoming.length],
  ];

  return (
    <>
      <header className="top">
        <h1>{user ? `Bonjour ${user.nom.split(' ')[0]}` : 'Bienvenue sur CampusConnect'}</h1>
        <p className="mute">{user ? 'Voici ce qui se passe sur le campus.' : 'Parcourez les événements en visiteur, connectez-vous pour vous inscrire.'}</p>
      </header>
      {user && <div className="stats">{stats.map(([l, v]) => <div className="card stat" key={l}><small>{l}</small><b>{v}</b></div>)}</div>}
      {upcoming[0] && <Hero e={upcoming[0]} />}
      <h2 className="sec">À ne pas manquer</h2>
      {upcoming.slice(0, 4).map(e => <EventCard key={e._id} e={e} onUpdate={update} />)}
      {!upcoming.length && <p className="empty">Aucun événement à venir pour le moment.</p>}
    </>
  );
}
