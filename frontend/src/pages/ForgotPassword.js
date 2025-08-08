import { useState } from 'react';
import { forgotPassword } from '../api/auth';
import useToast from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { handleApiError } from '../utils/handleApiError';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return showToast('Ingresá tu email', 'error');

    try {
      setLoading(true);
      await forgotPassword(email);
      localStorage.setItem('emailRecuperar', email);
      showToast('Si existe tu cuenta, te enviamos un correo.', 'success');
      navigate('/verify-sent');
    } catch (err) {
      handleApiError(err, showToast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card" noValidate>
      <h2>Recuperar contraseña</h2>

      <label htmlFor="forgot-email" className="sr-only">Correo electrónico</label>
      <input
        id="forgot-email"
        type="email"
        name="email"
        placeholder="Tu correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <button type="submit" disabled={loading} aria-busy={loading}>
        {loading ? 'Enviando...' : 'Enviar enlace'}
      </button>

      <div className="actions">
        <a href="/login" className="link">Volver al inicio de sesión</a>
      </div>
    </form>
  );
}
