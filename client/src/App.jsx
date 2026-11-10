import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Browse from './pages/Browse';
import EventDetail from './pages/EventDetail';
import MyRegistrations from './pages/MyRegistrations';
import Publish from './pages/Publish';
import Login from './pages/Login';

const Private = ({ roles, children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p className="empty">Chargement…</p>;
  if (!user) return <Navigate to="/connexion" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/evenements" element={<Browse />} />
        <Route path="/evenements/:id" element={<EventDetail />} />
        <Route path="/inscriptions" element={<Private><MyRegistrations /></Private>} />
        <Route path="/publier" element={<Private roles={['club', 'admin']}><Publish /></Private>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
