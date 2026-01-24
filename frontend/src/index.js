// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import './styles/main.scss';

import AuthProvider from './context/AuthProvider';
import ToastProvider from './context/ToastProvider';
import ModalProvider from './context/ModalProvider';
import ReactQueryProvider from './context/ReactQueryProvider'; 

// Silenciar el error de ResizeObserver que no afecta la funcionalidad
const resizeObserverErrorHandler = (e) => {
  if (e.message === 'ResizeObserver loop completed with undelivered notifications.' ||
      e.message === 'ResizeObserver loop limit exceeded') {
    e.stopImmediatePropagation();
    e.stopPropagation();
    return true;
  }
};

window.addEventListener('error', resizeObserverErrorHandler);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <ReactQueryProvider> 
              <App />
            </ReactQueryProvider>
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
