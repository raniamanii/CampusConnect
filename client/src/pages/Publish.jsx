import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { CATS, NIVEAUX, fmtDate } from '../utils';

const EMPTY = { titre: '', description: '', categorie: CATS[0], niveau: NIVEAUX[0], date: '', heureDebut: '', heureFin: '', lieu: '', capacite: 50, tags: '' };

export default function Publish() {
  const { user } = useAuth();
  const [f, setF] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [pending, setPending] = useState([]);
  const admin = user.role === 'admin';
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const loadPending = () => admin && api.get('/events/en-attente').then(r => setPending(r.data));
  useEffect(() => { loadPending(); }, []);

  const submit = async e => {
    e.preventDefault(); setErr(''); setMsg('');
    try {
      await api.post('/events', { ...f, capacite: +f.capacite, tags: f.tags.split(',').map(t => t.trim()).filter(Boolean) });
      setMsg(admin ? 'Événement publié.' : 'Événement envoyé : il sera visible après validation par un administrateur.');
      setF(EMPTY);
    } catch (x) { setErr(errMsg(x)); }
  };
  const act = async (fn) => { await fn(); loadPending(); };

  return (
    <>
      <header className="top"><h1>{admin ? 'Publications' : 'Publier un événement'}</h1></header>
      <form className="card form grid" onSubmit={submit}>
        <input required placeholder="Titre" value={f.titre} onChange={set('titre')} className="w2" />
        <textarea required placeholder="Description" value={f.description} onChange={set('description')} className="w2" />
        <select value={f.categorie} onChange={set('categorie')}>{CATS.map(c => <option key={c}>{c}</option>)}</select>
        <select value={f.niveau} onChange={set('niveau')}>{NIVEAUX.map(c => <option key={c}>{c}</option>)}</select>
        <input required type="date" value={f.date} onChange={set('date')} />
        <input required placeholder="Lieu" value={f.lieu} onChange={set('lieu')} />
        <input required type="time" value={f.heureDebut} onChange={set('heureDebut')} />
        <input required type="time" value={f.heureFin} onChange={set('heureFin')} />
        <input required type="number" min="1" placeholder="Capacité" value={f.capacite} onChange={set('capacite')} />
        <input placeholder="Tags (séparés par des virgules)" value={f.tags} onChange={set('tags')} />
        {err && <small className="err w2">{err}</small>}
        {msg && <small className="ok w2">{msg}</small>}
        <button className="btn w2">Publier l’événement</button>
      </form>
      {admin && <>
        <h2 className="sec">À valider ({pending.length})</h2>
        {pending.map(e => (
          <div className="card fb" key={e._id}>
            <div><b>{e.titre}</b><p className="mute">{fmtDate(e.date)} · {e.lieu} · par {e.organisateur?.nom}</p></div>
            <div className="row">
              <button className="btn" onClick={() => act(() => api.patch(`/events/${e._id}/valider`))}>Valider</button>
              <button className="btn out" onClick={() => act(() => api.delete(`/events/${e._id}`))}>Refuser</button>
            </div>
          </div>
        ))}
        {!pending.length && <p className="empty">Rien à valider pour le moment.</p>}
      </>}
    </>
  );
}
