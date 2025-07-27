import { useState } from 'react';
import { resendConfirmation } from '../api/auth';
import useToast from '../hooks/useToast';

export default function ResendConfirmationModal({ onClose, emailProp = '' }) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailProp || !emailProp.match(/^\S+@\S+\.\S+$/)) {
      return showToast('Correo no válido', 'error');
    }

    try {
      setLoading(true);
      await resendConfirmation(emailProp);
      showToast('Correo reenviado correctamente', 'success');
      onClose?.();
    } catch (err) {
      showToast(err.response?.data?.message || 'Error reenviando correo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <form className="auth-card modal-card" onSubmit={handleSubmit}>
        <h2 style={{ marginBottom: '1.2rem' }}>Reenviar verificación</h2>

        <p style={{ fontSize: '0.95rem', marginBottom: '1rem', textAlign: 'center' }}>
          Se enviará un correo de verificación a:<br />
          <strong>{emailProp}</strong>
        </p>

        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ background: '#ccc' }}>
            Cancelar
          </button>
          <button type="submit" disabled={loading}>
            {loading ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </form>
    </div>
  );
}
