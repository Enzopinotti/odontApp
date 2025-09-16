// src/components/GuestRoute.jsx
import { Navigate } from 'react-router-dom';
import useAuth from '../features/auth/hooks/useAuth';
export default function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null; // o un spinner

  return user ? <Navigate to="/" replace /> : children;
}
