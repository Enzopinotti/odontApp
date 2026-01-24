// frontend/src/features/auth/pages/Profile.js
import { useEffect, useState } from 'react';
import { updateMe, uploadAvatar } from '../../../api/auth';
import useAuth from '../../auth/hooks/useAuth';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import {
  FaUser, FaCamera, FaShieldAlt, FaUserTag,
  FaEnvelope, FaPhone, FaCheckCircle, FaExclamationTriangle,
  FaSignOutAlt
} from 'react-icons/fa';

import SecuritySettings from '../../auth/pages/SecuritySettings';
import avatarDefecto from '../../../assets/img/avatarDefecto.webp';


export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({ nombre: '', apellido: '', telefono: '' });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tab, setTab] = useState('perfil'); // 'perfil' | 'seguridad'

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
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
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

  if (!user) return <div className="profile-page-loading">Cargando perfil...</div>;

  return (
    <div className="profile-pro-page">

      {/* 🧬 Sidebar de Perfil */}
      <aside className="profile-sidebar-pro">
        <div className="avatar-card-pro">
          <div className="avatar-wrapper-pro">
            <img
              src={avatarPreview || user?.avatarUrl || avatarDefecto}
              alt="Profile"
            />
            <label className="edit-overlay-pro">
              <FaCamera />
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
            {avatarPreview && (
              <button className="cancel-preview" onClick={removeSelectedAvatar}>✖</button>
            )}
          </div>
          <div className="user-meta-pro">
            <h3>{user.nombre} {user.apellido}</h3>
            <span className="role-badge-pro">
              <FaUserTag /> {user.Rol?.nombre || 'Usuario'}
            </span>
          </div>
        </div>

        <nav className="profile-nav-pro">
          <button className={tab === 'perfil' ? 'active' : ''} onClick={() => setTab('perfil')}>
            <FaUser /> Información Personal
          </button>
          <button className={tab === 'seguridad' ? 'active' : ''} onClick={() => setTab('seguridad')}>
            <FaShieldAlt /> Seguridad y Cuenta
          </button>
          <div className="nav-divider" />
          <button className="logout-btn-pro" onClick={logout}>
            <FaSignOutAlt /> Cerrar Sesión
          </button>
        </nav>
      </aside>

      {/* 🚀 Contenido Principal */}
      <main className="profile-content-pro">

        {tab === 'perfil' && (
          <form className="profile-form-pro" onSubmit={handleSubmit}>
            <header className="content-head">
              <h2>Información Personal</h2>
              <p>Gestioná tus datos básicos de contacto y perfil público.</p>
            </header>

            <div className="form-grid-pro">
              <div className="field-group">
                <label>Nombre</label>
                <div className="input-wrap">
                  <FaUser className="input-icon" />
                  <input name="nombre" value={form.nombre} onChange={handleChange} />
                </div>
                {errors.nombre && <span className="error-msg">{errors.nombre}</span>}
              </div>

              <div className="field-group">
                <label>Apellido</label>
                <div className="input-wrap">
                  <FaUser className="input-icon" />
                  <input name="apellido" value={form.apellido} onChange={handleChange} />
                </div>
                {errors.apellido && <span className="error-msg">{errors.apellido}</span>}
              </div>

              <div className="field-group full">
                <label>Correo Electrónico</label>
                <div className="input-wrap disabled">
                  <FaEnvelope className="input-icon" />
                  <input value={user.email} disabled />
                  <span className="locked-tag">No editable</span>
                </div>
              </div>

              <div className="field-group">
                <label>Teléfono</label>
                <div className="input-wrap">
                  <FaPhone className="input-icon" />
                  <input name="telefono" value={form.telefono} onChange={handleChange} />
                </div>
              </div>
            </div>

            <div className="form-footer-pro">
              <button type="submit" className="save-btn-pro" disabled={loading}>
                {loading ? 'Guardando...' : 'Actualizar Perfil'}
              </button>
              {user.avatarUrl && !avatarPreview && (
                <button type="button" className="remove-avatar-btn" onClick={removeCurrentAvatar}>
                  Eliminar Avatar
                </button>
              )}
            </div>
          </form>
        )}

        {tab === 'seguridad' && (
          <div className="security-view-pro">
            <header className="content-head">
              <h2>Seguridad y Autenticación</h2>
              <p>Protege tu cuenta con verificación en dos pasos y gestión de contraseñas.</p>
            </header>

            <div className="security-cards-pro">
              <div className="status-card-pro">
                <div className="status-icon-pro">
                  {user.twoFactorEnabled ? <FaCheckCircle className="ok" /> : <FaExclamationTriangle className="warn" />}
                </div>
                <div className="status-text-pro">
                  <h4>Doble Factor de Autenticación (2FA)</h4>
                  <p>{user.twoFactorEnabled ? 'Tu cuenta está protegida con seguridad adicional.' : 'Te recomendamos activar 2FA para mayor seguridad.'}</p>
                </div>
              </div>

              <div className="security-component-wrapper">
                <SecuritySettings />
              </div>
            </div>
          </div>
        )}


      </main>
    </div>
  );
}
