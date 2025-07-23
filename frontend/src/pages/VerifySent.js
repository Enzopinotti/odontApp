import { useState } from 'react';
import ResendConfirmationModal from '../components/ResendConfirmationModal';

export default function VerifySent() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="auth-card verify-sent">
      <h2>📩 Revisá tu correo</h2>
      <p>Te enviamos un email a <strong>tu dirección registrada</strong>.</p>
      <p>Si no lo encontrás, revisá tu carpeta de spam o correo no deseado.</p>

      <div className="actions">
        <button onClick={() => setModalOpen(true)} className="link">
          ¿No lo recibiste? Reenviar
        </button>
        <br />
        <a href="/login" className="link">Volver al inicio de sesión</a>
      </div>

      {modalOpen && <ResendConfirmationModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}
