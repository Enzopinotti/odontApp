// src/features/agenda/pages/GestionDisponibilidades.js
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import DisponibilidadModal from '../components/DisponibilidadModal';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaSyncAlt } from 'react-icons/fa';
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
  
  // Estado para el día actual
  const [diaActual, setDiaActual] = useState(new Date());
  
  // Estado para modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [disponibilidadSeleccionada, setDisponibilidadSeleccionada] = useState(null);
  
  // Calcular fechas para la query
  const fechaActual = useMemo(() => formatDate(diaActual), [diaActual]);
  
  // Cargar odontólogos
  const { data: odontologos, isLoading: loadingOdontologos } = useOdontologosPorEspecialidad();
  
  // Cargar disponibilidades del día
  const { data: disponibilidades, isLoading: loadingDisponibilidades, refetch, isFetching } = useDisponibilidadesSemanal(fechaActual, fechaActual);
  
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
    
    return disponibilidades.reduce((acc, disp) => {
      const key = `${disp.odontologoId}-${disp.fecha}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(disp);
      return acc;
    }, {});
  }, [disponibilidades]);
  
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
  
  // Calcular altura de bloque en celdas
  const calcularAlturaCeldas = (horaInicio, horaFin) => {
    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);
    const horas = (fin - inicio) / (1000 * 60 * 60);
    return horas;
  };
  
  if (loadingOdontologos || loadingDisponibilidades) {
    return <div className="loading-container">Cargando disponibilidades...</div>;
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
      
      {/* Controles de navegación */}
      <div className="semana-controles">
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
      </div>
      
      {/* Calendario */}
      <div className="calendario-container">
        {/* Encabezado con días de la semana */}
        <div className="calendario-header">
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
        <div className="calendario-grid">
          {/* Columna de horas */}
          <div className="columna-horas">
            {HORAS_DIA.map((hora) => (
              <div key={hora} className="hora-cell">
                {hora}
              </div>
            ))}
          </div>
          
          {/* Columnas por odontólogo */}
          {odontologos?.map((odontologo) => {
            const key = `${odontologo.userId}-${fechaActual}`;
            const disponibilidadesOdontologo = disponibilidadesPorOdontologo[key] || [];
            
            return (
              <div key={odontologo.userId} className="columna-odontologo">
                {HORAS_DIA.map((hora, horaIndex) => {
                  // Verificar si esta hora es el INICIO de alguna disponibilidad
                  const bloqueQueInicia = disponibilidadesOdontologo.find((disp) => {
                    return normalizeTime(disp.horaInicio) === hora;
                  });
                  
                  // Verificar si esta hora está DENTRO de alguna disponibilidad (pero no es el inicio)
                  const dentroDeBloqueExistente = disponibilidadesOdontologo.some((disp) => {
                    const inicioNormalizado = normalizeTime(disp.horaInicio);
                    return inicioNormalizado !== hora && isHourInRange(hora, disp.horaInicio, disp.horaFin);
                  });
                  
                  // Si hay un bloque que inicia aquí, renderizarlo
                  if (bloqueQueInicia) {
                    const alturaCeldas = calcularAlturaCeldas(bloqueQueInicia.horaInicio, bloqueQueInicia.horaFin);
                    const className = bloqueQueInicia.tipo === 'LABORAL' ? 'bloque-laboral' : 'bloque-nolaboral';
                    
                    return (
                      <div 
                        key={`${odontologo.userId}-${hora}`} 
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
                            height: `calc(${alturaCeldas * 60}px - 4px)`, // 60px por celda
                            zIndex: 5,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClickBloque(bloqueQueInicia);
                          }}
                          title={`${normalizeTime(bloqueQueInicia.horaInicio)} - ${normalizeTime(bloqueQueInicia.horaFin)}${bloqueQueInicia.motivo ? ` - ${bloqueQueInicia.motivo}` : ''}`}
                        >
                          <div className="bloque-info">
                            <div className="bloque-hora">
                              {normalizeTime(bloqueQueInicia.horaInicio)} - {normalizeTime(bloqueQueInicia.horaFin)}
                            </div>
                            <div className="bloque-tipo">
                              {bloqueQueInicia.tipo === 'LABORAL' ? '✓ Disponible' : '✕ No Disponible'}
                            </div>
                            {bloqueQueInicia.motivo && (
                              <div className="bloque-motivo">{bloqueQueInicia.motivo}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Si está dentro de un bloque existente, mostrar celda ocupada (sin icono)
                  if (dentroDeBloqueExistente) {
                    return (
                      <div 
                        key={`${odontologo.userId}-${hora}`} 
                        className="celda-hora celda-ocupada"
                      >
                        {/* Celda ocupada por bloque que empezó antes */}
                      </div>
                    );
                  }
                  
                  // Celda vacía normal
                  return (
                    <div 
                      key={`${odontologo.userId}-${hora}`} 
                      className="celda-hora"
                      onClick={() => handleClickCelda(odontologo.userId, hora)}
                    >
                      <div className="celda-vacia">
                        <FaPlus className="icon-add" />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
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

