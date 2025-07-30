import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register, googleUrl } from '../api/auth';
import { FcGoogle } from 'react-icons/fc';
import { AiOutlineInfoCircle } from 'react-icons/ai';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import useToast from '../hooks/useToast';
import { handleApiError } from '../utils/handleApiError';

const normalizeName = (str) =>
  str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

export default function Register() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
  });

  const [repeat, setRepeat] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  /* ---------- Validaciones de contraseña ---------- */
  const passwordValidations = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    special: /[!@#$%^&*]/.test(form.password),
  };
  const allValid = Object.values(passwordValidations).every(Boolean);

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!form.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    if (!form.apellido.trim()) newErrors.apellido = 'El apellido es obligatorio';
    if (!form.email.match(/^\S+@\S+\.\S+$/)) newErrors.email = 'Correo inválido';

    if (!form.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (!allValid) {
      newErrors.password = 'La contraseña no cumple los requisitos';
    }

    if (repeat !== form.password) newErrors.repeat = 'Las contraseñas no coinciden';

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const cleanData = {
        ...form,
        nombre: normalizeName(form.nombre),
        apellido: normalizeName(form.apellido),
      };

      await register(cleanData); // ⬅️  NO guardamos sesión ni tokens

      showToast('Registrado con éxito. Verificá tu email.', 'success');
      localStorage.setItem('emailRegistrado', form.email);
      navigate('/verify-sent', { state: { email: form.email } });
    } catch (err) {
      handleApiError(err, showToast, setErrors);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- Google ---------- */
  const startGoogle = () => {
    window.location = googleUrl();
  };

  /* ---------- Render ---------- */
  return (
    <form onSubmit={handleSubmit} className="auth-card" noValidate>
      <div style={{ position: 'relative' }}>
        <h2>Registrarse</h2>
        <AiOutlineInfoCircle
          className="info-icon"
          onClick={() => setShowInfo(!showInfo)}
        />
      </div>

      <div className={`info-box ${showInfo ? 'show' : ''}`}>
        Se deberá registrar al usuario según su respectivo email. El admin podrá
        modificar nombre y contraseña.
      </div>

      {/* Nombre */}
      <input
        id="register-nombre"
        name="nombre"
        type="text"
        placeholder="Nombre"
        autoComplete="given-name"
        value={form.nombre}
        onChange={(e) => {
          setForm({ ...form, nombre: e.target.value });
          if (errors.nombre) setErrors({ ...errors, nombre: '' });
        }}
      />
      {errors.nombre && <span className="field-error">{errors.nombre}</span>}

      {/* Apellido */}
      <input
        id="register-apellido"
        name="apellido"
        type="text"
        placeholder="Apellido"
        autoComplete="family-name"
        value={form.apellido}
        onChange={(e) => {
          setForm({ ...form, apellido: e.target.value });
          if (errors.apellido) setErrors({ ...errors, apellido: '' });
        }}
      />
      {errors.apellido && <span className="field-error">{errors.apellido}</span>}

      {/* Email */}
      <input
        id="register-email"
        name="email"
        type="email"
        placeholder="Correo electrónico"
        autoComplete="email"
        value={form.email}
        onChange={(e) => {
          setForm({ ...form, email: e.target.value });
          if (errors.email) setErrors({ ...errors, email: '' });
        }}
      />
      {errors.email && <span className="field-error">{errors.email}</span>}

      {/* Contraseña + toggle-eye */}
      <div className="password-wrapper register">
        <input
          id="register-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => {
            setForm({ ...form, password: e.target.value });
            if (errors.password) setErrors({ ...errors, password: '' });
          }}
        />
        <span
          className="toggle-eye"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        >
          {showPassword ? <BsEyeSlash /> : <BsEye />}
        </span>
      </div>
      {errors.password && <span className="field-error">{errors.password}</span>}

      {/* Reglas de contraseña */}
      <div className="password-rules" aria-live="polite">
        <p className={passwordValidations.length ? 'valid' : ''}>• Mínimo 8 caracteres</p>
        <p className={passwordValidations.upper ? 'valid' : ''}>• Al menos una mayúscula</p>
        <p className={passwordValidations.lower ? 'valid' : ''}>• Al menos una minúscula</p>
        <p className={passwordValidations.number ? 'valid' : ''}>• Al menos un número</p>
        <p className={passwordValidations.special ? 'valid' : ''}>• Al menos un símbolo (!@#$%)</p>
      </div>

      {/* Repetir contraseña */}
      <input
        id="register-repeat"
        name="repeat"
        type="password"
        placeholder="Repetir contraseña"
        autoComplete="new-password"
        value={repeat}
        onChange={(e) => {
          setRepeat(e.target.value);
          if (errors.repeat) setErrors({ ...errors, repeat: '' });
        }}
        style={{
          borderColor: repeat && repeat === form.password ? '#3cb371' : '#ccc',
        }}
      />
      {errors.repeat && <span className="field-error">{errors.repeat}</span>}

      {repeat && (
        <p
          className="match-status"
          style={{ color: repeat === form.password ? '#3cb371' : '#dc143c' }}
        >
          {repeat === form.password ? '✓ Coinciden' : '✗ No coinciden'}
        </p>
      )}

      {/* Botón submit */}
      <button type="submit" disabled={loading}>
        {loading ? 'Registrando…' : 'Registrarse'}
      </button>

      {/* Acciones extra */}
      <div className="actions">
        <button
          type="button"
          onClick={startGoogle}
          className="google-btn"
          aria-label="Registrarse con Google"
        >
          <FcGoogle size={20} /> Registrarse con Google
        </button>

        <a href="/login" className="link">
          ¿Ya tenés cuenta? Iniciá sesión
        </a>
      </div>
    </form>
  );
}