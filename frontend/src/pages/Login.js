import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, login2FA, googleUrl } from '../api/auth';
import useAuth from '../hooks/useAuth';
import showToast from '../hooks/useToast';
import { FcGoogle } from 'react-icons/fc';

export default function Login() {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [need2FA, setNeed2FA] = useState(false);
  const [token2FA, setToken2FA] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!need2FA) {
        const { data } = await login(form);
        if (data.data?.require2FA) {
          setNeed2FA(true);
          showToast('Ingrese su código 2FA', 'info');
        } else {
          setUser(data.data?.user);
          showToast('Sesión iniciada', 'success');
          navigate('/');
        }
      } else {
        const { data } = await login2FA({ email: form.email, token: token2FA });
        setUser(data.data?.user);
        showToast('2FA exitoso', 'success');
        navigate('/');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al iniciar sesión', 'error');
    }
  };

  const startGoogle = () => {
    window.location = googleUrl();
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <h2>Iniciar sesión</h2>

      <input
        type="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      {!need2FA && (
        <input
          type="password"
          placeholder="Contraseña"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
      )}

      {need2FA && (
        <input
          placeholder="Código 2FA"
          value={token2FA}
          onChange={(e) => setToken2FA(e.target.value)}
          required
        />
      )}

      <button type="submit">Ingresar</button>

      <div className="actions">
        <button type="button" onClick={startGoogle} className="google-btn">
          <FcGoogle size={20} /> Iniciar con Google
        </button>
        <a href="/forgot-password" className="link">¿Olvidaste tu contraseña?</a>
        <a href="/register" className="link">¿No tenés cuenta? Registrate</a>
      </div>
    </form>
  );
}
