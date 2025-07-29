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
