// src/pages/ResetPassword.jsx
// ===============================
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';
import useToast from '../hooks/useToast';
import { handleApiError } from '../utils/handleApiError';
import { BsEye, BsEyeSlash } from 'react-icons/bs';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [password, setPassword] = useState('');
  const [repeat, setRepeat] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showRepeat, setShowRepeat] = useState(false);
  const [loading, setLoading] = useState(false);

  const validations = {
    length:  password.length >= 8,
    upper:   /[A-Z]/.test(password),
    lower:   /[a-z]/.test(password),
    number:  /\d/.test(password),
    special: /[!@#$%^&*]/.test(password),
  };
  const allValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !repeat)
      return showToast('Completá ambos campos', 'error');
    if (!allValid)
      return showToast('La contraseña no cumple los requisitos', 'error');
    if (password !== repeat)
      return showToast('Las contraseñas no coinciden', 'error');

    try {
      setLoading(true);
      await resetPassword(token, password);
      showToast('Contraseña actualizada con éxito', 'success');
      navigate('/login');
    } catch (err) {
      handleApiError(err, showToast); // maneja PASSWORD_REPETIDA, TOKEN_INVALIDO, etc.
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-card" noValidate>
      <h2>Restablecer contraseña</h2>

      {/* NUEVA CONTRASEÑA */}
      <div className="password-wrapper">
        <label htmlFor="nueva" className="sr-only">Nueva contraseña</label>
        <input
          id="nueva"
          type={showPwd ? 'text' : 'password'}
          placeholder="Nueva contraseña"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <span
          onClick={() => setShowPwd(!showPwd)}
          className="toggle-eye"
          aria-label="Mostrar contraseña"
        >
          {showPwd ? <BsEyeSlash /> : <BsEye />}
        </span>
      </div>

      {/* REGLAS */}
      <div className="password-rules" aria-live="polite">
        <p className={validations.length  ? 'valid' : ''}>• Mínimo 8 caracteres</p>
        <p className={validations.upper   ? 'valid' : ''}>• Al menos una mayúscula</p>
        <p className={validations.lower   ? 'valid' : ''}>• Al menos una minúscula</p>
        <p className={validations.number  ? 'valid' : ''}>• Al menos un número</p>
        <p className={validations.special ? 'valid' : ''}>• Al menos un símbolo (!@#$%)</p>
      </div>

      {/* REPETIR CONTRASEÑA */}
      <div className="password-wrapper">
        <label htmlFor="repetir" className="sr-only">Repetir contraseña</label>
        <input
          id="repetir"
          type={showRepeat ? 'text' : 'password'}
          placeholder="Repetir contraseña"
          autoComplete="new-password"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
          required
          style={{ borderColor: repeat && repeat === password ? '#3cb371' : undefined }}
        />
        <span
          onClick={() => setShowRepeat(!showRepeat)}
          className="toggle-eye"
          aria-label="Mostrar contraseña"
        >
          {showRepeat ? <BsEyeSlash /> : <BsEye />}
        </span>
      </div>

      {repeat && (
        <p
          className="match-status"
          style={{ color: repeat === password ? '#3cb371' : '#dc143c' }}
        >
          {repeat === password ? '✓ Coinciden' : '✗ No coinciden'}
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Actualizando…' : 'Guardar nueva contraseña'}
      </button>

      <div className="actions">
        <a href="/login" className="link">Volver al inicio de sesión</a>
      </div>
    </form>
  );
}
