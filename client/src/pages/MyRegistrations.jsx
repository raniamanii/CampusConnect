import { useEffect, useState } from 'react';
import api from '../api';
import EventCard from '../components/EventCard';
import { isPast } from '../utils';

export default function MyRegistrations() {
  const [list, setList] = useState([]);
  const [tab, setTab] = useState('avenir');
  useEffect(() => { api.get('/events/mes-inscriptions').then(r => setList(r.data)); }, []);

  const shown = list.filter(e => (tab === 'passes') === isPast(e));
  const onUpdate = (id) => setList(l => l.filter(x => x._id !== id)); // seule action possible : se désinscrire

  return (
    <>
      <header className="top"><h1>Mes inscriptions</h1></header>
      <div className="chips">
        <button className={tab === 'avenir' ? 'chip sel' : 'chip'} onClick={() => setTab('avenir')}>À venir</button>
        <button className={tab === 'passes' ? 'chip sel' : 'chip'} onClick={() => setTab('passes')}>Passés</button>
      </div>
      {shown.map(e => <EventCard key={e._id} e={e} onUpdate={onUpdate} />)}
      {!shown.length && <p className="empty">{tab === 'avenir' ? 'Aucune inscription à venir. Explorez les événements pour en trouver.' : 'Aucun événement passé. Ouvrez-en un pour laisser votre avis.'}</p>}
    </>
  );
}
