// src/pages/Profile.js
import { useEffect, useState } from 'react';
import { updateMe, uploadAvatar } from '../api/auth';
import useAuth from '../hooks/useAuth';
import showToast from '../hooks/useToast';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '' });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

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
      showToast(err.response?.data?.message || 'Error al actualizar el perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <p className="loading-text">Cargando perfil...</p>;

  return (
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

      <input
        name="apellido"
        placeholder="Apellido"
        value={form.apellido}
        onChange={handleChange}
      />

      <input
        name="telefono"
        placeholder="Teléfono"
        value={form.telefono}
        onChange={handleChange}
      />

      <button type="submit" disabled={loading}>
        {loading ? 'Actualizando...' : 'Guardar cambios'}
      </button>
    </form>
  );
}
