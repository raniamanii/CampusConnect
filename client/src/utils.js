import { useEffect, useState } from 'react';

export const CATS = ['Technologie', 'Culture', 'Sport', 'Carrière', 'Science'];
export const NIVEAUX = ['Tous niveaux', 'Débutant', 'Intermédiaire', 'Avancé'];
const at = (e, t) => new Date(`${e.date.slice(0, 10)}T${t}`);
export const isPast = e => at(e, e.heureFin) < new Date();
export const hours = e => Math.max(0, (at(e, e.heureFin) - at(e, e.heureDebut)) / 36e5);
export const fmtDate = d => new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });
export const initials = s => s.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();

export function useCountdown(e) {
  const target = at(e, e.heureDebut).getTime();
  const [left, setLeft] = useState(target - Date.now());
  useEffect(() => {
    const t = setInterval(() => setLeft(target - Date.now()), 1000);
    return () => clearInterval(t);
  }, [target]);
  const s = Math.max(0, Math.floor(left / 1000));
  return { Jours: Math.floor(s / 86400), Heures: Math.floor((s % 86400) / 3600), Min: Math.floor((s % 3600) / 60), Sec: s % 60 };
}
