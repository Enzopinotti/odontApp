import { NavLink } from 'react-router-dom';
import { useState, useMemo } from 'react';
import useAuth from '../../features/auth/hooks/useAuth';
import {
  FaUser,
  FaCalendarAlt,
  FaUsers,
  FaFileInvoiceDollar,
  FaReceipt,
  FaChartBar,
  FaCog,
  FaUserShield
} from 'react-icons/fa';

export default function SideBar() {
  const [open, setOpen] = useState(false);
  const { hasPermiso, user } = useAuth();

  const isAdmin = useMemo(() => {
    const rolName = user?.Rol?.nombre?.toUpperCase() || '';
    return rolName === 'ADMIN' || rolName === 'ADMINISTRADOR';
  }, [user]);

  const isPaciente = useMemo(() => {
    const rolName = user?.Rol?.nombre?.toUpperCase() || '';
    return rolName === 'PACIENTE';
  }, [user]);

  const isOdontologo = useMemo(() => {
    const rolName = user?.Rol?.nombre?.toUpperCase() || '';
    return rolName === 'ODONTÓLOGO' || rolName === 'DENTISTA' || rolName === 'DOCTOR';
  }, [user]);

  return (
    <>
      <button className="burger" onClick={() => setOpen(true)} aria-label="Abrir menú">☰</button>

      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-placeholder">
            <FaUserShield /> <span>OdontApp</span>
          </div>
          <button className="close-sidebar" onClick={() => setOpen(false)} aria-label="Cerrar menú">×</button>
        </div>

        <nav onClick={() => setOpen(false)}>
          <div className="nav-section">
            <NavLink to="/" title="Inicio">
              <FaChartBar /> <span>Inicio</span>
            </NavLink>

            {(hasPermiso('pacientes', 'listar') || isAdmin) && (
              <NavLink to="/pacientes" title="Pacientes">
                <FaUsers /> <span>Pacientes</span>
              </NavLink>
            )}

            {(hasPermiso('agenda', 'ver') || isAdmin || isOdontologo) && (
              <NavLink to="/agenda" title="Agenda">
                <FaCalendarAlt /> <span>Agenda</span>
              </NavLink>
            )}

            {!isPaciente && (
              <>
                {(hasPermiso('facturacion', 'ver') || isAdmin) && (
                  <NavLink to="/facturacion" title="Facturación">
                    <FaFileInvoiceDollar /> <span>Facturación</span>
                  </NavLink>
                )}
                {(hasPermiso('recetas', 'ver') || isAdmin) && (
                  <NavLink to="/recetas" title="Recetas">
                    <FaReceipt /> <span>Recetas</span>
                  </NavLink>
                )}
                {(hasPermiso('reportes', 'ver') || isAdmin) && (
                  <NavLink to="/reportes" title="Reportes">
                    <FaChartBar /> <span>Reportes</span>
                  </NavLink>
                )}
              </>
            )}
          </div>

          <div className="nav-footer">
            {isAdmin && (
              <NavLink to="/admin" title="Administración del Sistema">
                <FaUserShield /> <span>Admin</span>
              </NavLink>
            )}

            <NavLink to="/profile" title="Perfil y configuración">
              <FaUser /> <span>Perfil</span>
            </NavLink>

            {(hasPermiso('configuracion', 'ver') || isAdmin) && (
              <NavLink to="/configuracion" title="Configuración">
                <FaCog /> <span>Configuración</span>
              </NavLink>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

