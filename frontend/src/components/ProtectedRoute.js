// src/components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuth from '../features/auth/hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/login" replace />;

  return children;
}
