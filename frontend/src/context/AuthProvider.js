// src/context/AuthProvider.jsx
import { createContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as authApi from '../api/auth';

//mocking usuario
const devMode = process.env.NODE_ENV === 'development';

const mockUser = {
  id: 999,
  nombre: 'Dr. Simulado',
  email: 'demo@odontapp.com',
  rol: 'odontologo'
};

export const AuthCtx = createContext();

export default function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, loading: true });
  const location = useLocation();

  const isPublicPath = [
    '/login',
    '/register',
    '/forgot-password',
    '/verify-sent',
  ].includes(location.pathname);

  useEffect(() => {
    if (isPublicPath) {
      setState({ user: null, loading: false });
      return;
    }
//mocking usuario 
      if (devMode) {
    setState({ user: mockUser, loading: false });
    return;
  }


    (async () => {
      try {
        const { data, status } = await authApi.me();
        if (status === 200) {
          console.log('👤 user: ', data.data); // 🔹 Deja el console.log
          setState({ user: data.data, loading: false });
        } else {
          setState({ user: null, loading: false });
        }
      } catch (err) {
        console.warn('🔒 Error inesperado en auth/me:', err);
        setState({ user: null, loading: false });
      }
    })();
  }, [isPublicPath]);

  const logout = async () => {
    await authApi.logout();
    setState({ user: null, loading: false });
    window.location = '/login';
  };

  /** 🔹 Helper para permisos */
  const hasPermiso = (recurso, accion) => {
    const permisos = state.user?.permisos || [];
    return permisos.some((p) => p.recurso === recurso && p.accion === accion);
  };

  const value = {
    ...state,
    setUser: (u) => setState({ ...state, user: u }),
    logout,
    hasPermiso,
  };

  return (
    <AuthCtx.Provider value={value}>
      {!state.loading && children}
    </AuthCtx.Provider>
  );
}
