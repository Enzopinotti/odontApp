import { NavLink } from 'react-router-dom';
import { useState, useMemo } from 'react';
import useAuth from '../../features/auth/hooks/useAuth';
import {
  FaUser,
  FaCalendarAlt,
  FaUsers,
  FaFileInvoiceDollar, // ✅ Icono para Facturación
  FaCashRegister,      
  FaReceipt,
  FaChartBar,
  FaCog,
  FaUserShield
} from 'react-icons/fa';

export default function SideBar() {
  const [open, setOpen] = useState(false);
  const { hasPermiso, user } = useAuth();

  // --- Roles Helpers ---
  const isAdmin = useMemo(() => {
    const rolName = user?.Rol?.nombre?.toUpperCase() || '';
    return rolName === 'ADMIN' || rolName === 'ADMINISTRADOR';
  }, [user]);

  const isPaciente = useMemo(() => {
    const rolName = user?.Rol?.nombre?.toUpperCase() || '';
    return rolName === 'PACIENTE';
  }, [user]);

  const isRecepcionista = useMemo(() => {
    const rolName = user?.Rol?.nombre?.toUpperCase() || '';
    return rolName === 'RECEPCIONISTA' || rolName === 'RECEPCION';
  }, [user]);

  const isOdontologo = useMemo(() => {
    const rolName = user?.Rol?.nombre?.toUpperCase() || '';
    return rolName === 'ODONTOLOGO' || rolName === 'PROFESIONAL';
  }, [user]);

  // Helper para saber si tiene acceso a Caja (específico para cobros)
  const canAccessCaja = isAdmin || isRecepcionista || hasPermiso('facturacion', 'cobrar');

  // Helper para acceso general al módulo de finanzas (Dashboard)
  // Admin, Recepción y Odontólogos pueden ver el dashboard (aunque el odontólogo tenga acciones limitadas)
  const canAccessFinanzas = isAdmin || isRecepcionista || isOdontologo;

  return (
    <>
      <button className="burger" onClick={() => setOpen(!open)}>☰</button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <nav>
          <div className="nav-section">
            
            {/* Pacientes: Visible para todos menos pacientes */}
            {!isPaciente && (
              <NavLink to="/pacientes" title="Pacientes">
                <FaUsers /> <span>Pacientes</span>
              </NavLink>
            )}

            {/* Agenda: Visible para todos */}
            <NavLink to="/agenda" title="Agenda">
              <FaCalendarAlt /> <span>Agenda</span>
            </NavLink>

            {/* --- MÓDULO FINANZAS (NUEVO) --- */}
            {canAccessFinanzas && (
              <NavLink to="/finanzas" title="Facturación y Presupuestos">
                <FaFileInvoiceDollar /> <span>Facturación y Presupuestos</span>
              </NavLink>
            )}

            {/* --- CAJA (Opcional: Si quieres mantener el acceso directo a la caja diaria) --- */}
            {/* Si prefieres que todo entre por "Facturación", puedes quitar esto */}
            {canAccessCaja && (
              <NavLink to="/finanzas/caja" title="Caja Diaria">
                <FaCashRegister /> <span>Caja Diaria</span>
              </NavLink>
            )}

            {/* --- OTROS MÓDULOS --- */}
            {!isPaciente && (
              <>
                <NavLink to="/recetas" title="Recetas">
                  <FaReceipt /> <span>Recetas</span>
                </NavLink>

                <NavLink to="/reportes" title="Reportes">
                  <FaChartBar /> <span>Reportes</span>
                </NavLink>
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
            
            <NavLink to="/configuracion" title="Configuración">
              <FaCog /> <span>Configuración</span>
            </NavLink>
          </div>
        </nav>
      </aside>
    </>
  );
}