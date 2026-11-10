import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { initials } from '../utils';

const ROLES = { etudiant: 'Étudiant', club: 'Club', admin: 'Administrateur' };

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [dark, setDark] = useState(localStorage.getItem('theme') === 'dark');
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const links = [
    ['/', 'Accueil', true],
    ['/evenements', 'Événements'],
    ...(user ? [['/inscriptions', 'Mes inscriptions']] : []),
    ...(user && user.role !== 'etudiant' ? [['/publier', user.role === 'admin' ? 'Publications' : 'Publier un événement']] : []),
  ];

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><span className="logo">C</span><div><b>CampusConnect</b><small>Vie étudiante</small></div></div>
        <nav>{links.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}</nav>
        <div className="side-foot">
          <button className="ghost" onClick={() => setDark(d => !d)}>{dark ? 'Mode clair' : 'Mode sombre'}</button>
          {user ? (
            <div className="me">
              <span className="avatar">{initials(user.nom)}</span>
              <div><b>{user.nom}</b><small>{ROLES[user.role]}</small></div>
              <button className="ghost" onClick={() => { logout(); nav('/'); }}>Quitter</button>
            </div>
          ) : <button className="btn" onClick={() => nav('/connexion')}>Se connecter</button>}
        </div>
      </aside>
      <main><Outlet /></main>
    </div>
  );
}
