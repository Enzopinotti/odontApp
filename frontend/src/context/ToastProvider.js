// src/context/ToastProvider.jsx
import { createContext, useState, useCallback } from 'react';

export const ToastCtx = createContext({});

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  return (
    <ToastCtx.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`toast toast--${toast.type}`}>
          {toast.message}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
