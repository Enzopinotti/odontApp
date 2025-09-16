import { useState } from 'react';
import { changePassword } from '../../../api/auth';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';

export default function ChangePassword() {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    actual: '',
    nueva: '',
    repetir: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const passwordValidations = {
    length: form.nueva.length >= 8,
    upper: /[A-Z]/.test(form.nueva),
    lower: /[a-z]/.test(form.nueva),
    number: /\d/.test(form.nueva),
    special: /[!@#$%^&*]/.test(form.nueva),
  };

  const allValid = Object.values(passwordValidations).every(Boolean);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.actual) newErrors.actual = 'Debés ingresar tu contraseña actual';
    if (!form.nueva) {
      newErrors.nueva = 'Ingresá una nueva contraseña';
    } else if (!allValid) {
      newErrors.nueva = 'La nueva contraseña no cumple los requisitos';
    }
    if (form.nueva !== form.repetir)
      newErrors.repetir = 'Las contraseñas no coinciden';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      await changePassword({ actual: form.actual, nueva: form.nueva });
      showToast('Contraseña actualizada con éxito', 'success');
      setForm({ actual: '', nueva: '', repetir: '' });
    } catch (err) {
      handleApiError(err, showToast, setErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      <h2>Cambiar contraseña</h2>

      <input
        type="password"
        name="actual"
        placeholder="Contraseña actual"
        value={form.actual}
        onChange={handleChange}
      />
      {errors.actual && <span className="field-error">{errors.actual}</span>}

      <input
        type="password"
        name="nueva"
        placeholder="Nueva contraseña"
        value={form.nueva}
        onChange={handleChange}
      />
      {errors.nueva && <span className="field-error">{errors.nueva}</span>}

      <div className="password-rules">
        <p className={passwordValidations.length ? 'valid' : ''}>• Mínimo 8 caracteres</p>
        <p className={passwordValidations.upper ? 'valid' : ''}>• Al menos una mayúscula</p>
        <p className={passwordValidations.lower ? 'valid' : ''}>• Al menos una minúscula</p>
        <p className={passwordValidations.number ? 'valid' : ''}>• Al menos un número</p>
        <p className={passwordValidations.special ? 'valid' : ''}>• Al menos un símbolo (!@#$%)</p>
      </div>

      <input
        type="password"
        name="repetir"
        placeholder="Repetir nueva contraseña"
        value={form.repetir}
        onChange={handleChange}
        style={{
          borderColor: form.nueva && form.repetir === form.nueva ? '#3cb371' : '#ccc',
        }}
      />
      {errors.repetir && <span className="field-error">{errors.repetir}</span>}

      {form.repetir && (
        <p
          className="match-status"
          style={{
            color: form.repetir === form.nueva ? '#3cb371' : '#dc143c',
          }}
        >
          {form.repetir === form.nueva ? '✓ Coinciden' : '✗ No coinciden'}
        </p>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </form>
  );
}
