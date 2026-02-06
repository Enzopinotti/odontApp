// src/features/agenda/pages/Agenda.js
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '../../../features/auth/hooks/useAuth';
import { FaCalendarPlus, FaCalendarAlt, FaSearch, FaSyncAlt } from 'react-icons/fa';
import BuscarTurnosModal from '../components/BuscarTurnosModal';
import DetallesTurnoModal from '../components/DetallesTurnoModal';
import AgendaDiaria from './AgendaDiaria';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import '../../../styles/agenda.scss';

export default function Agenda() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // CU-AG01.5: Verificar si el usuario es odontólogo
  const esOdontologo = useMemo(() => {
    return user?.Rol?.nombre?.toUpperCase() === 'ODONTÓLOGO';
  }, [user]);

  const [modalBusquedaAbierto, setModalBusquedaAbierto] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false);
  const [isRecargando, setIsRecargando] = useState(false);
  const [soloConDisponibilidad, setSoloConDisponibilidad] = useState(true); // Checkbox activado por defecto

  // Función para recargar todos los datos de la agenda
  const handleRecargar = async () => {
    setIsRecargando(true);
    try {
      // Invalidar todas las queries relacionadas con agenda
      await Promise.all([
        queryClient.invalidateQueries(['turnos']),
        queryClient.invalidateQueries(['agenda']),
        queryClient.invalidateQueries(['turnos-pendientes-concluidos']),
        queryClient.invalidateQueries(['slots-disponibles']),
        queryClient.invalidateQueries(['disponibilidades'])
      ]);
    } catch (error) {
      console.error('Error al recargar:', error);
    } finally {
      setIsRecargando(false);
    }
  };

  return (
    <div className="agenda-container">
      {/* Header con título y botones - estilo igual a Pacientes */}
      <header className="agenda-header">
        <div className="top-bar">
          <h2>Agenda</h2>
          <div className="header-actions">
            {/* CU-AG01.5: Solo recepcionista puede crear turnos */}
            {!esOdontologo && (
              <button
                className="btn-primary"
                onClick={() => navigate('/agenda/turnos/nuevo')}
              >
                <FaCalendarPlus />
                Nuevo turno
              </button>
            )}
            {/* CU-AG01.5: Solo recepcionista puede gestionar disponibilidades */}
            {!esOdontologo && (
              <button
                className="btn-secondary"
                onClick={() => navigate('/agenda/disponibilidades')}
              >
                <FaCalendarAlt />
                Gestionar disponibilidades
              </button>
            )}
            <button
              className="btn-secondary"
              onClick={() => setModalBusquedaAbierto(true)}
            >
              <FaSearch />
              Buscar turno
            </button>
            <button
              className="btn-secondary"
              onClick={handleRecargar}
              disabled={isRecargando}
            >
              <FaSyncAlt
                className={isRecargando ? 'rotating' : ''}
              />
              {isRecargando ? 'Recargando...' : 'Recargar'}
            </button>
          </div>
        </div>
      </header>

      {isRecargando && (
        <div className="pacientes-loader" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <Lottie animationData={loadingAnim} loop autoplay style={{ width: 180 }} />
          <p style={{ marginTop: '1rem', fontWeight: '850', color: '#145c63' }}>Actualizando agenda...</p>
        </div>
      )}

      {/* Agenda del día como contenido principal */}
      <AgendaDiaria soloConDisponibilidad={soloConDisponibilidad} setSoloConDisponibilidad={setSoloConDisponibilidad} />

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

