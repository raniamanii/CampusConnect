import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import EventCard from '../components/EventCard';
import Stars from '../components/Stars';
import { isPast } from '../utils';

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [ev, setEv] = useState(null);
  const [fbs, setFbs] = useState([]);
  const [form, setForm] = useState({ note: 5, commentaire: '' });
  const [err, setErr] = useState('');

  const load = () => {
    api.get(`/events/${id}`).then(r => setEv(r.data)).catch(() => nav('/evenements'));
    api.get(`/events/${id}/feedback`).then(r => setFbs(r.data));
  };
  useEffect(load, [id]);
  if (!ev) return <p className="empty">Chargement…</p>;

  const joined = user && ev.inscrits.includes(user._id);
  const mineFb = user && fbs.some(f => f.auteur._id === user._id);
  const send = async e => {
    e.preventDefault(); setErr('');
    try { await api.post(`/events/${id}/feedback`, form); setForm({ note: 5, commentaire: '' }); load(); }
    catch (x) { setErr(errMsg(x)); }
  };
  const del = async fid => { await api.delete(`/feedback/${fid}`); load(); };

  return (
    <>
      <Link to="/evenements" className="mute">← Tous les événements</Link>
      <EventCard e={ev} onUpdate={(_, inscrits) => setEv({ ...ev, inscrits })} />
      <h2 className="sec">Avis ({fbs.length})</h2>
      {joined && !mineFb && (
        <form className="card form" onSubmit={send}>
          <label>Votre note <Stars value={form.note} onChange={n => setForm({ ...form, note: n })} /></label>
          <textarea required maxLength={500} placeholder={isPast(ev) ? 'Qu’avez-vous pensé de l’événement ?' : 'Vous pourrez aussi donner votre avis après l’événement'}
            value={form.commentaire} onChange={e => setForm({ ...form, commentaire: e.target.value })} />
          {err && <small className="err">{err}</small>}
          <button className="btn">Publier mon avis</button>
        </form>
      )}
      {!user && <p className="empty">Connectez-vous et inscrivez-vous pour laisser un avis.</p>}
      {fbs.map(f => (
        <div className="card fb" key={f._id}>
          <div><b>{f.auteur.nom}</b> <Stars value={f.note} /><p>{f.commentaire}</p></div>
          {user && (user.role === 'admin' || user._id === f.auteur._id) && <button className="ghost" onClick={() => del(f._id)}>Supprimer</button>}
        </div>
      ))}
      {!fbs.length && user && <p className="empty">Pas encore d’avis pour cet événement.</p>}
    </>
  );
}
