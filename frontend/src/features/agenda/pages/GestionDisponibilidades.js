// src/features/agenda/pages/GestionDisponibilidades.js
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import { useTurnosPorFecha } from '../hooks/useTurnos';
import DisponibilidadModal from '../components/DisponibilidadModal';
import DisponibilidadRecurrenteModal from '../components/DisponibilidadRecurrenteModal';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaSyncAlt, FaCalendarCheck } from 'react-icons/fa';
import '../../../styles/disponibilidades.scss';

// Función helper para formatear fecha YYYY-MM-DD
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

// Función helper para formatear fecha legible
const formatDateReadable = (date) => {
  const formatted = date.toLocaleDateString('es-AR', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  // Capitalizar primera letra
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Función helper para día anterior
const getPreviousDay = (date) => {
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  return prevDay;
};

// Función helper para día siguiente
const getNextDay = (date) => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay;
};

// Generar array de horas del día (7:00 a 21:00)
const HORAS_DIA = Array.from({ length: 15 }, (_, i) => {
  const hora = 7 + i;
  return `${hora.toString().padStart(2, '0')}:00`;
});

export default function GestionDisponibilidades() {
  const navigate = useNavigate();
  
  // Estado para el día actual (solo vista diaria)
  const [diaActual, setDiaActual] = useState(new Date());
  
  // Estado para modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [disponibilidadSeleccionada, setDisponibilidadSeleccionada] = useState(null);
  
  // Estado para modal de disponibilidades recurrentes
  const [modalRecurrenteAbierto, setModalRecurrenteAbierto] = useState(false);
  
  // Calcular fecha actual para la query (solo diaria)
  const fechaActual = useMemo(() => formatDate(diaActual), [diaActual]);
  const fechaInicio = fechaActual;
  const fechaFin = fechaActual;
  
  // Cargar odontólogos
  const { data: odontologos, isLoading: loadingOdontologos } = useOdontologosPorEspecialidad();
  
  // Cargar disponibilidades del día actual
  const { data: disponibilidades, isLoading: loadingDisponibilidades, refetch, isFetching } = useDisponibilidadesSemanal(fechaInicio, fechaFin);
  
  // Cargar turnos del día actual
  const { data: turnosData, isLoading: loadingTurnos } = useTurnosPorFecha(
    fechaActual, 
    null // odontologoId - null para todos
  );
  const turnos = useMemo(() => {
    if (!turnosData) return [];
    return Array.isArray(turnosData) ? turnosData : (turnosData.data || []);
  }, [turnosData]);
  
  // Navegar días
  const irDiaSiguiente = () => {
    setDiaActual(getNextDay(diaActual));
  };
  
  const irDiaAnterior = () => {
    setDiaActual(getPreviousDay(diaActual));
  };
  
  const irHoy = () => {
    setDiaActual(new Date());
  };
  
  // Agrupar disponibilidades por odontólogo (vista diaria)
  const disponibilidadesPorOdontologo = useMemo(() => {
    if (!disponibilidades || !Array.isArray(disponibilidades)) return {};
    
    return disponibilidades.reduce((acc, disp) => {
      const key = `${disp.odontologoId}-${fechaActual}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(disp);
      return acc;
    }, {});
  }, [disponibilidades, fechaActual]);
  
  // Handler para click en celda vacía
  const handleClickCelda = (odontologoId, hora) => {
    setDisponibilidadSeleccionada({
      odontologoId,
      fecha: fechaActual,
      horaInicio: hora,
      horaFin: `${(parseInt(hora.split(':')[0]) + 1).toString().padStart(2, '0')}:00`,
      tipo: 'LABORAL'
    });
    setModalAbierto(true);
  };
  
  // Handler para click en bloque existente
  const handleClickBloque = (disponibilidad) => {
    setDisponibilidadSeleccionada(disponibilidad);
    setModalAbierto(true);
  };
  
  // Función para normalizar hora (quitar segundos)
  const normalizeTime = (time) => {
    if (!time) return '';
    return time.substring(0, 5); // '07:00:00' -> '07:00'
  };

  // Función para calcular si una hora está dentro de un rango
  const isHourInRange = (hora, horaInicio, horaFin) => {
    const horaInt = parseInt(hora.replace(':', ''));
    const inicioInt = parseInt(normalizeTime(horaInicio).replace(':', ''));
    const finInt = parseInt(normalizeTime(horaFin).replace(':', ''));
    return horaInt >= inicioInt && horaInt < finInt;
  };

  // CU-AG02: Función para obtener turno en una hora específica (vista diaria)
  const obtenerTurnoEnHora = (odontologoId, hora) => {
    if (!turnos || turnos.length === 0) return null;
    
    const turnosOdontologo = turnos.filter(t => t.odontologoId === odontologoId);
    const horaInt = parseInt(hora.replace(':', ''));
    
    for (const turno of turnosOdontologo) {
      const fechaTurno = new Date(turno.fechaHora);
      const turnoHora = fechaTurno.getHours();
      const turnoFin = new Date(fechaTurno.getTime() + (turno.duracion || 30) * 60000);
      const turnoHoraFin = turnoFin.getHours() + (turnoFin.getMinutes() > 0 ? 1 : 0);
      
      if (horaInt >= turnoHora && horaInt < turnoHoraFin) {
        return turno;
      }
    }
    
    return null;
  };


  // CU-AG02: Función para calcular altura de turno en celdas
  const calcularAlturaTurno = (turno) => {
    const duracionHoras = (turno.duracion || 30) / 60;
    return Math.max(1, Math.ceil(duracionHoras));
  };
  
  // Calcular altura de bloque en celdas
  const calcularAlturaCeldas = (horaInicio, horaFin) => {
    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);
    const horas = (fin - inicio) / (1000 * 60 * 60);
    return horas;
  };

  // Función para renderizar una celda (vista diaria)
  const renderizarCelda = (odontologo, hora, disponibilidadesOdontologo) => {
    // CU-AG02: Verificar si hay un turno en esta hora
    const turnoEnHora = obtenerTurnoEnHora(odontologo.userId, hora);
    const esInicioTurno = turnoEnHora && (() => {
      const fechaTurno = new Date(turnoEnHora.fechaHora);
      const turnoHora = fechaTurno.getHours();
      return parseInt(hora.replace(':', '')) === turnoHora;
    })();
    
    // Verificar si esta hora es el INICIO de alguna disponibilidad
    const bloqueQueInicia = disponibilidadesOdontologo.find((disp) => {
      return normalizeTime(disp.horaInicio) === hora;
    });
    
    // Verificar si esta hora está DENTRO de alguna disponibilidad (pero no es el inicio)
    const dentroDeBloqueExistente = disponibilidadesOdontologo.some((disp) => {
      const inicioNormalizado = normalizeTime(disp.horaInicio);
      return inicioNormalizado !== hora && isHourInRange(hora, disp.horaInicio, disp.horaFin);
    });
    
    // CU-AG02: Si hay un turno que inicia aquí, renderizarlo en azul
    if (esInicioTurno && turnoEnHora) {
      const alturaCeldas = calcularAlturaTurno(turnoEnHora);
      const fechaTurno = new Date(turnoEnHora.fechaHora);
      const horaInicioStr = `${fechaTurno.getHours().toString().padStart(2, '0')}:${fechaTurno.getMinutes().toString().padStart(2, '0')}`;
      const horaFinTurno = new Date(fechaTurno.getTime() + (turnoEnHora.duracion || 30) * 60000);
      const horaFinStr = `${horaFinTurno.getHours().toString().padStart(2, '0')}:${horaFinTurno.getMinutes().toString().padStart(2, '0')}`;
      
      return (
        <div 
          key={`${odontologo.userId}-${fechaActual}-${hora}-turno`} 
          className="celda-hora celda-con-turno"
          style={{ position: 'relative' }}
        >
          <div 
            className="turno-bloque"
            style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              right: '2px',
              height: `calc(${alturaCeldas * 60}px - 4px)`,
              zIndex: 6,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              border: '2px solid #1e40af',
              borderRadius: '4px',
              color: 'white',
              padding: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/agenda/turnos/${turnoEnHora.id}`);
            }}
            title={`Turno: ${turnoEnHora.Paciente?.nombre} ${turnoEnHora.Paciente?.apellido} - ${horaInicioStr} a ${horaFinStr}`}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
              <FaCalendarCheck style={{ marginRight: '4px' }} />
              {horaInicioStr} - {horaFinStr}
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.9 }}>
              {turnoEnHora.Paciente?.nombre} {turnoEnHora.Paciente?.apellido}
            </div>
            {turnoEnHora.motivo && (
              <div style={{ fontSize: '0.65rem', opacity: 0.8, marginTop: '2px' }}>
                {turnoEnHora.motivo}
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Si hay un bloque que inicia aquí, renderizarlo
    if (bloqueQueInicia) {
      const alturaCeldas = calcularAlturaCeldas(bloqueQueInicia.horaInicio, bloqueQueInicia.horaFin);
      const className = bloqueQueInicia.tipo === 'LABORAL' ? 'bloque-laboral' : 'bloque-nolaboral';
      
      return (
        <div 
          key={`${odontologo.userId}-${fechaActual}-${hora}`} 
          className="celda-hora celda-con-bloque"
          style={{ position: 'relative' }}
        >
          <div 
            className={`disponibilidad-bloque ${className}`}
            style={{
              position: 'absolute',
              top: '2px',
              left: '2px',
              right: '2px',
              height: `calc(${alturaCeldas * 60}px - 4px)`,
              zIndex: 5,
            }}
            onClick={(e) => {
              e.stopPropagation();
              handleClickBloque(bloqueQueInicia);
            }}
            title={`${normalizeTime(bloqueQueInicia.horaInicio)} - ${normalizeTime(bloqueQueInicia.horaFin)}${bloqueQueInicia.motivo ? ` - ${bloqueQueInicia.motivo}` : ''}`}
          >
            <div className="bloque-info">
              <div className="bloque-hora" style={{ fontSize: '0.85rem' }}>
                {normalizeTime(bloqueQueInicia.horaInicio)} - {normalizeTime(bloqueQueInicia.horaFin)}
              </div>
              <div className="bloque-tipo" style={{ fontSize: '0.75rem' }}>
                {bloqueQueInicia.tipo === 'LABORAL' ? '✓ Disponible' : '✕ No Disponible'}
              </div>
              {bloqueQueInicia.motivo && (
                <div className="bloque-motivo" style={{ fontSize: '0.7rem' }}>{bloqueQueInicia.motivo}</div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    // CU-AG02: Si está dentro de un turno (pero no es el inicio), mostrar celda ocupada por turno
    if (turnoEnHora && !esInicioTurno) {
      return (
        <div 
          key={`${odontologo.userId}-${fechaActual}-${hora}-turno-ocupado`} 
          className="celda-hora celda-ocupada-turno"
          style={{
            background: 'rgba(59, 130, 246, 0.3)',
            border: '1px dashed #3b82f6'
          }}
        >
          {/* Celda ocupada por turno que empezó antes */}
        </div>
      );
    }
    
    // Si está dentro de un bloque existente, mostrar celda ocupada (sin icono)
    if (dentroDeBloqueExistente) {
      return (
        <div 
          key={`${odontologo.userId}-${fechaActual}-${hora}`} 
          className="celda-hora celda-ocupada"
        >
          {/* Celda ocupada por bloque que empezó antes */}
        </div>
      );
    }
    
    // Celda vacía normal
    return (
      <div 
        key={`${odontologo.userId}-${fechaActual}-${hora}`} 
        className="celda-hora"
        onClick={() => handleClickCelda(odontologo.userId, hora)}
      >
        <div className="celda-vacia">
          <FaPlus className="icon-add" />
        </div>
      </div>
    );
  };
  
  if (loadingOdontologos || loadingDisponibilidades || loadingTurnos) {
    return <div className="loading-container">Cargando disponibilidades y turnos...</div>;
  }
  
  return (
    <div className="gestion-disponibilidades-container">
      {/* Header */}
      <div className="disponibilidades-header">
        <h1>Gestión de Disponibilidades</h1>
        <div className="header-actions">
          <button 
            className="btn-recargar" 
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <FaSyncAlt className={isFetching ? 'rotating' : ''} /> 
            {isFetching ? 'Recargando...' : 'Recargar'}
          </button>
          <button className="btn-volver" onClick={() => navigate('/agenda')}>
            Volver a Agenda
          </button>
        </div>
      </div>
      
      {/* Controles de navegación diaria y botón de disponibilidades recurrentes */}
      <div className="semana-controles">
        <button 
          className="btn-nav btn-recurrente"
          onClick={() => setModalRecurrenteAbierto(true)}
        >
          <FaCalendarCheck />
          Agregar Disponibilidad Recurrente
        </button>
        
        <div className="semana-info">
          <FaCalendarAlt />
          <span>
            {formatDateReadable(diaActual)}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn-nav" onClick={irDiaAnterior}>
            <FaChevronLeft /> Día Anterior
          </button>
          
          <button className="btn-hoy" onClick={irHoy}>
            Hoy
          </button>
          
          <button className="btn-nav" onClick={irDiaSiguiente}>
            Día Siguiente <FaChevronRight />
          </button>
        </div>
      </div>
      
      {/* Calendario */}
      <div className="calendario-container">
        {/* Encabezado con odontólogos */}
        <div className="calendario-header" style={{ 
          display: 'grid', 
          gridTemplateColumns: `80px repeat(${odontologos?.length || 1}, 1fr)`
        }}>
          <div className="columna-horas">
            <div className="header-cell">Horario</div>
          </div>
          
          {odontologos && odontologos.length > 0 ? (
            odontologos.map((odontologo) => (
              <div key={odontologo.userId} className="columna-odontologo">
                <div className="header-cell odontologo-info">
                  <div className="odontologo-nombre">
                    Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                  </div>
                  <div className="odontologo-matricula">Mat. {odontologo.matricula}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-odontologos">No hay odontólogos disponibles</div>
          )}
        </div>
        
        {/* Grid del calendario */}
        <div className="calendario-grid" style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${odontologos?.length || 1}, 1fr)`
        }}>
          {/* Columna de horas */}
          <div className="columna-horas">
            {HORAS_DIA.map((hora) => (
              <div key={hora} className="hora-cell">
                {hora}
              </div>
            ))}
          </div>
          
          {/* Vista diaria: una columna por odontólogo */}
          {odontologos?.map((odontologo) => {
            const key = `${odontologo.userId}-${fechaActual}`;
            const disponibilidadesOdontologo = disponibilidadesPorOdontologo[key] || [];
            
            return (
              <div key={odontologo.userId} className="columna-odontologo">
                {HORAS_DIA.map((hora) => renderizarCelda(odontologo, hora, disponibilidadesOdontologo))}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Modal de disponibilidad individual */}
      {modalAbierto && (
        <DisponibilidadModal
          disponibilidad={disponibilidadSeleccionada}
          onClose={() => {
            setModalAbierto(false);
            setDisponibilidadSeleccionada(null);
          }}
          onSuccess={() => {
            refetch(); // Recargar disponibilidades después de guardar
          }}
        />
      )}
      
      {/* Modal de disponibilidades recurrentes */}
      {modalRecurrenteAbierto && (
        <DisponibilidadRecurrenteModal
          onClose={() => setModalRecurrenteAbierto(false)}
          onSuccess={() => {
            refetch(); // Recargar disponibilidades después de guardar
            setModalRecurrenteAbierto(false);
          }}
        />
      )}
    </div>
  );
}

