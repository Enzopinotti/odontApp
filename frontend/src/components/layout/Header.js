// src/components/layout/Header.jsx
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import avatarDefecto from '../../assets/img/avatarDefecto.webp';
import { FaBell, FaSignOutAlt } from 'react-icons/fa';
import { logout } from '../../api/auth';

export default function Header() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const esDoctor = user?.Rol?.nombre?.toLowerCase() === 'doctor';
  const nombreCompleto = `${esDoctor ? 'Dr. ' : ''}${user?.nombre || ''} ${user?.apellido || ''}`;

  const handleLogout = async () => {
    await logout();
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="user-info" onClick={() => navigate('/profile')}>
        <img
          className="avatar"
          src={user?.avatarUrl || avatarDefecto}
          alt="avatar"
        />
        <span className="name">{nombreCompleto}</span>
      </div>

      <div className="header-actions">
        <button className="icon-button" title="Notificaciones">
          <FaBell />
        </button>
        <button className="icon-button" title="Cerrar sesión" onClick={handleLogout}>
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}
