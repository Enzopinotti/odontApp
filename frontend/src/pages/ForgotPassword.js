import { useState } from 'react';
import { forgotPassword } from '../api/auth';
import showToast from '../hooks/useToast';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return showToast('Ingresá tu email', 'error');

    try {
      setLoading(true);
      await forgotPassword(email);
      showToast('Si existe tu cuenta, te enviamos un correo.', 'success');
      navigate('/verify-sent');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al enviar el correo', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <h2>Recuperar contraseña</h2>

      <input
        type="email"
        placeholder="Tu correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Enviando...' : 'Enviar enlace'}
      </button>

      <div className="actions">
        <a href="/login" className="link">Volver al inicio de sesión</a>
      </div>
    </form>
  );
}
