import { NavLink } from 'react-router-dom';
import { useState } from 'react';

export default function SideBar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* botón hamburguesa solo visible en móvil via CSS */}
      <button className="burger" onClick={() => setOpen(!open)}>☰</button>

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <nav>
          <NavLink to="/patients">Pacientes</NavLink>
          <NavLink to="/agenda">Agenda</NavLink>
        </nav>
      </aside>
    </>
  );
}
