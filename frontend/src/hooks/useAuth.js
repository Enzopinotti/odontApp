// src/hooks/useAuth.js
import { useContext } from 'react';
import { AuthCtx } from '../context/AuthProvider';

export default function useAuth() {
  return useContext(AuthCtx);
}
