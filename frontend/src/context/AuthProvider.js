// src/context/AuthProvider.jsx
import { createContext, useEffect, useState } from 'react';
import * as authApi from '../api/auth';

export const AuthCtx = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Obtener info del usuario al montar
  useEffect(() => {
    authApi.me()
      .then(({ data }) => setUser(data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const logout = async () => {
    await authApi.logout();
    setUser(null);
    window.location = '/login';
  };

  const value = { user, setUser, loading, logout };

  return (
    <AuthCtx.Provider value={value}>
      {!loading && children}
    </AuthCtx.Provider>
  );
}
