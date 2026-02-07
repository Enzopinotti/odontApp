import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react'; // Agregamos useEffect para debug
import useAuth from '../../features/auth/hooks/useAuth';
import {
  FaUser,
  FaCalendarAlt,
  FaUsers,
  FaCashRegister,      
  FaReceipt,
  FaChartBar,
  FaCog,
  FaUserShield
} from 'react-icons/fa';

export default function SideBar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  // --- DEBUGGING ---
  // Mira la consola del navegador (F12) para ver qué está llegando
  useEffect(() => {
    if (user) {
      console.log("🔍 USUARIO LOGUEADO:", user);
      console.log("🔍 ROL DETECTADO:", user?.Rol?.nombre);
    }
  }, [user]);

  // --- NORMALIZACIÓN DE ROLES ---
  // 1. Obtenemos el nombre
  const rolRaw = user?.Rol?.nombre || '';
  
  // 2. Normalizamos: Mayúsculas y SIN TILDES (Á -> A, Ó -> O)
  // Esto arregla el problema de "ODONTÓLOGO" vs "ODONTOLOGO"
  const rol = rolRaw.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // --- DEFINICIÓN DE ROLES ---
  const isPaciente = rol === 'PACIENTE';
  const isAdmin = rol === 'ADMIN' || rol === 'ADMINISTRADOR';
  const isRecepcion = rol === 'RECEPCIONISTA' || rol === 'SECRETARIA'; // Por si acaso
  const isOdontologo = rol === 'ODONTOLOGO' || rol === 'DENTISTA' || rol === 'PROFESIONAL';

  // --- GRUPOS DE PERMISOS ---
  // Staff = Cualquier rol que NO sea paciente
  const isStaff = isAdmin || isRecepcion || isOdontologo;

  return (
    <>
      <button className="burger" onClick={() => setOpen(!open)}>☰</button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <nav>
          <div className="nav-section">
            
            {/* 1. PACIENTES */}
            {isStaff && (
              <NavLink to="/pacientes" title="Pacientes">
                <FaUsers /> <span>Pacientes</span>
              </NavLink>
            )}

            {/* 2. AGENDA (Visible para todos) */}
            <NavLink to="/agenda" title="Agenda">
              <FaCalendarAlt /> <span>Agenda</span>
            </NavLink>

            {/* 3. FINANZAS */}
            {isStaff && (
              <NavLink to="/finanzas" title="Gestión Financiera">
                <FaCashRegister />
                <span>Caja y Facturación</span>
              </NavLink>
            )}

            {/* 4. EXTRAS */}
            {isStaff && (
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