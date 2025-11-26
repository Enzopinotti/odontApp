// src/features/agenda/pages/Agenda.js
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTurnosPendientesConcluidos, useMarcarAsistencia } from '../hooks/useTurnos';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import { FaClock, FaUser, FaCalendarPlus, FaUserMd, FaArrowRight, FaCalendarAlt, FaCalendarDay, FaSearch } from 'react-icons/fa';
import BuscarTurnosModal from '../components/BuscarTurnosModal';
import '../../../styles/agenda.scss';

export default function Agenda() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [fecha] = useState(new Date().toISOString().split('T')[0]);
  const [modalBusquedaAbierto, setModalBusquedaAbierto] = useState(false);
  
  const { data: turnosData, isLoading } = useTurnosPendientesConcluidos(fecha);
  const turnos = useMemo(() => turnosData || [], [turnosData]);
  
  const marcarAsistencia = useMarcarAsistencia();

  // Calcular métricas
  const metricas = useMemo(() => {
    const pendientes = turnos.filter(t => t.estado === 'PENDIENTE');
    const enEspera = turnos.filter(t => t.estado === 'PENDIENTE' && new Date(t.fechaHora) <= new Date());
    
    // Calcular tiempo de espera estimado (simplificado)
    const tiempoEspera = enEspera.length * 15; // 15 min por paciente
    
    return {
      pendientes: pendientes.length,
      tiempoEspera: `${tiempoEspera}-${tiempoEspera + 10} min`,
      pacientesEnEspera: enEspera.length,
    };
  }, [turnos]);

  const handleAtenderSiguiente = async () => {
    const siguienteTurno = turnos.find(t => t.estado === 'PENDIENTE' && new Date(t.fechaHora) <= new Date());
    if (siguienteTurno) {
      try {
        await marcarAsistencia.mutateAsync({ id: siguienteTurno.id, nota: '' });
        showToast('Turno marcado como atendido', 'success');
        navigate(`/agenda/turnos/${siguienteTurno.id}`);
      } catch (error) {
        handleApiError(error, showToast);
      }
    } else {
      showToast('No hay turnos pendientes para atender', 'info');
    }
  };

  const handlePasarAConsulta = () => {
    const siguienteTurno = turnos.find(t => t.estado === 'PENDIENTE' && new Date(t.fechaHora) <= new Date());
    if (siguienteTurno) {
      // Navegar a detalles del turno (la consulta se maneja en otro módulo)
      navigate(`/agenda/diaria`);
      showToast('Seleccione el turno para iniciar la consulta', 'info');
    } else {
      showToast('No hay turnos pendientes', 'info');
    }
  };

  // Obtener pacientes únicos para mostrar en la lista
  const pacientesUnicos = useMemo(() => {
    const pacientesMap = new Map();
    turnos.forEach(turno => {
      if (turno.Paciente && !pacientesMap.has(turno.Paciente.id)) {
        pacientesMap.set(turno.Paciente.id, {
          ...turno.Paciente,
          turno: turno,
        });
      }
    });
    return Array.from(pacientesMap.values());
  }, [turnos]);

  // Última visita para cada paciente
  const ultimasVisitas = useMemo(() => {
    return pacientesUnicos.map(p => ({
      paciente: p,
      ultimaVisita: p.ultimaVisita || 'Nunca',
    }));
  }, [pacientesUnicos]);

  if (isLoading) {
    return <div className="agenda-loading">Cargando agenda...</div>;
  }

  return (
    <div className="agenda-container">
      <div className="agenda-header">
        <h1>Registrar turno</h1>
      </div>

      {/* Métricas */}
      <div className="agenda-metricas">
        <div className="metrica-card">
          <FaClock className="metrica-icon" />
          <div className="metrica-content">
            <div className="metrica-valor">{metricas.pendientes}</div>
            <div className="metrica-label">Pendientes</div>
          </div>
        </div>
        
        <div className="metrica-card">
          <FaClock className="metrica-icon" />
          <div className="metrica-content">
            <div className="metrica-valor">{metricas.tiempoEspera}</div>
            <div className="metrica-label">Tiempo de espera estimado</div>
          </div>
        </div>
        
        <div className="metrica-card">
          <FaUser className="metrica-icon" />
          <div className="metrica-content">
            <div className="metrica-valor">{metricas.pacientesEnEspera}</div>
            <div className="metrica-label">Pacientes en espera</div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="agenda-acciones">
        <button 
          className="accion-btn primary"
          onClick={() => navigate('/agenda/diaria')}
        >
          <FaCalendarDay /> Agenda del Día
        </button>
        <button 
          className="accion-btn primary"
          onClick={() => navigate('/agenda/turnos/nuevo')}
        >
          <FaCalendarPlus /> Nuevo turno
        </button>
        <button 
          className="accion-btn secondary"
          onClick={() => navigate('/agenda/disponibilidades')}
        >
          <FaCalendarAlt /> Gestionar disponibilidades
        </button>
        <button 
          className="accion-btn secondary"
          onClick={handlePasarAConsulta}
        >
          <FaUserMd /> Pasar a consulta
        </button>
        <button 
          className="accion-btn secondary"
          onClick={handleAtenderSiguiente}
        >
          <FaArrowRight /> Atender siguiente
        </button>
        <button 
          className="accion-btn secondary"
          onClick={() => setModalBusquedaAbierto(true)}
        >
          <FaSearch /> Buscar turno
        </button>
      </div>

      {/* Contenido principal */}
      <div className="agenda-content">
        {/* Lista de pacientes */}
        <div className="agenda-pacientes">
          <h2>Pacientes</h2>
          <div className="pacientes-list">
            {pacientesUnicos.length === 0 ? (
              <div className="empty-state">No hay pacientes registrados</div>
            ) : (
              pacientesUnicos.map(paciente => (
                <div key={paciente.id} className="paciente-card">
                  <div className="paciente-info">
                    <h3>{paciente.nombre} {paciente.apellido}</h3>
                    <p>DNI: {paciente.dni}</p>
                    {paciente.Contacto?.telefonoMovil && (
                      <p>Tel: {paciente.Contacto.telefonoMovil}</p>
                    )}
                    {paciente.Contacto?.Direccion && (
                      <p>
                        {paciente.Contacto.Direccion.calle} {paciente.Contacto.Direccion.numero}
                      </p>
                    )}
                  </div>
                  <div className="paciente-acciones">
                    <button 
                      onClick={() => navigate(`/pacientes/${paciente.id}/editar`)}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => navigate(`/pacientes/${paciente.id}`)}
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    <button 
                      onClick={() => navigate(`/pacientes/${paciente.id}/odontograma`)}
                      title="Ver odontograma"
                    >
                      🦷
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Últimas visitas */}
        <div className="agenda-ultimas-visitas">
          <h2>Última visita</h2>
          <div className="visitas-list">
            {ultimasVisitas.length === 0 ? (
              <div className="empty-state">No hay visitas registradas</div>
            ) : (
              ultimasVisitas.map(item => (
                <div key={item.paciente.id} className="visita-item">
                  <span className="visita-nombre">
                    {item.paciente.nombre} {item.paciente.apellido}
                  </span>
                  <span className="visita-fecha">{item.ultimaVisita}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      
      {/* Modal de búsqueda de turnos */}
      <BuscarTurnosModal
        isOpen={modalBusquedaAbierto}
        onClose={() => setModalBusquedaAbierto(false)}
        onTurnoClick={(turno) => {
          setModalBusquedaAbierto(false);
          navigate(`/agenda/diaria`);
          // Opcional: podrías pasar el turno como estado para abrirlo directamente
          showToast('Navegando a la agenda del día', 'info');
        }}
      />
    </div>
  );
}

