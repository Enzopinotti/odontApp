import { useEffect, useState } from 'react';
import { updateMe, uploadAvatar } from '../api/auth';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { handleApiError } from '../utils/handleApiError';
import { FaUser, FaLock } from 'react-icons/fa';
import SecuritySettings from './SecuritySettings';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '' });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState('perfil');

  useEffect(() => {
    if (user) {
      setForm({
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        telefono: user.telefono || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleAvatarChange = (e) => {
    if (e.target.files?.[0]) setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates = { ...form };
      if (avatar) {
        const { data } = await uploadAvatar(avatar);
        updates.avatarUrl = data.data.avatarUrl;
      }

      const { data } = await updateMe(updates);
      setUser(data.data);
      showToast('Perfil actualizado con éxito', 'success');
    } catch (err) {
      handleApiError(err, showToast, setErrors);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="loading-text">Cargando perfil...</p>;

  return (
    <div className="auth-card">
      <div className="tabs">
        <button
          className={tab === 'perfil' ? 'active' : ''}
          onClick={() => setTab('perfil')}
        >
          <FaUser /> Perfil
        </button>
        <button
          className={tab === 'seguridad' ? 'active' : ''}
          onClick={() => setTab('seguridad')}
        >
          <FaLock /> Seguridad
        </button>
      </div>

      {tab === 'perfil' && (
        <form onSubmit={handleSubmit} className="profile-form">
          <h2>Mi Perfil</h2>

          <div className="avatar-section">
            <img
              src={user.avatarUrl || '/assets/user.png'}
              alt="avatar"
              className="profile-avatar"
            />
            <label>
              Cambiar foto:
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
          </div>

          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
          />
          {errors.nombre && <span className="field-error">{errors.nombre}</span>}

          <input
            name="apellido"
            placeholder="Apellido"
            value={form.apellido}
            onChange={handleChange}
          />
          {errors.apellido && <span className="field-error">{errors.apellido}</span>}

          <input
            name="telefono"
            placeholder="Teléfono"
            value={form.telefono}
            onChange={handleChange}
          />
          {errors.telefono && <span className="field-error">{errors.telefono}</span>}

          <button type="submit" disabled={loading}>
            {loading ? 'Actualizando...' : 'Guardar cambios'}
          </button>
        </form>
      )}

      {tab === 'seguridad' && <SecuritySettings />}
    </div>
  );
}
