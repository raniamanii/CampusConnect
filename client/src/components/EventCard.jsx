import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { fmtDate, initials, isPast } from '../utils';
import Stars from './Stars';

export default function EventCard({ e, onUpdate }) {
  const { user } = useAuth();
  const [err, setErr] = useState('');
  const joined = user && e.inscrits.includes(user._id);
  const full = e.inscrits.length >= e.capacite;
  const past = isPast(e);
  const pct = Math.min(100, Math.round((e.inscrits.length / e.capacite) * 100));

  const toggle = async () => {
    setErr('');
    try {
      const { data } = joined ? await api.delete(`/events/${e._id}/inscription`) : await api.post(`/events/${e._id}/inscription`);
      onUpdate(e._id, data.inscrits);
    } catch (x) { setErr(errMsg(x)); }
  };

  return (
    <article className="card ev">
      <span className={`dot cat-${e.categorie}`}>{initials(e.categorie)}</span>
      <div className="ev-body">
        <h3><Link to={`/evenements/${e._id}`}>{e.titre}</Link></h3>
        <p className="mute">{e.description}</p>
        <p className="meta"><span>{fmtDate(e.date)}</span><span>{e.heureDebut} – {e.heureFin}</span><span>{e.lieu}</span></p>
        <div className="row">
          <span className={`chip cat-${e.categorie}`}>{e.categorie}</span>
          <span className="chip">{e.niveau}</span>
          {e.moyenne && <span className="rate"><Stars value={e.moyenne} /> {e.moyenne} <small>({e.nbAvis})</small></span>}
          {e.tags.map(t => <span key={t} className="tag">{t}</span>)}
        </div>
      </div>
      <div className="ev-side">
        <div className="seats"><span>{e.inscrits.length}/{e.capacite} places</span><i><b style={{ width: `${pct}%` }} className={pct > 85 ? 'hot' : ''} /></i></div>
        <small className="mute">par {e.organisateur?.nom}</small>
        {past ? <span className="chip">Terminé</span>
          : !user ? <Link className="btn" to="/connexion">Se connecter pour s’inscrire</Link>
          : <button className={joined ? 'btn out' : 'btn'} disabled={!joined && full} onClick={toggle}>
              {joined ? 'Se désinscrire' : full ? 'Complet' : 'S’inscrire'}
            </button>}
        {err && <small className="err">{err}</small>}
      </div>
    </article>
  );
}
