// src/hooks/useToast.js
import { useContext } from 'react';
import { ToastCtx } from '../context/ToastProvider';

export default function useToast() {
  return useContext(ToastCtx); 
}
