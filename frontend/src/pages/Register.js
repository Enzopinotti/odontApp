import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, googleUrl } from '../api/auth';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import useAuth from '../hooks/useAuth';
import showToast from '../hooks/useToast';

export default function Register() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  });
  const [repeat, setRepeat] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== repeat)
      return showToast('Las contraseñas no coinciden', 'error');

    try {
      const { data } = await register(form);
      setUser(data.data);
      showToast('Registrado con éxito. Verificá tu email.', 'success');
      navigate('/verify-sent');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al registrarse', 'error');
    }
  };

  const startGoogle = () => {
    window.location = googleUrl();
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card">
      <div style={{ position: 'relative' }}>
        <h2>Registrarse</h2>
        <AiOutlineInfoCircle className="info-icon" onClick={() => setShowInfo(!showInfo)} />
      </div>

      {showInfo && (
        <div className="info-box">
          Se deberá registrar al usuario según su respectivo email. El admin podrá modificar nombre y contraseña.
        </div>
      )}

      <input
        type="text"
        placeholder="Nombre"
        value={form.nombre}
        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
        required
      />

      <input
        type="text"
        placeholder="Apellido"
        value={form.apellido}
        onChange={(e) => setForm({ ...form, apellido: e.target.value })}
        required
      />

      <input
        type="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Contraseña"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />

      <input
        type="password"
        placeholder="Repetir contraseña"
        value={repeat}
        onChange={(e) => setRepeat(e.target.value)}
        required
      />

      <button type="submit">Registrarse</button>

      <div className="actions">
        <button type="button" onClick={startGoogle} className="google-btn">
          <FcGoogle size={20} /> Registrarse con Google
        </button>
        <a href="/login" className="link">¿Ya tenés cuenta? Iniciá sesión</a>
      </div>
    </form>
  );
}
