// src/features/agenda/pages/Agenda.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../features/auth/hooks/useAuth';
import { FaCalendarPlus, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import BuscarTurnosModal from '../components/BuscarTurnosModal';
import DetallesTurnoModal from '../components/DetallesTurnoModal';
import AgendaDiaria from './AgendaDiaria';
import '../../../styles/agenda.scss';

export default function Agenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // CU-AG01.5: Verificar si el usuario es odontólogo
  const esOdontologo = user?.rol?.id === 2 || user?.RolId === 2 || user?.rol?.nombre === 'Odontólogo';
  
  const [modalBusquedaAbierto, setModalBusquedaAbierto] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);

  return (
    <div className="agenda-container">
      {/* Header con título y botones - estilo igual a Pacientes */}
      <header className="agenda-header">
        <div className="top-bar">
          <h2>Agenda</h2>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* CU-AG01.5: Solo recepcionista puede crear turnos */}
            {!esOdontologo && (
              <button 
                className="btn-primary"
                onClick={() => navigate('/agenda/turnos/nuevo')}
              >
                <FaCalendarPlus style={{ marginRight: '0.5rem' }} />
                Nuevo turno
              </button>
            )}
            {/* CU-AG01.5: Solo recepcionista puede gestionar disponibilidades */}
            {!esOdontologo && (
              <button 
                className="btn-secondary"
                onClick={() => navigate('/agenda/disponibilidades')}
              >
                <FaCalendarAlt style={{ marginRight: '0.5rem' }} />
                Gestionar disponibilidades
              </button>
            )}
            <button 
              className="btn-secondary"
              onClick={() => setModalBusquedaAbierto(true)}
            >
              <FaSearch style={{ marginRight: '0.5rem' }} />
              Buscar turno
            </button>
          </div>
        </div>
      </header>

      {/* Agenda del día como contenido principal */}
      <AgendaDiaria />
      
      {/* Modal de búsqueda de turnos */}
      <BuscarTurnosModal
        isOpen={modalBusquedaAbierto}
        onClose={() => setModalBusquedaAbierto(false)}
        onTurnoClick={(turno) => {
          setTurnoSeleccionado(turno);
          setModalBusquedaAbierto(false);
          setModalDetallesAbierto(true);
        }}
      />
      
      {/* Modal de detalles del turno */}
      {modalDetallesAbierto && turnoSeleccionado && (
        <DetallesTurnoModal
          turno={turnoSeleccionado}
          onClose={() => {
            setModalDetallesAbierto(false);
            setTurnoSeleccionado(null);
          }}
          onSuccess={() => {
            setModalDetallesAbierto(false);
            setTurnoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
}

