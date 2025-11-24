// src/features/agenda/pages/GestionDisponibilidades.js
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import { useTurnosPorFecha } from '../hooks/useTurnos';
import DisponibilidadModal from '../components/DisponibilidadModal';
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
  
  // CU-AG02.4: Estado para vista (diaria, semanal, mensual)
  const [vista, setVista] = useState('diaria'); // 'diaria' | 'semanal' | 'mensual'
  
  // Estado para el día actual
  const [diaActual, setDiaActual] = useState(new Date());
  
  // Estado para modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [disponibilidadSeleccionada, setDisponibilidadSeleccionada] = useState(null);
  
  // CU-AG02.4: Calcular rango de fechas según vista
  const { fechaInicio, fechaFin } = useMemo(() => {
    if (vista === 'diaria') {
      const fecha = formatDate(diaActual);
      return { fechaInicio: fecha, fechaFin: fecha };
    } else if (vista === 'semanal') {
      const inicioSemana = new Date(diaActual);
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay()); // Domingo
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(finSemana.getDate() + 6); // Sábado
      return { fechaInicio: formatDate(inicioSemana), fechaFin: formatDate(finSemana) };
    } else { // mensual
      const inicioMes = new Date(diaActual.getFullYear(), diaActual.getMonth(), 1);
      const finMes = new Date(diaActual.getFullYear(), diaActual.getMonth() + 1, 0);
      return { fechaInicio: formatDate(inicioMes), fechaFin: formatDate(finMes) };
    }
  }, [vista, diaActual]);
  
  // Calcular fechas para la query
  const fechaActual = useMemo(() => formatDate(diaActual), [diaActual]);
  
  // Cargar odontólogos
  const { data: odontologos, isLoading: loadingOdontologos } = useOdontologosPorEspecialidad();
  
  // CU-AG02.4: Cargar disponibilidades según vista
  const { data: disponibilidades, isLoading: loadingDisponibilidades, refetch, isFetching } = useDisponibilidadesSemanal(fechaInicio, fechaFin);
  
  // CU-AG02: Cargar turnos según vista (día, semana o mes)
  // Para vista diaria: solo el día actual
  // Para vista semanal/mensual: todo el rango
  const { data: turnosData, isLoading: loadingTurnos } = useTurnosPorFecha(
    vista === 'diaria' ? fechaActual : null, 
    null // odontologoId - null para todos
  );
  const turnos = useMemo(() => {
    if (!turnosData) return [];
    let turnosList = Array.isArray(turnosData) ? turnosData : (turnosData.data || []);
    
    // Si es vista semanal o mensual, filtrar por rango de fechas
    if (vista !== 'diaria') {
      turnosList = turnosList.filter(turno => {
        const fechaTurno = new Date(turno.fechaHora).toISOString().split('T')[0];
        return fechaTurno >= fechaInicio && fechaTurno <= fechaFin;
      });
    }
    
    return turnosList;
  }, [turnosData, vista, fechaInicio, fechaFin]);
  
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
  
  // Agrupar disponibilidades por odontólogo y fecha
  const disponibilidadesPorOdontologo = useMemo(() => {
    if (!disponibilidades || !Array.isArray(disponibilidades)) return {};
    
    // Para vista diaria: agrupar solo por odontólogo (una fecha)
    // Para vista semanal/mensual: agrupar por odontólogo y fecha
    return disponibilidades.reduce((acc, disp) => {
      const key = vista === 'diaria' 
        ? `${disp.odontologoId}-${fechaActual}`
        : `${disp.odontologoId}-${disp.fecha}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(disp);
      return acc;
    }, {});
  }, [disponibilidades, vista, fechaActual]);
  
  // Handler para click en celda vacía
  const handleClickCelda = (odontologoId, hora, fecha = null) => {
    const fechaParaModal = fecha || (vista === 'diaria' ? fechaActual : fechaInicio);
    setDisponibilidadSeleccionada({
      odontologoId,
      fecha: fechaParaModal,
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

  // CU-AG02: Función para obtener turno en una hora específica y fecha
  const obtenerTurnoEnHora = (odontologoId, hora, fecha = null) => {
    if (!turnos || turnos.length === 0) return null;
    
    const turnosOdontologo = turnos.filter(t => {
      if (t.odontologoId !== odontologoId) return false;
      if (fecha) {
        const fechaTurno = new Date(t.fechaHora).toISOString().split('T')[0];
        return fechaTurno === fecha;
      }
      return true;
    });
    
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

  // CU-AG02.4: Generar array de días según vista
  const diasParaRenderizar = useMemo(() => {
    if (vista === 'diaria') {
      return [diaActual];
    } else if (vista === 'semanal') {
      const dias = [];
      const inicioSemana = new Date(diaActual);
      inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay()); // Domingo
      for (let i = 0; i < 7; i++) {
        const dia = new Date(inicioSemana);
        dia.setDate(dia.getDate() + i);
        dias.push(dia);
      }
      return dias;
    } else { // mensual
      const dias = [];
      const inicioMes = new Date(diaActual.getFullYear(), diaActual.getMonth(), 1);
      const finMes = new Date(diaActual.getFullYear(), diaActual.getMonth() + 1, 0);
      for (let d = new Date(inicioMes); d <= finMes; d.setDate(d.getDate() + 1)) {
        dias.push(new Date(d));
      }
      return dias;
    }
  }, [vista, diaActual]);

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

  // CU-AG02.4: Función para renderizar una celda (reutilizable para todas las vistas)
  const renderizarCelda = (odontologo, hora, fecha, disponibilidadesOdontologo) => {
    // CU-AG02: Verificar si hay un turno en esta hora y fecha
    const turnoEnHora = obtenerTurnoEnHora(odontologo.userId, hora, fecha);
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
          key={`${odontologo.userId}-${fecha}-${hora}-turno`} 
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
              fontSize: vista === 'mensual' ? '0.65rem' : '0.75rem',
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
            <div style={{ fontSize: vista === 'mensual' ? '0.6rem' : '0.7rem', opacity: 0.9 }}>
              {turnoEnHora.Paciente?.nombre} {turnoEnHora.Paciente?.apellido}
            </div>
            {turnoEnHora.motivo && vista !== 'mensual' && (
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
          key={`${odontologo.userId}-${fecha}-${hora}`} 
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
              <div className="bloque-hora" style={{ fontSize: vista === 'mensual' ? '0.7rem' : '0.85rem' }}>
                {normalizeTime(bloqueQueInicia.horaInicio)} - {normalizeTime(bloqueQueInicia.horaFin)}
              </div>
              {vista !== 'mensual' && (
                <>
                  <div className="bloque-tipo" style={{ fontSize: '0.75rem' }}>
                    {bloqueQueInicia.tipo === 'LABORAL' ? '✓ Disponible' : '✕ No Disponible'}
                  </div>
                  {bloqueQueInicia.motivo && (
                    <div className="bloque-motivo" style={{ fontSize: '0.7rem' }}>{bloqueQueInicia.motivo}</div>
                  )}
                </>
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
          key={`${odontologo.userId}-${fecha}-${hora}-turno-ocupado`} 
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
          key={`${odontologo.userId}-${fecha}-${hora}`} 
          className="celda-hora celda-ocupada"
        >
          {/* Celda ocupada por bloque que empezó antes */}
        </div>
      );
    }
    
    // Celda vacía normal
    return (
      <div 
        key={`${odontologo.userId}-${fecha}-${hora}`} 
        className="celda-hora"
        onClick={() => {
          const fechaParaModal = vista === 'diaria' ? fechaActual : fecha;
          handleClickCelda(odontologo.userId, hora, fechaParaModal);
        }}
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
      
      {/* CU-AG02.4: Controles de vista y navegación */}
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Selector de vista */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#f8f9fa', padding: '0.25rem', borderRadius: '6px' }}>
          <button
            onClick={() => setVista('diaria')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              background: vista === 'diaria' ? '#3498db' : 'transparent',
              color: vista === 'diaria' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: vista === 'diaria' ? 'bold' : 'normal'
            }}
          >
            Diaria
          </button>
          <button
            onClick={() => setVista('semanal')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              background: vista === 'semanal' ? '#3498db' : 'transparent',
              color: vista === 'semanal' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: vista === 'semanal' ? 'bold' : 'normal'
            }}
          >
            Semanal
          </button>
          <button
            onClick={() => setVista('mensual')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              border: 'none',
              background: vista === 'mensual' ? '#3498db' : 'transparent',
              color: vista === 'mensual' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: vista === 'mensual' ? 'bold' : 'normal'
            }}
          >
            Mensual
          </button>
        </div>
        
        {/* Controles de navegación */}
        <div className="semana-controles" style={{ marginLeft: 'auto' }}>
          {vista === 'diaria' && (
            <>
              <button className="btn-nav" onClick={irDiaAnterior}>
                <FaChevronLeft /> Día Anterior
              </button>
              
              <div className="semana-info">
                <FaCalendarAlt />
                <span>
                  {formatDateReadable(diaActual)}
                </span>
              </div>
              
              <button className="btn-hoy" onClick={irHoy}>
                Hoy
              </button>
              
              <button className="btn-nav" onClick={irDiaSiguiente}>
                Día Siguiente <FaChevronRight />
              </button>
            </>
          )}
          {vista === 'semanal' && (
            <>
              <button className="btn-nav" onClick={() => {
                const nuevaFecha = new Date(diaActual);
                nuevaFecha.setDate(nuevaFecha.getDate() - 7);
                setDiaActual(nuevaFecha);
              }}>
                <FaChevronLeft /> Semana Anterior
              </button>
              
              <div className="semana-info">
                <FaCalendarAlt />
                <span>
                  Semana del {formatDateReadable(new Date(fechaInicio))} al {formatDateReadable(new Date(fechaFin))}
                </span>
              </div>
              
              <button className="btn-hoy" onClick={irHoy}>
                Esta Semana
              </button>
              
              <button className="btn-nav" onClick={() => {
                const nuevaFecha = new Date(diaActual);
                nuevaFecha.setDate(nuevaFecha.getDate() + 7);
                setDiaActual(nuevaFecha);
              }}>
                Semana Siguiente <FaChevronRight />
              </button>
            </>
          )}
          {vista === 'mensual' && (
            <>
              <button className="btn-nav" onClick={() => {
                const nuevaFecha = new Date(diaActual);
                nuevaFecha.setMonth(nuevaFecha.getMonth() - 1);
                setDiaActual(nuevaFecha);
              }}>
                <FaChevronLeft /> Mes Anterior
              </button>
              
              <div className="semana-info">
                <FaCalendarAlt />
                <span>
                  {diaActual.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              
              <button className="btn-hoy" onClick={irHoy}>
                Este Mes
              </button>
              
              <button className="btn-nav" onClick={() => {
                const nuevaFecha = new Date(diaActual);
                nuevaFecha.setMonth(nuevaFecha.getMonth() + 1);
                setDiaActual(nuevaFecha);
              }}>
                Mes Siguiente <FaChevronRight />
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Calendario */}
      <div className="calendario-container">
        {/* Encabezado con días y odontólogos */}
        <div className="calendario-header" style={{ 
          display: 'grid', 
          gridTemplateColumns: `80px repeat(${vista === 'diaria' ? odontologos?.length || 1 : diasParaRenderizar.length * (odontologos?.length || 1)}, 1fr)`,
          overflowX: vista === 'mensual' ? 'auto' : 'visible'
        }}>
          <div className="columna-horas">
            <div className="header-cell">Horario</div>
          </div>
          
          {vista === 'diaria' ? (
            // Vista diaria: columnas por odontólogo
            odontologos && odontologos.length > 0 ? (
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
            )
          ) : (
            // Vista semanal/mensual: columnas por día x odontólogo
            diasParaRenderizar.map((dia, diaIndex) => {
              const diaStr = formatDate(dia);
              const esHoy = diaStr === formatDate(new Date());
              return odontologos?.map((odontologo) => (
                <div key={`${diaStr}-${odontologo.userId}`} className="columna-odontologo">
                  <div className={`header-cell ${esHoy ? 'dia-actual' : ''}`} style={{
                    padding: '0.5rem',
                    textAlign: 'center',
                    borderLeft: vista === 'semanal' && diaIndex > 0 ? '2px solid #e0e0e0' : 'none'
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      {dia.toLocaleDateString('es-AR', { weekday: 'short' })}
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: esHoy ? 'bold' : 'normal' }}>
                      {dia.getDate()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#7f8c8d', marginTop: '0.25rem' }}>
                      {dia.toLocaleDateString('es-AR', { month: 'short' })}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#95a5a6', marginTop: '0.25rem' }}>
                      Dr. {odontologo.Usuario?.nombre?.charAt(0)}. {odontologo.Usuario?.apellido}
                    </div>
                  </div>
                </div>
              ));
            }).flat()
          )}
        </div>
        
        {/* Grid del calendario */}
        <div className="calendario-grid" style={{
          display: 'grid',
          gridTemplateColumns: `80px repeat(${vista === 'diaria' ? odontologos?.length || 1 : diasParaRenderizar.length * (odontologos?.length || 1)}, 1fr)`,
          overflowX: vista === 'mensual' ? 'auto' : 'visible'
        }}>
          {/* Columna de horas */}
          <div className="columna-horas">
            {HORAS_DIA.map((hora) => (
              <div key={hora} className="hora-cell">
                {hora}
              </div>
            ))}
          </div>
          
          {/* CU-AG02.4: Renderizar según vista */}
          {vista === 'diaria' ? (
            // Vista diaria: una columna por odontólogo
            odontologos?.map((odontologo) => {
              const key = `${odontologo.userId}-${fechaActual}`;
              const disponibilidadesOdontologo = disponibilidadesPorOdontologo[key] || [];
              
              return (
                <div key={odontologo.userId} className="columna-odontologo">
                  {HORAS_DIA.map((hora) => renderizarCelda(odontologo, hora, fechaActual, disponibilidadesOdontologo))}
                </div>
              );
            })
          ) : (
            // Vista semanal/mensual: múltiples columnas (día x odontólogo)
            diasParaRenderizar.map((dia) => {
              const diaStr = formatDate(dia);
              return odontologos?.map((odontologo) => {
                const key = `${odontologo.userId}-${diaStr}`;
                const disponibilidadesOdontologo = disponibilidadesPorOdontologo[key] || [];
                
                return (
                  <div key={`${diaStr}-${odontologo.userId}`} className="columna-odontologo" style={{
                    borderLeft: vista === 'semanal' && diasParaRenderizar.indexOf(dia) > 0 ? '2px solid #e0e0e0' : 'none'
                  }}>
                    {HORAS_DIA.map((hora) => renderizarCelda(odontologo, hora, diaStr, disponibilidadesOdontologo))}
                  </div>
                );
              });
            }).flat()
          )}
        </div>
      </div>
      
      {/* Modal */}
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
    </div>
  );
}

