// src/pages/ChangePassword.js
import { useState } from 'react';
import { changePassword } from '../api/auth';
import showToast from '../hooks/useToast';

export default function ChangePassword() {
  const [form, setForm] = useState({
    actual: '',
    nueva: '',
    repetir: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.actual || !form.nueva || !form.repetir) {
      return showToast('Completá todos los campos', 'error');
    }

    if (form.nueva.length < 6) {
      return showToast('La nueva contraseña es muy corta', 'error');
    }

    if (form.nueva !== form.repetir) {
      return showToast('Las contraseñas no coinciden', 'error');
    }

    setLoading(true);
    try {
      await changePassword({ actual: form.actual, nueva: form.nueva });
      showToast('Contraseña actualizada con éxito', 'success');
      setForm({ actual: '', nueva: '', repetir: '' });
    } catch (err) {
      showToast(err.response?.data?.message || 'Error al cambiar la contraseña', 'error');
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

      <input
        type="password"
        name="nueva"
        placeholder="Nueva contraseña"
        value={form.nueva}
        onChange={handleChange}
      />

      <input
        type="password"
        name="repetir"
        placeholder="Repetir nueva contraseña"
        value={form.repetir}
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar nueva contraseña'}
      </button>
    </form>
  );
}
