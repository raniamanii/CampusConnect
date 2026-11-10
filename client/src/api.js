import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });
// Intercepteur : ajoute le JWT stocké dans localStorage à chaque requête
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
export const errMsg = e => e.response?.data?.message || 'Erreur réseau, réessayez.';
export default api;
