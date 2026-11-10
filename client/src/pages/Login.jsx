import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [signup, setSignup] = useState(false);
  const [f, setF] = useState({ nom: '', email: '', motDePasse: '', role: 'etudiant' });
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const submit = async e => {
    e.preventDefault(); setErr('');
    try {
      const { data } = await api.post(signup ? '/auth/register' : '/auth/login', f);
      login(data); nav('/');
    } catch (x) { setErr(errMsg(x)); }
  };

  return (
    <div className="auth">
      <form className="card form" onSubmit={submit}>
        <h1>{signup ? 'Créer un compte' : 'Connexion'}</h1>
        {signup && <input required placeholder="Nom complet" value={f.nom} onChange={set('nom')} />}
        <input required type="email" placeholder="Email" value={f.email} onChange={set('email')} />
        <input required type="password" minLength={6} placeholder="Mot de passe (6 caractères min.)" value={f.motDePasse} onChange={set('motDePasse')} />
        {signup && <select value={f.role} onChange={set('role')}><option value="etudiant">Je suis étudiant</option><option value="club">Je représente un club</option></select>}
        {err && <small className="err">{err}</small>}
        <button className="btn">{signup ? 'Créer mon compte' : 'Se connecter'}</button>
        <button type="button" className="ghost" onClick={() => setSignup(!signup)}>{signup ? 'J’ai déjà un compte' : 'Pas de compte ? Inscrivez-vous'}</button>
        <Link to="/" className="mute">Continuer en visiteur</Link>
      </form>
    </div>
  );
}
