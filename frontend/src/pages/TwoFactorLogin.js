import { useState } from 'react';
import { login2FA } from '../api/auth';
import useToast from '../hooks/useToast';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function TwoFactorLogin() {
  const [code, setCode] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { setUser } = useAuth();

  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login2FA({ email, token: code });
      setUser(data.data.user); // si devolvés user
      navigate('/dashboard');
    } catch (err) {
      showToast('Código inválido', 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <h2>Verificación 2FA</h2>
      <p>Ingresá el código generado por tu app de autenticación:</p>

      <input
        type="text"
        placeholder="Código 2FA"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoFocus
        required
      />

      <button type="submit">Verificar</button>
    </form>
  );
}
