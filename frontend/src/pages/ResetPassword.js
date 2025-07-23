import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import showToast from '../hooks/useToast';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !repeat) return showToast('Completá ambos campos', 'error');
    if (password.length < 6) return showToast('La contraseña es muy corta', 'error');
    if (password !== repeat) return showToast('Las contraseñas no coinciden', 'error');

    try {
      setLoading(true);
      await resetPassword(token, password);
      showToast('Contraseña actualizada con éxito', 'success');
      navigate('/login');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al cambiar la contraseña', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <h2>Restablecer contraseña</h2>

      <input
        type="password"
        placeholder="Nueva contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Repetir contraseña"
        value={repeat}
        onChange={(e) => setRepeat(e.target.value)}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Actualizando...' : 'Guardar nueva contraseña'}
      </button>

      <div className="actions">
        <a href="/login" className="link">Volver al inicio de sesión</a>
      </div>
    </form>
  );
}
