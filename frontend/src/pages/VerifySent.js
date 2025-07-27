// src/pages/VerifySent.jsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ResendConfirmationModal from '../components/ResendConfirmationModal';

export default function VerifySent() {
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    setEmail(
      location.state?.email ||
      localStorage.getItem('emailRegistrado') ||
      localStorage.getItem('emailRecuperar') ||
      ''
    );

    return () => {
      localStorage.removeItem('emailRegistrado');
      localStorage.removeItem('emailRecuperar');
    };
  }, [location.state]);

  return (
    <div className="auth-card verify-sent">
      <h2>📩 Revisá tu correo</h2>
      <p>Te enviamos un email a <strong>{email}</strong>.</p>
      <p>Si no lo encontrás, revisá tu carpeta de spam o correo no deseado.</p>

      <div className="actions">
        <button onClick={() => setModalOpen(true)} className="link noLoRecibiste">
          ¿No lo recibiste? Reenviar
        </button>
        <br />
        <a href="/login" className="link">Volver al inicio de sesión</a>
      </div>

      {modalOpen && (
        <ResendConfirmationModal
          onClose={() => setModalOpen(false)}
          emailProp={email}
        />
      )}
    </div>
  );
}