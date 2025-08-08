import { useEffect, useState } from 'react';
import { updateMe, uploadAvatar } from '../api/auth';
import useAuth from '../hooks/useAuth';
import useToast from '../hooks/useToast';
import { handleApiError } from '../utils/handleApiError';
import { FaUser, FaLock, FaCamera } from 'react-icons/fa';
import SecuritySettings from './SecuritySettings';
import avatarDefecto from '../assets/img/avatarDefecto.webp';

export default function Profile() {
  const { user, setUser } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
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
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedAvatar = () => {
    setAvatar(null);
    setAvatarPreview(null);
  };

  const removeCurrentAvatar = async () => {
    setLoading(true);
    try {
      const { data } = await updateMe({ avatarUrl: null });
      setUser(data.data);
      showToast('Avatar eliminado', 'success');
    } catch (err) {
      handleApiError(err, showToast);
    } finally {
      setLoading(false);
    }
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
      setAvatar(null);
      setAvatarPreview(null);
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
        <button className={tab === 'perfil' ? 'active' : ''} onClick={() => setTab('perfil')}>
          <FaUser /> Perfil
        </button>
        <button className={tab === 'seguridad' ? 'active' : ''} onClick={() => setTab('seguridad')}>
          <FaLock /> Seguridad
        </button>
      </div>

      {tab === 'perfil' && (
        <form onSubmit={handleSubmit} className="profile-form">
          <h2>Mi Perfil</h2>

          <div className="avatar-section">
            <div className="avatar-wrapper">
              <img
                className="profile-avatar"
                src={avatarPreview || user?.avatarUrl || avatarDefecto}
                alt="avatar"
              />

              {avatarPreview && (
                <button
                  type="button"
                  className="avatar-cancel-btn"
                  onClick={removeSelectedAvatar}
                  title='Eliminar avatar seleccionado'
                  aria-label="Cancelar imagen seleccionada"
                >
                  ✖
                </button>
              )}

              <label className="avatar-overlay">
                <FaCamera />
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>

            {user?.avatarUrl && !avatarPreview && (
              <button type="button" className="remove-avatar" onClick={removeCurrentAvatar}>
                Quitar avatar
              </button>
            )}
          </div>

          <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} />
          {errors.nombre && <span className="field-error">{errors.nombre}</span>}

          <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} />
          {errors.apellido && <span className="field-error">{errors.apellido}</span>}

          <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
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
