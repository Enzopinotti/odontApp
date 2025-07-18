import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
export default function SideBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* botón hamburguesa solo visible en móvil via CSS */}
      <button className="burger" onClick={() => setOpen(!open)}>☰</button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <nav>
          <NavLink to="/" className={({isActive})=>`navItem ${isActive ? 'active':''}`.trim()}> <FontAwesomeIcon icon="fa-solid fa-stethoscope" className='icon'/>Pacientes</NavLink>
          <NavLink to="/agenda"className={({isActive})=>`navItem ${isActive ? 'active':''}`.trim()}><FontAwesomeIcon icon="fa-solid fa-calendar-days" className='icon'/>Agenda</NavLink>
          <NavLink to="/facturacion"className={({isActive})=>`navItem ${isActive ? 'active':''}`.trim()} ><FontAwesomeIcon icon="fa-solid fa-file-invoice-dollar" className='icon'/>Facturación</NavLink>  
          <NavLink to="/recetas"className={({isActive})=>`navItem ${isActive ? 'active':''}`.trim()}><FontAwesomeIcon icon="fa-solid fa-prescription-bottle-medical" className='icon'/>Recetas</NavLink>  
          <NavLink to="/reportes"className={({isActive})=>`navItem ${isActive ? 'active':''}`.trim()}><FontAwesomeIcon icon="fa-solid fa-chart-pie" className='icon'/>Reportes</NavLink>  
          <NavLink to="/configuracion"className={({isActive})=>`navItem ${isActive ? 'active':''}`.trim()}><FontAwesomeIcon icon="fa-solid fa-gear"className='icon' />Configuración</NavLink>  
        </nav>
      </aside>
    </>
  );
}
