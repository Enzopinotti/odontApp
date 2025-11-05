// src/features/agenda/pages/AgendaDiaria.js
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaArrowLeft, FaPlus } from 'react-icons/fa';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useTurnosPorFecha } from '../hooks/useTurnos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import DetallesTurnoModal from '../components/DetallesTurnoModal';
import '../../../styles/agendaDiaria.scss';

// Helper para formatear fecha
const formatDate = (date) => date.toISOString().split('T')[0];

const formatDateReadable = (date) => {
  const formatted = date.toLocaleDateString('es-AR', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Generar array de horarios cada 1 hora
const INICIO_JORNADA = 8; // 8:00 AM
const FIN_JORNADA = 20; // 8:00 PM
const INTERVALO_MINUTOS = 60;

const generarHorarios = () => {
  const horarios = [];
  for (let hora = INICIO_JORNADA; hora < FIN_JORNADA; hora++) {
    horarios.push(`${hora.toString().padStart(2, '0')}:00`);
  }
  return horarios;
};

const HORARIOS = generarHorarios();

// Colores por odontólogo (ciclando)
const COLORES_ODONTOLOGO = [
  { bg: '#D1FAE5', border: '#10B981', text: '#065F46' }, // Verde
  { bg: '#E9D5FF', border: '#A855F7', text: '#6B21A8' }, // Morado
  { bg: '#FED7AA', border: '#F97316', text: '#9A3412' }, // Naranja
  { bg: '#DBEAFE', border: '#3B82F6', text: '#1E3A8A' }, // Azul
  { bg: '#FEE2E2', border: '#EF4444', text: '#991B1B' }, // Rojo
];

const normalizarHora = (hora) => {
  if (!hora) return '';
  return hora.substring(0, 5); // '09:00:00' -> '09:00'
};

export default function AgendaDiaria() {
  const navigate = useNavigate();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [horaActual, setHoraActual] = useState(new Date());

  const fechaStr = useMemo(() => formatDate(fechaSeleccionada), [fechaSeleccionada]);

  // Verificar si la fecha seleccionada es HOY
  const esHoy = useMemo(() => {
    const hoy = new Date();
    return (
      fechaSeleccionada.getDate() === hoy.getDate() &&
      fechaSeleccionada.getMonth() === hoy.getMonth() &&
      fechaSeleccionada.getFullYear() === hoy.getFullYear()
    );
  }, [fechaSeleccionada]);

  // Actualizar hora actual cada minuto (solo si es hoy)
  useEffect(() => {
    if (!esHoy) return;

    const intervalo = setInterval(() => {
      setHoraActual(new Date());
    }, 60000); // Actualizar cada 60 segundos

    return () => clearInterval(intervalo);
  }, [esHoy]);

  // Calcular posición de la línea de hora actual (en porcentaje)
  const calcularPosicionLineaActual = () => {
    if (!esHoy) return null;

    const ahora = horaActual;
    const horaMinutos = ahora.getHours() * 60 + ahora.getMinutes();
    const inicioJornadaMinutos = INICIO_JORNADA * 60;
    const finJornadaMinutos = FIN_JORNADA * 60;

    // Si estamos fuera del horario laboral, no mostrar la línea
    if (horaMinutos < inicioJornadaMinutos || horaMinutos >= finJornadaMinutos) {
      return null;
    }

    // Calcular porcentaje de la posición
    const minutosDesdeInicio = horaMinutos - inicioJornadaMinutos;
    const totalMinutosJornada = finJornadaMinutos - inicioJornadaMinutos;
    const porcentaje = (minutosDesdeInicio / totalMinutosJornada) * 100;

    return {
      porcentaje,
      hora: `${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`
    };
  };

  const lineaActual = calcularPosicionLineaActual();

  // Cargar datos
  const { data: odontologos, isLoading: loadingOdontologos } = useOdontologosPorEspecialidad();
  const { data: turnosData, isLoading: loadingTurnos, refetch: refetchTurnos } = useTurnosPorFecha(fechaStr);
  const { data: disponibilidades, isLoading: loadingDisponibilidades } = useDisponibilidadesSemanal(fechaStr, fechaStr);

  // Extraer turnos del array
  const turnos = useMemo(() => {
    if (!turnosData) return [];
    return Array.isArray(turnosData) ? turnosData : (turnosData.data || []);
  }, [turnosData]);

  // Asignar colores a odontólogos
  const coloresPorOdontologo = useMemo(() => {
    if (!odontologos) return {};
    const colores = {};
    odontologos.forEach((odontologo, index) => {
      colores[odontologo.userId] = COLORES_ODONTOLOGO[index % COLORES_ODONTOLOGO.length];
    });
    return colores;
  }, [odontologos]);

  // Navegación de fechas
  const irDiaAnterior = () => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() - 1);
    setFechaSeleccionada(nuevaFecha);
  };

  const irDiaSiguiente = () => {
    const nuevaFecha = new Date(fechaSeleccionada);
    nuevaFecha.setDate(nuevaFecha.getDate() + 1);
    setFechaSeleccionada(nuevaFecha);
  };

  const irHoy = () => {
    setFechaSeleccionada(new Date());
  };

  // Manejar cambio de fecha en el input
  const handleCambioFecha = (e) => {
    const nuevaFecha = new Date(e.target.value + 'T00:00:00');
    setFechaSeleccionada(nuevaFecha);
  };

  // Verificar si un horario está dentro de la disponibilidad laboral (intervalos de 1 hora)
  const estaDisponible = (odontologoId, hora) => {
    if (!disponibilidades) return false;
    
    const dispOdontologo = disponibilidades.filter(
      d => d.odontologoId === odontologoId && d.fecha === fechaStr && d.tipo === 'LABORAL'
    );
    
    const slotHora = parseInt(hora.split(':')[0]);
    
    for (const disp of dispOdontologo) {
      const horaInicio = normalizarHora(disp.horaInicio);
      const horaFin = normalizarHora(disp.horaFin);
      
      const inicioHora = parseInt(horaInicio.split(':')[0]);
      const finHora = parseInt(horaFin.split(':')[0]);
      const finMinutos = parseInt(horaFin.split(':')[1]);
      
      // Si la hora de fin tiene minutos, se considera que abarca esa hora completa
      const finHoraAjustada = finMinutos > 0 ? finHora + 1 : finHora;
      
      if (slotHora >= inicioHora && slotHora < finHoraAjustada) {
        return true;
      }
    }
    
    return false;
  };

  // Obtener bloqueo (disponibilidad NO LABORAL) - intervalos de 1 hora
  const obtenerBloqueo = (odontologoId, hora) => {
    if (!disponibilidades) return null;
    
    const bloqueos = disponibilidades.filter(
      d => d.odontologoId === odontologoId && d.fecha === fechaStr && d.tipo === 'NOLABORAL'
    );
    
    const slotHora = parseInt(hora.split(':')[0]);
    
    for (const bloqueo of bloqueos) {
      const horaInicio = normalizarHora(bloqueo.horaInicio);
      const horaFin = normalizarHora(bloqueo.horaFin);
      
      const inicioHora = parseInt(horaInicio.split(':')[0]);
      const finHora = parseInt(horaFin.split(':')[0]);
      const finMinutos = parseInt(horaFin.split(':')[1]);
      
      const finHoraAjustada = finMinutos > 0 ? finHora + 1 : finHora;
      
      if (slotHora >= inicioHora && slotHora < finHoraAjustada) {
        return bloqueo;
      }
    }
    
    return null;
  };

  // Obtener turno en un horario específico (intervalos de 1 hora)
  const obtenerTurno = (odontologoId, hora) => {
    if (!turnos) return null;
    
    for (const turno of turnos) {
      if (turno.odontologoId !== odontologoId) continue;
      
      const turnoFecha = new Date(turno.fechaHora);
      const turnoHoraInicio = turnoFecha.getHours();
      const turnoFin = new Date(turnoFecha.getTime() + turno.duracion * 60000);
      const turnoHoraFin = turnoFin.getHours() + (turnoFin.getMinutes() > 0 ? 1 : 0); // Redondear hacia arriba
      
      // Extraer la hora del slot actual
      const slotHora = parseInt(hora.split(':')[0]);
      
      // El turno ocupa este slot si el slot está entre inicio y fin
      if (slotHora >= turnoHoraInicio && slotHora < turnoHoraFin) {
        // Formato de hora completa para mostrar
        const horaInicioStr = `${turnoFecha.getHours().toString().padStart(2, '0')}:${turnoFecha.getMinutes().toString().padStart(2, '0')}`;
        const horaFinStr = `${turnoFin.getHours().toString().padStart(2, '0')}:${turnoFin.getMinutes().toString().padStart(2, '0')}`;
        
        return { 
          ...turno, 
          esInicio: slotHora === turnoHoraInicio,
          horaInicioStr,
          horaFinStr
        };
      }
    }
    
    return null;
  };

  // Manejar click en celda
  const handleClickCelda = (odontologoId, hora) => {
    const turno = obtenerTurno(odontologoId, hora);
    const bloqueo = obtenerBloqueo(odontologoId, hora);
    const disponible = estaDisponible(odontologoId, hora);

    if (turno) {
      // Abrir modal con detalles del turno
      setTurnoSeleccionado(turno);
      setModalAbierto(true);
    } else if (bloqueo) {
      // Mostrar tooltip o alerta con el motivo del bloqueo
      alert(`Horario bloqueado: ${bloqueo.motivo || 'No disponible'}`);
    } else if (disponible) {
      // Ir a crear turno con datos pre-cargados
      const fechaHora = new Date(fechaSeleccionada);
      const [horas, minutos] = hora.split(':');
      fechaHora.setHours(parseInt(horas), parseInt(minutos), 0, 0);
      
      navigate('/agenda/turnos/nuevo', {
        state: {
          fechaHoraPreseleccionada: fechaHora.toISOString(),
          odontologoIdPreseleccionado: odontologoId
        }
      });
    }
  };

  if (loadingOdontologos || loadingTurnos || loadingDisponibilidades) {
    return <div className="loading-container">Cargando agenda del día...</div>;
  }

  return (
    <div className="agenda-diaria-container">
      {/* Header */}
      <div className="agenda-diaria-header">
        <button className="btn-volver" onClick={() => navigate('/agenda')}>
          <FaArrowLeft /> Volver
        </button>
        <h1>Agenda del Día</h1>
      </div>

      {/* Controles de navegación */}
      <div className="controles-fecha">
        <button className="btn-nav" onClick={irDiaAnterior}>
          <FaChevronLeft /> Anterior
        </button>
        
        <div className="fecha-selector">
          <FaCalendarAlt />
          <input 
            type="date" 
            value={fechaStr} 
            onChange={handleCambioFecha}
            className="input-fecha"
          />
          <span className="fecha-legible">{formatDateReadable(fechaSeleccionada)}</span>
        </div>
        
        <button className="btn-hoy" onClick={irHoy}>
          Hoy
        </button>
        
        <button className="btn-nav" onClick={irDiaSiguiente}>
          Siguiente <FaChevronRight />
        </button>
      </div>

      {/* Tabla de agenda */}
      <div className="agenda-tabla-container">
        <table className="agenda-tabla">
          <thead>
            <tr>
              <th className="col-hora">Hora</th>
              {odontologos?.map((odontologo) => (
                <th key={odontologo.userId} className="col-odontologo">
                  <div className="odontologo-header">
                    <div 
                      className="color-indicator" 
                      style={{ backgroundColor: coloresPorOdontologo[odontologo.userId]?.border }}
                    ></div>
                    <div className="odontologo-info">
                      <div className="odontologo-nombre">
                        Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                      </div>
                      <div className="odontologo-especialidad">
                        {odontologo.OdontologoEspecialidades?.[0]?.Especialidad?.nombre || 'Odontología General'}
                      </div>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HORARIOS.map((hora) => (
              <tr key={hora}>
                <td className="celda-hora">{hora}</td>
                {odontologos?.map((odontologo) => {
                  const turno = obtenerTurno(odontologo.userId, hora);
                  const bloqueo = obtenerBloqueo(odontologo.userId, hora);
                  const disponible = estaDisponible(odontologo.userId, hora);
                  const colores = coloresPorOdontologo[odontologo.userId];

                  // Si hay turno y es el inicio
                  if (turno && turno.esInicio) {
                    const duracionSlots = Math.ceil(turno.duracion / 60); // Ahora cada slot es 1 hora
                    return (
                      <td 
                        key={odontologo.userId}
                        rowSpan={duracionSlots}
                        className="celda-turno"
                        style={{
                          backgroundColor: colores.bg,
                          borderLeft: `4px solid ${colores.border}`,
                          color: colores.text,
                        }}
                        onClick={() => handleClickCelda(odontologo.userId, hora)}
                      >
                        <div className="turno-content">
                          {/* Badge de estado en la esquina superior derecha */}
                          <span className={`turno-estado-badge estado-${turno.estado.toLowerCase()}`}>
                            {turno.estado === 'PENDIENTE' && '⏳'}
                            {turno.estado === 'ASISTIO' && '✓'}
                            {turno.estado === 'AUSENTE' && '✗'}
                            {turno.estado === 'CANCELADO' && '⊘'}
                          </span>
                          
                          <div className="turno-horario">
                            ⏰ {turno.horaInicioStr} - {turno.horaFinStr}
                          </div>
                          <div className="turno-paciente">
                            👤 {turno.Paciente?.nombre} {turno.Paciente?.apellido}
                          </div>
                          <div className="turno-motivo">{turno.motivo}</div>
                        </div>
                      </td>
                    );
                  }

                  // Si hay turno pero no es el inicio, skip (ya está en rowSpan)
                  if (turno && !turno.esInicio) {
                    return null;
                  }

                  // Si hay bloqueo
                  if (bloqueo) {
                    return (
                      <td 
                        key={odontologo.userId}
                        className="celda-bloqueada"
                        onClick={() => handleClickCelda(odontologo.userId, hora)}
                        title={bloqueo.motivo || 'Horario no disponible'}
                      >
                        <div className="bloqueado-content">
                          <span className="bloqueado-icon">🚫</span>
                          <span className="bloqueado-text">Bloqueado</span>
                        </div>
                      </td>
                    );
                  }

                  // Si está disponible
                  if (disponible) {
                    return (
                      <td 
                        key={odontologo.userId}
                        className="celda-disponible"
                        onClick={() => handleClickCelda(odontologo.userId, hora)}
                      >
                        <div className="disponible-content">
                          <FaPlus className="disponible-icon" />
                          <span className="disponible-text">Disponible</span>
                        </div>
                      </td>
                    );
                  }

                  // No disponible (fuera de horario laboral)
                  return (
                    <td 
                      key={odontologo.userId}
                      className="celda-no-laboral"
                    >
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Línea de hora actual (solo si es HOY) */}
        {lineaActual && (
          <div 
            className="linea-hora-actual"
            style={{ top: `${lineaActual.porcentaje}%` }}
          >
            <div className="linea-hora-actual-indicator">
              <span className="hora-actual-text">{lineaActual.hora}</span>
            </div>
            <div className="linea-hora-actual-line"></div>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {modalAbierto && turnoSeleccionado && (
        <DetallesTurnoModal
          turno={turnoSeleccionado}
          onClose={() => {
            setModalAbierto(false);
            setTurnoSeleccionado(null);
          }}
          onSuccess={() => {
            refetchTurnos();
            setModalAbierto(false);
            setTurnoSeleccionado(null);
          }}
        />
      )}
    </div>
  );
}

