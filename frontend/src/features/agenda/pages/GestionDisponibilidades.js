// src/features/agenda/pages/GestionDisponibilidades.js
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import { useTurnosPorFecha } from '../hooks/useTurnos';
import useAuth from '../../../features/auth/hooks/useAuth';
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
  const { user } = useAuth();
  
  // CU-AG01.5: Proteger ruta - Solo recepcionista puede gestionar disponibilidades
  useEffect(() => {
    const esOdontologo = user?.rol?.id === 2 || user?.RolId === 2 || user?.rol?.nombre === 'Odontólogo';
    if (esOdontologo) {
      navigate('/agenda/diaria');
    }
  }, [user, navigate]);
  
  // Estado para el día actual (solo vista diaria)
  const [diaActual, setDiaActual] = useState(new Date());
  
  // Estado para filtros
  const [odontologoFiltro, setOdontologoFiltro] = useState([]); // [] = todos, array de IDs para múltiple
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'disponibles' | 'seleccionados'
  
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
  
  // Cargar turnos del día actual (filtrado por odontólogo si está seleccionado)
  const { data: turnosData, isLoading: loadingTurnos } = useTurnosPorFecha(
    fechaActual, 
    odontologoFiltro.length === 1 ? odontologoFiltro[0] : null // Si hay solo uno, filtrar; si hay varios o ninguno, todos
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
  
  // Calcular odontólogos disponibles en la fecha seleccionada
  const odontologosDisponibles = useMemo(() => {
    if (!odontologos || !disponibilidades) return [];
    
    const odontologosConDisponibilidad = new Set();
    disponibilidades.forEach(disp => {
      if (disp.fecha === fechaActual && disp.tipo === 'LABORAL') {
        odontologosConDisponibilidad.add(disp.odontologoId);
      }
    });
    
    return Array.from(odontologosConDisponibilidad);
  }, [odontologos, disponibilidades, fechaActual]);
  
  // Filtrar odontólogos según el filtro seleccionado
  const odontologosFiltrados = useMemo(() => {
    if (!odontologos) return [];
    
    if (filtroTipo === 'todos') {
      return odontologos;
    }
    
    if (filtroTipo === 'disponibles') {
      return odontologos.filter(o => odontologosDisponibles.includes(o.userId));
    }
    
    if (filtroTipo === 'seleccionados' && odontologoFiltro.length > 0) {
      return odontologos.filter(o => odontologoFiltro.includes(o.userId));
    }
    
    return odontologos;
  }, [odontologos, filtroTipo, odontologoFiltro, odontologosDisponibles]);
  
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
  
  // Handler para cambiar fecha desde selector
  const handleCambiarFecha = (e) => {
    const nuevaFecha = new Date(e.target.value);
    if (!isNaN(nuevaFecha.getTime())) {
      setDiaActual(nuevaFecha);
    }
  };
  
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
        
        {/* Filtro por odontólogo */}
        <select
          value={filtroTipo === 'seleccionados' && odontologoFiltro.length === 1
            ? `odontologo-${odontologoFiltro[0]}`
            : filtroTipo}
          onChange={(e) => {
            const value = e.target.value;
            if (value === 'todos') {
              setFiltroTipo('todos');
              setOdontologoFiltro([]);
            } else if (value === 'disponibles') {
              setFiltroTipo('disponibles');
              setOdontologoFiltro([]);
            } else if (value.startsWith('odontologo-')) {
              const odontologoId = parseInt(value.replace('odontologo-', ''));
              setOdontologoFiltro([odontologoId]);
              setFiltroTipo('seleccionados');
            }
          }}
          className="btn-nav"
          style={{
            padding: '0.75rem 1.5rem',
            background: filtroTipo === 'disponibles' 
              ? '#10b981' 
              : filtroTipo === 'seleccionados' 
                ? '#3b82f6' 
                : '#145c63',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
            minWidth: '220px',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='white' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 0.75rem center',
            paddingRight: '2.5rem',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            if (filtroTipo === 'todos') {
              e.target.style.backgroundColor = '#1a7a82';
            } else if (filtroTipo === 'disponibles') {
              e.target.style.backgroundColor = '#059669';
            } else {
              e.target.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (filtroTipo === 'todos') {
              e.target.style.backgroundColor = '#145c63';
            } else if (filtroTipo === 'disponibles') {
              e.target.style.backgroundColor = '#10b981';
            } else {
              e.target.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          <option value="todos" style={{ background: 'white', color: '#374151' }}>
            Todos los odontólogos
          </option>
          <option value="disponibles" style={{ background: 'white', color: '#374151' }}>
            Disponibles ({odontologosDisponibles.length})
          </option>
          {odontologos?.map((odontologo) => {
            const estaDisponible = odontologosDisponibles.includes(odontologo.userId);
            return (
              <option 
                key={odontologo.userId} 
                value={`odontologo-${odontologo.userId}`}
                style={{ background: 'white', color: '#374151' }}
              >
                Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                {estaDisponible ? ' ✓ Disponible' : ''}
              </option>
            );
          })}
        </select>
        
        <div 
          className="semana-info" 
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => {
            const input = document.getElementById('fecha-selector-hidden');
            if (input) {
              // Intentar usar showPicker si está disponible (Chrome/Edge)
              if (input.showPicker) {
                input.showPicker();
              } else {
                // Fallback: hacer click en el input
                input.click();
              }
            }
          }}
        >
          <FaCalendarAlt style={{ cursor: 'pointer' }} />
          <span>
            {formatDateReadable(diaActual)}
          </span>
          <input
            id="fecha-selector-hidden"
            type="date"
            value={fechaActual}
            onChange={handleCambiarFecha}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer',
              left: 0,
              top: 0,
              zIndex: 1
            }}
          />
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
          gridTemplateColumns: `80px repeat(${odontologosFiltrados?.length || 1}, 1fr)`
        }}>
          <div className="columna-horas">
            <div className="header-cell">Horario</div>
          </div>
          
          {odontologosFiltrados && odontologosFiltrados.length > 0 ? (
            odontologosFiltrados.map((odontologo) => (
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
          gridTemplateColumns: `80px repeat(${odontologosFiltrados?.length || 1}, 1fr)`
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
          {odontologosFiltrados?.map((odontologo) => {
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

