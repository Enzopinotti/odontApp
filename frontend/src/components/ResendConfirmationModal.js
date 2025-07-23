import { useState } from 'react';
import { resendConfirmation } from '../api/auth';
import showToast from '../hooks/useToast';

export default function ResendConfirmationModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return showToast('Ingresá tu correo', 'error');

    try {
      setLoading(true);
      await resendConfirmation(email);
      showToast('Correo reenviado correctamente', 'success');
      onClose(); // cerrar modal
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al reenviar el correo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="auth-card modal-card">
        <h2>Reenviar verificación</h2>

        <form onSubmit={handleResend}>
          <input
            type="email"
            placeholder="Tu correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Enviando...' : 'Reenviar'}
          </button>
        </form>

        <div className="actions">
          <button className="link" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
