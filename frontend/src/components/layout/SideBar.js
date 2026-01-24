import { NavLink } from 'react-router-dom';
import { useState } from 'react';
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
  const { hasPermiso } = useAuth();

  return (
    <>
      <button className="burger" onClick={() => setOpen(!open)}>☰</button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <nav>
          <div className="nav-section">
            <NavLink to="/pacientes" title="Pacientes">
              <FaUsers /> <span>Pacientes</span>
            </NavLink>
            <NavLink to="/agenda" title="Agenda">
              <FaCalendarAlt /> <span>Agenda</span>
            </NavLink>
            <NavLink to="/facturacion" title="Facturación">
              <FaFileInvoiceDollar /> <span>Facturación</span>
            </NavLink>
            <NavLink to="/recetas" title="Recetas">
              <FaReceipt /> <span>Recetas</span>
            </NavLink>
            <NavLink to="/reportes" title="Reportes">
              <FaChartBar /> <span>Reportes</span>
            </NavLink>
          </div>

          <div className="nav-footer">
            {hasPermiso('usuarios', 'listar') && (
              <NavLink to="/admin" title="Administración del Sistema">
                <FaUserShield /> <span>Admin</span>
              </NavLink>
            )}

            <NavLink to="/profile" title="Perfil y configuración">
              <FaUser /> <span>Perfil</span>
            </NavLink>
            <NavLink to="/configuracion" title="Configuración">
              <FaCog /> <span>Configuración</span>
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}

