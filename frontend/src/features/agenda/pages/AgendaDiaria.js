// src/features/agenda/pages/AgendaDiaria.js
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaArrowLeft, FaPlus, FaCheckSquare, FaBan, FaFilter, FaCalendarWeek, FaChevronUp, FaChevronDown, FaSearch } from 'react-icons/fa';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useTurnosPorFecha, useTurnos } from '../hooks/useTurnos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import DetallesTurnoModal from '../components/DetallesTurnoModal';
import CancelarTurnosMultipleModal from '../components/CancelarTurnosMultipleModal';
import BuscarTurnosModal from '../components/BuscarTurnosModal';
import useToast from '../../../hooks/useToast';
import useAuth from '../../../features/auth/hooks/useAuth';
import { getHoraArgentina, getHoraStringArgentina } from '../utils/timezoneHelpers';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import '../../../styles/agendaDiaria.scss';

// Helper para formatear fecha en zona horaria local (Argentina)
const formatDate = (date) => {
  if (!date) return '';
  // Usar componentes locales para evitar problemas de UTC
  const año = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const dia = String(date.getDate()).padStart(2, '0');
  return `${año}-${mes}-${dia}`;
};

const formatDateReadable = (date) => {
  const formatted = date.toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

// Generar array de horarios (slot base)
const INICIO_JORNADA = 8; // 8:00 AM
const FIN_JORNADA = 20; // 8:00 PM
const SLOT_MINUTOS = 30; // bloques de 30 minutos para simplificar

const horaStringToMinutes = (hora) => {
  if (!hora) return 0;
  const [h, m] = hora.split(':');
  return parseInt(h || '0', 10) * 60 + parseInt(m || '0', 10);
};

const minutesToHoraString = (minutosTotales) => {
  const horas = Math.floor(minutosTotales / 60)
    .toString()
    .padStart(2, '0');
  const minutos = (minutosTotales % 60).toString().padStart(2, '0');
  return `${horas}:${minutos}`;
};

const generarHorarios = (minInicio = INICIO_JORNADA * 60, minFin = FIN_JORNADA * 60) => {
  const horarios = [];
  for (let min = minInicio; min < minFin; min += SLOT_MINUTOS) {
    horarios.push(minutesToHoraString(min));
  }
  return horarios;
};

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

// Componente Mini Calendario Mensual (versión compacta para sidebar)
function MiniCalendarioSidebar({ fechaSeleccionada, setFechaSeleccionada, disponibilidadesMes, turnosMesData, mesActual, onMesVistaChange }) {
  const [mesVista, setMesVista] = useState(new Date(fechaSeleccionada));

  // Sincronizar mesVista cuando cambia fechaSeleccionada desde fuera del calendario
  useEffect(() => {
    setMesVista(new Date(fechaSeleccionada));
  }, [fechaSeleccionada]);

  // Notificar al componente padre cuando cambia el mes visualizado
  useEffect(() => {
    if (onMesVistaChange) {
      onMesVistaChange(mesVista);
    }
  }, [mesVista, onMesVistaChange]);

  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Obtener días con disponibilidad y turnos
  const diasConActividad = useMemo(() => {
    const diasDisponibles = new Set();
    const diasConTurnos = new Set();

    if (disponibilidadesMes) {
      disponibilidadesMes.forEach(disp => {
        if (typeof disp.fecha === 'string') {
          const partes = disp.fecha.split('-');
          if (partes.length === 3) {
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10) - 1;
            const dia = parseInt(partes[2], 10);
            if (año === mesVista.getFullYear() && mes === mesVista.getMonth()) {
              if (disp.tipo === 'LABORAL') {
                diasDisponibles.add(dia);
              }
            }
          }
        }
      });
    }

    if (turnosMesData) {
      let turnosList = [];
      if (Array.isArray(turnosMesData)) {
        turnosList = turnosMesData;
      } else if (turnosMesData.data) {
        turnosList = Array.isArray(turnosMesData.data) ? turnosMesData.data : [];
      } else if (turnosMesData.rows) {
        turnosList = turnosMesData.rows || [];
      }

      turnosList.forEach(turno => {
        const fechaHoraStr = turno.fechaHora;
        let año, mes, dia;

        if (typeof fechaHoraStr === 'string') {
          const fechaParte = fechaHoraStr.split('T')[0];
          const partes = fechaParte.split('-');
          if (partes.length === 3) {
            año = parseInt(partes[0], 10);
            mes = parseInt(partes[1], 10) - 1;
            dia = parseInt(partes[2], 10);
            if (año === mesVista.getFullYear() && mes === mesVista.getMonth()) {
              diasConTurnos.add(dia);
            }
          }
        }
      });
    }

    return { disponibles: diasDisponibles, conTurnos: diasConTurnos };
  }, [disponibilidadesMes, turnosMesData, mesVista]);

  const cambiarMes = (direccion) => {
    const nuevo = new Date(mesVista);
    nuevo.setMonth(nuevo.getMonth() + direccion);
    setMesVista(nuevo);
  };

  const irMesActual = () => {
    const hoy = new Date();
    setMesVista(hoy);
    setFechaSeleccionada(hoy);
  };

  const diasDelMes = useMemo(() => {
    const año = mesVista.getFullYear();
    const mes = mesVista.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();

    const dias = [];

    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaCompleta = new Date(año, mes, dia);
      const añoStr = año.toString();
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaStr = `${añoStr}-${mesStr}-${diaStr}`;

      const hoy = new Date();
      const esPasado = fechaCompleta < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const esHoy = fechaCompleta.getDate() === hoy.getDate() &&
        fechaCompleta.getMonth() === hoy.getMonth() &&
        fechaCompleta.getFullYear() === hoy.getFullYear();
      const esSeleccionado = fechaCompleta.getDate() === fechaSeleccionada.getDate() &&
        fechaCompleta.getMonth() === fechaSeleccionada.getMonth() &&
        fechaCompleta.getFullYear() === fechaSeleccionada.getFullYear();
      const tieneDisponibilidad = diasConActividad.disponibles.has(dia);
      const tieneTurnos = diasConActividad.conTurnos.has(dia);

      dias.push({
        numero: dia,
        fecha: fechaStr,
        esPasado,
        esHoy,
        esSeleccionado,
        tieneDisponibilidad,
        tieneTurnos
      });
    }

    return dias;
  }, [mesVista, fechaSeleccionada, diasConActividad]);

  const handleClickDia = (dia) => {
    if (!dia) return;
    const nuevaFecha = new Date(dia.fecha + 'T12:00:00');
    setFechaSeleccionada(nuevaFecha);
  };

  return (
    <div style={{
      background: 'white',
      borderRadius: '8px',
      padding: '1rem',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      minWidth: '240px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem'
      }}>
        <button
          onClick={() => cambiarMes(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            fontSize: '0.9rem',
            color: '#145c63'
          }}
        >
          <FaChevronLeft />
        </button>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600' }}>
          {nombresMeses[mesVista.getMonth()]} {mesVista.getFullYear()}
        </h4>
        <button
          onClick={() => cambiarMes(1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            fontSize: '0.9rem',
            color: '#145c63'
          }}
        >
          <FaChevronRight />
        </button>
      </div>

      <button
        onClick={irMesActual}
        style={{
          width: '100%',
          padding: '0.4rem',
          marginBottom: '0.75rem',
          background: '#f0f0f0',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '0.75rem'
        }}
      >
        Hoy
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem',
        marginBottom: '0.5rem'
      }}>
        {nombresDias.map(dia => (
          <div key={dia} style={{
            textAlign: 'center',
            fontSize: '0.7rem',
            fontWeight: '600',
            color: '#666',
            padding: '0.25rem'
          }}>
            {dia}
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '0.25rem'
      }}>
        {diasDelMes.map((dia, idx) => {
          if (!dia) {
            return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />;
          }

          return (
            <button
              key={dia.numero}
              onClick={() => handleClickDia(dia)}
              style={{
                aspectRatio: '1',
                border: dia.esSeleccionado
                  ? '2px solid #145c63'
                  : dia.esHoy
                    ? '2px solid #f59e0b'
                    : '1px solid #e0e0e0',
                borderRadius: '4px',
                background: dia.esSeleccionado
                  ? '#145c63'
                  : dia.esHoy
                    ? '#fef3c7'
                    : dia.tieneTurnos
                      ? '#dbeafe'
                      : dia.tieneDisponibilidad
                        ? '#d1fae5'
                        : '#f5f5f5',
                color: dia.esSeleccionado
                  ? 'white'
                  : dia.esPasado
                    ? '#666'
                    : '#333',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: dia.esSeleccionado || dia.esHoy ? '600' : '400',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                opacity: dia.esPasado ? 0.7 : 1
              }}
              title={dia.tieneTurnos ? 'Tiene turnos' : dia.tieneDisponibilidad ? 'Tiene disponibilidad' : dia.esPasado ? 'Día pasado' : ''}
            >
              {dia.numero}
              {(dia.tieneTurnos || dia.tieneDisponibilidad) && !dia.esSeleccionado && (
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  width: '3px',
                  height: '3px',
                  borderRadius: '50%',
                  background: dia.tieneTurnos ? '#3b82f6' : '#10b981'
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Componente Mini Calendario Mensual (versión dropdown original)
function MiniCalendarioMensual({ fechaSeleccionada, setFechaSeleccionada }) {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [mesVista, setMesVista] = useState(new Date(fechaSeleccionada));

  const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Calcular inicio y fin del mes que se está visualizando
  const mesVistaActual = useMemo(() => {
    const año = mesVista.getFullYear();
    const mes = mesVista.getMonth();
    const inicio = new Date(año, mes, 1);
    const fin = new Date(año, mes + 1, 0);
    return { inicio, fin, año, mes };
  }, [mesVista]);

  // Cargar datos para el mes que se está visualizando (no solo el mes de fechaSeleccionada)
  const fechaInicioMesVista = useMemo(() => {
    const año = mesVistaActual.año;
    const mes = String(mesVistaActual.mes + 1).padStart(2, '0');
    return `${año}-${mes}-01`;
  }, [mesVistaActual]);

  const fechaFinMesVista = useMemo(() => {
    const año = mesVistaActual.año;
    const mes = String(mesVistaActual.mes + 1).padStart(2, '0');
    const ultimoDia = mesVistaActual.fin.getDate();
    return `${año}-${mes}-${String(ultimoDia).padStart(2, '0')}`;
  }, [mesVistaActual]);

  const { data: disponibilidadesMesVista } = useDisponibilidadesSemanal(fechaInicioMesVista, fechaFinMesVista);
  const { data: turnosMesVistaData } = useTurnos({
    fechaInicio: fechaInicioMesVista,
    fechaFin: fechaFinMesVista,
    perPage: 1000
  });

  // Obtener días con disponibilidad y turnos para el mes visualizado
  const diasConActividad = useMemo(() => {
    const diasDisponibles = new Set();
    const diasConTurnos = new Set();

    // Procesar disponibilidades
    if (disponibilidadesMesVista) {
      disponibilidadesMesVista.forEach(disp => {
        if (typeof disp.fecha === 'string') {
          const partes = disp.fecha.split('-');
          if (partes.length === 3) {
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10) - 1;
            const dia = parseInt(partes[2], 10);
            // Verificar que pertenezca al mes visualizado
            if (año === mesVistaActual.año && mes === mesVistaActual.mes) {
              if (disp.tipo === 'LABORAL') {
                diasDisponibles.add(dia);
              }
            }
          }
        }
      });
    }

    // Procesar turnos
    if (turnosMesVistaData) {
      let turnosList = [];
      if (Array.isArray(turnosMesVistaData)) {
        turnosList = turnosMesVistaData;
      } else if (turnosMesVistaData.data) {
        turnosList = Array.isArray(turnosMesVistaData.data) ? turnosMesVistaData.data : [];
      } else if (turnosMesVistaData.rows) {
        turnosList = turnosMesVistaData.rows || [];
      }

      turnosList.forEach(turno => {
        const fechaHoraStr = turno.fechaHora;
        let año, mes, dia;

        if (typeof fechaHoraStr === 'string') {
          const fechaParte = fechaHoraStr.split('T')[0];
          const partes = fechaParte.split('-');
          if (partes.length === 3) {
            año = parseInt(partes[0], 10);
            mes = parseInt(partes[1], 10) - 1;
            dia = parseInt(partes[2], 10);
          } else {
            return; // Skip si no podemos parsear
          }
        } else if (fechaHoraStr instanceof Date) {
          año = fechaHoraStr.getFullYear();
          mes = fechaHoraStr.getMonth();
          dia = fechaHoraStr.getDate();
        } else {
          return; // Skip si no podemos parsear
        }

        // Verificar que pertenezca al mes visualizado
        if (año === mesVistaActual.año && mes === mesVistaActual.mes) {
          diasConTurnos.add(dia);
        }
      });
    }

    return { disponibles: diasDisponibles, conTurnos: diasConTurnos };
  }, [disponibilidadesMesVista, turnosMesVistaData, mesVistaActual]);

  // Sincronizar mesVista cuando cambia fechaSeleccionada
  useEffect(() => {
    if (!mostrarCalendario) {
      setMesVista(new Date(fechaSeleccionada));
    }
  }, [fechaSeleccionada, mostrarCalendario]);

  const cambiarMes = (direccion) => {
    const nuevo = new Date(mesVista);
    nuevo.setMonth(nuevo.getMonth() + direccion);
    setMesVista(nuevo);
  };

  const irMesActual = () => {
    const hoy = new Date();
    setMesVista(hoy);
    setFechaSeleccionada(hoy);
  };

  const diasDelMes = useMemo(() => {
    const año = mesVista.getFullYear();
    const mes = mesVista.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();

    const dias = [];

    // Días vacíos al inicio
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }

    // Días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaCompleta = new Date(año, mes, dia);
      const añoStr = año.toString();
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaStr = `${añoStr}-${mesStr}-${diaStr}`;

      const hoy = new Date();
      const esPasado = fechaCompleta < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const esHoy = fechaCompleta.getDate() === hoy.getDate() &&
        fechaCompleta.getMonth() === hoy.getMonth() &&
        fechaCompleta.getFullYear() === hoy.getFullYear();
      const esSeleccionado = fechaCompleta.getDate() === fechaSeleccionada.getDate() &&
        fechaCompleta.getMonth() === fechaSeleccionada.getMonth() &&
        fechaCompleta.getFullYear() === fechaSeleccionada.getFullYear();
      // Solo mostrar disponibilidad/turnos si pertenece al mes visualizado
      const tieneDisponibilidad = diasConActividad.disponibles.has(dia);
      const tieneTurnos = diasConActividad.conTurnos.has(dia);

      dias.push({
        numero: dia,
        fecha: fechaStr,
        esPasado,
        esHoy,
        esSeleccionado,
        tieneDisponibilidad,
        tieneTurnos
      });
    }

    return dias;
  }, [mesVista, fechaSeleccionada, diasConActividad]);

  const handleClickDia = (dia) => {
    if (!dia) return;
    const nuevaFecha = new Date(dia.fecha + 'T12:00:00');
    setFechaSeleccionada(nuevaFecha);
    setMostrarCalendario(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setMostrarCalendario(!mostrarCalendario)}
        style={{
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          border: '1px solid #ddd',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}
      >
        <FaCalendarAlt />
        {mostrarCalendario ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {mostrarCalendario && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.5rem',
          background: 'white',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '280px'
        }}>
          {/* Controles */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <button
              onClick={() => cambiarMes(-1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                fontSize: '1rem',
                color: '#145c63'
              }}
            >
              <FaChevronLeft />
            </button>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
              {nombresMeses[mesVista.getMonth()]} {mesVista.getFullYear()}
            </h4>
            <button
              onClick={() => cambiarMes(1)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                fontSize: '1rem',
                color: '#145c63'
              }}
            >
              <FaChevronRight />
            </button>
          </div>

          <button
            onClick={irMesActual}
            style={{
              width: '100%',
              padding: '0.4rem',
              marginBottom: '0.75rem',
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            Ir a este mes
          </button>

          {/* Días de la semana */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.25rem',
            marginBottom: '0.5rem'
          }}>
            {nombresDias.map(dia => (
              <div key={dia} style={{
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: '#666',
                padding: '0.25rem'
              }}>
                {dia}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '0.25rem'
          }}>
            {diasDelMes.map((dia, idx) => {
              if (!dia) {
                return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />;
              }

              return (
                <button
                  key={dia.numero}
                  onClick={() => handleClickDia(dia)}
                  style={{
                    aspectRatio: '1',
                    border: dia.esSeleccionado
                      ? '2px solid #145c63'
                      : dia.esHoy
                        ? '2px solid #f59e0b'
                        : '1px solid #e0e0e0',
                    borderRadius: '6px',
                    background: dia.esSeleccionado
                      ? '#145c63'
                      : dia.esHoy
                        ? '#fef3c7'
                        : dia.tieneTurnos
                          ? '#dbeafe'
                          : dia.tieneDisponibilidad
                            ? '#d1fae5'
                            : '#f5f5f5',
                    color: dia.esSeleccionado
                      ? 'white'
                      : dia.esPasado
                        ? '#666'
                        : '#333',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: dia.esSeleccionado || dia.esHoy ? '600' : '400',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    opacity: dia.esPasado ? 0.7 : 1
                  }}
                  title={dia.tieneTurnos ? 'Tiene turnos' : dia.tieneDisponibilidad ? 'Tiene disponibilidad' : dia.esPasado ? 'Día pasado' : ''}
                >
                  {dia.numero}
                  {(dia.tieneTurnos || dia.tieneDisponibilidad) && !dia.esSeleccionado && (
                    <div style={{
                      position: 'absolute',
                      bottom: '2px',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: dia.tieneTurnos ? '#3b82f6' : '#10b981'
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Leyenda */}
          <div style={{
            marginTop: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e0e0e0',
            fontSize: '0.7rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#d1fae5', border: '1px solid #10b981', borderRadius: '4px' }} />
              <span>Disponible</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '12px', height: '12px', background: '#dbeafe', border: '1px solid #3b82f6', borderRadius: '4px' }} />
              <span>Con turnos</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AgendaDiaria({ soloConDisponibilidad = true, setSoloConDisponibilidad }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [fechaSeleccionada, setFechaSeleccionada] = useState(new Date());
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [horaActual, setHoraActual] = useState(new Date());

  // CU-AG01.4 Flujo Alternativo 4a: Estado para cancelación múltiple
  const [modoSeleccionMultiple, setModoSeleccionMultiple] = useState(false);
  const [turnosSeleccionados, setTurnosSeleccionados] = useState([]);
  const [modalCancelacionMultiple, setModalCancelacionMultiple] = useState(false);

  // Estado para modal de búsqueda
  const [modalBusquedaAbierto, setModalBusquedaAbierto] = useState(false);

  // CU-AG01.5: Estado para vista semanal y filtros
  const [vista, setVista] = useState('diaria'); // 'diaria' | 'semanal'
  const [filtroEstado, setFiltroEstado] = useState(''); // '' | 'PENDIENTE' | 'ASISTIO' | 'AUSENTE' | 'CANCELADO'
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // CU-AG01.6: Filtros adicionales
  const [filtroOdontologos, setFiltroOdontologos] = useState([]); // Array de IDs de odontólogos seleccionados
  const [filtroTratamiento, setFiltroTratamiento] = useState(''); // Buscador de tratamiento/motivo

  // CU-AG01.5: Verificar si el usuario es odontólogo
  const esOdontologo = useMemo(() => {
    return user?.Rol?.nombre?.toUpperCase() === 'ODONTÓLOGO';
  }, [user]);

  // CU-AG01.5: Pasar odontologoId si es odontólogo (debe estar antes de semanaActual)
  const odontologoIdParaConsulta = useMemo(() => {
    if (esOdontologo && user?.id) {
      return user.id;
    }
    return null;
  }, [esOdontologo, user]);

  // CU-AG01.5: Calcular inicio y fin de semana para vista semanal
  const semanaActual = useMemo(() => {
    if (vista === 'semanal') {
      const fecha = new Date(fechaSeleccionada);
      const diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, etc.
      const inicioSemana = new Date(fecha);
      inicioSemana.setDate(fecha.getDate() - diaSemana + 1); // Lunes de la semana
      inicioSemana.setHours(0, 0, 0, 0);

      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6); // Domingo de la semana
      finSemana.setHours(23, 59, 59, 999);

      // Generar array de 7 días
      const dias = [];
      for (let i = 0; i < 7; i++) {
        const dia = new Date(inicioSemana);
        dia.setDate(inicioSemana.getDate() + i);
        dias.push(dia);
      }

      return { inicioSemana, finSemana, dias };
    }
    return null;
  }, [vista, fechaSeleccionada]);

  // CU-AG01.5: Cargar turnos de la semana completa usando el endpoint de turnos con rango
  const { data: turnosSemanaData, isLoading: loadingTurnosSemana } = useTurnos({
    fechaInicio: semanaActual ? semanaActual.inicioSemana.toISOString() : null,
    fechaFin: semanaActual ? semanaActual.finSemana.toISOString() : null,
    odontologoId: odontologoIdParaConsulta,
    perPage: 1000 // Cargar muchos turnos para la semana
  });

  // Cargar disponibilidades de la semana
  const fechaInicioSemanaStr = useMemo(() => {
    if (!semanaActual) return null;
    return formatDate(semanaActual.inicioSemana);
  }, [semanaActual]);

  const fechaFinSemanaStr = useMemo(() => {
    if (!semanaActual) return null;
    return formatDate(semanaActual.finSemana);
  }, [semanaActual]);

  const { data: disponibilidadesSemana, isLoading: loadingDisponibilidadesSemana } = useDisponibilidadesSemanal(
    fechaInicioSemanaStr,
    fechaFinSemanaStr
  );

  // CU-AG01.5: Organizar turnos por día de la semana
  const turnosPorDia = useMemo(() => {
    if (vista !== 'semanal' || !semanaActual || !turnosSemanaData) return {};

    // Extraer turnos del formato de respuesta
    let turnosList = [];
    if (Array.isArray(turnosSemanaData)) {
      turnosList = turnosSemanaData;
    } else if (turnosSemanaData.data) {
      turnosList = Array.isArray(turnosSemanaData.data) ? turnosSemanaData.data : [];
    } else if (turnosSemanaData.rows) {
      turnosList = turnosSemanaData.rows || [];
    }

    // Aplicar filtros
    let turnosFiltrados = turnosList;
    if (filtroEstado) {
      turnosFiltrados = turnosFiltrados.filter(t => t.estado === filtroEstado);
    }
    if (filtroPaciente) {
      const busqueda = filtroPaciente.toLowerCase();
      turnosFiltrados = turnosFiltrados.filter(t =>
        t.Paciente?.nombre?.toLowerCase().includes(busqueda) ||
        t.Paciente?.apellido?.toLowerCase().includes(busqueda) ||
        t.Paciente?.dni?.includes(busqueda)
      );
    }

    // Organizar por día
    const porDia = {};
    semanaActual.dias.forEach((dia, index) => {
      const diaStr = formatDate(dia);
      porDia[index] = turnosFiltrados.filter(turno => {
        const fechaTurno = new Date(turno.fechaHora);
        return fechaTurno.toISOString().split('T')[0] === diaStr;
      });
    });

    return porDia;
  }, [vista, semanaActual, turnosSemanaData, filtroEstado, filtroPaciente]);

  const fechaStr = useMemo(() => formatDate(fechaSeleccionada), [fechaSeleccionada]);

  // Estado para el mes visualizado en el mini calendario
  const [mesVistaCalendario, setMesVistaCalendario] = useState(new Date(fechaSeleccionada));

  // Sincronizar mesVistaCalendario cuando cambia fechaSeleccionada
  useEffect(() => {
    setMesVistaCalendario(new Date(fechaSeleccionada));
  }, [fechaSeleccionada]);

  // Calcular inicio y fin del mes actual para cargar disponibilidades
  const mesActual = useMemo(() => {
    const año = fechaSeleccionada.getFullYear();
    const mes = fechaSeleccionada.getMonth();
    const inicio = new Date(año, mes, 1);
    const fin = new Date(año, mes + 1, 0);
    return { inicio, fin };
  }, [fechaSeleccionada]);

  // Calcular inicio y fin del mes visualizado en el mini calendario
  const mesVistaCalendarioCalculado = useMemo(() => {
    const año = mesVistaCalendario.getFullYear();
    const mes = mesVistaCalendario.getMonth();
    const inicio = new Date(año, mes, 1);
    const fin = new Date(año, mes + 1, 0);
    return { inicio, fin };
  }, [mesVistaCalendario]);

  // Cargar disponibilidades del mes visualizado en el mini calendario
  const fechaInicioMes = useMemo(() => formatDate(mesVistaCalendarioCalculado.inicio), [mesVistaCalendarioCalculado]);
  const fechaFinMes = useMemo(() => formatDate(mesVistaCalendarioCalculado.fin), [mesVistaCalendarioCalculado]);
  const { data: disponibilidadesMes } = useDisponibilidadesSemanal(fechaInicioMes, fechaFinMes);

  // Cargar turnos del mes visualizado en el mini calendario
  const { data: turnosMesData } = useTurnos({
    fechaInicio: fechaInicioMes,
    fechaFin: fechaFinMes,
    odontologoId: odontologoIdParaConsulta,
    perPage: 1000
  });

  // Obtener días con disponibilidad y turnos en el mes
  const diasConActividad = useMemo(() => {
    const diasDisponibles = new Set();
    const diasConTurnos = new Set();

    // Procesar disponibilidades - parsear fecha manualmente para evitar problemas de zona horaria
    if (disponibilidadesMes) {
      disponibilidadesMes.forEach(disp => {
        if (typeof disp.fecha === 'string') {
          const partes = disp.fecha.split('-');
          if (partes.length === 3) {
            const año = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10) - 1;
            const dia = parseInt(partes[2], 10);
            // Verificar que pertenezca al mes visualizado en el mini calendario
            if (año === mesVistaCalendarioCalculado.inicio.getFullYear() && mes === mesVistaCalendarioCalculado.inicio.getMonth()) {
              if (disp.tipo === 'LABORAL') {
                diasDisponibles.add(dia);
              }
            }
          }
        }
      });
    }

    // Procesar turnos del mes - parsear fecha manualmente para evitar problemas de zona horaria
    if (turnosMesData) {
      let turnosList = [];
      if (Array.isArray(turnosMesData)) {
        turnosList = turnosMesData;
      } else if (turnosMesData.data) {
        turnosList = Array.isArray(turnosMesData.data) ? turnosMesData.data : [];
      } else if (turnosMesData.rows) {
        turnosList = turnosMesData.rows || [];
      }

      turnosList.forEach(turno => {
        // Parsear fechaHora manualmente para evitar problemas de zona horaria
        const fechaHoraStr = turno.fechaHora;
        let año, mes, dia;

        if (typeof fechaHoraStr === 'string') {
          // Formato ISO: "2025-11-24T10:00:00.000Z" o "2025-11-24T10:00:00"
          const fechaParte = fechaHoraStr.split('T')[0];
          const partes = fechaParte.split('-');
          if (partes.length === 3) {
            año = parseInt(partes[0], 10);
            mes = parseInt(partes[1], 10) - 1;
            dia = parseInt(partes[2], 10);
          } else {
            // Fallback: usar Date pero con mediodía para evitar problemas
            const fechaTurno = new Date(fechaHoraStr + 'T12:00:00');
            año = fechaTurno.getFullYear();
            mes = fechaTurno.getMonth();
            dia = fechaTurno.getDate();
          }
        } else if (fechaHoraStr instanceof Date) {
          año = fechaHoraStr.getFullYear();
          mes = fechaHoraStr.getMonth();
          dia = fechaHoraStr.getDate();
        } else {
          return; // Skip si no podemos parsear
        }

        // Verificar que pertenezca al mes visualizado en el mini calendario
        if (año === mesVistaCalendarioCalculado.inicio.getFullYear() && mes === mesVistaCalendarioCalculado.inicio.getMonth()) {
          diasConTurnos.add(dia);
        }
      });
    }

    return { disponibles: diasDisponibles, conTurnos: diasConTurnos };
  }, [disponibilidadesMes, turnosMesData, mesVistaCalendarioCalculado]);

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

  // Calcular posición de la línea de hora actual (en píxeles)
  const calcularPosicionLineaActual = () => {
    if (!esHoy) return null;

    const ahora = horaActual;
    // Usar zona horaria de Argentina para la hora actual
    const { hora, minutos } = getHoraArgentina(ahora);
    const horaMinutos = hora * 60 + minutos;
    const inicioJornadaMinutos = INICIO_JORNADA * 60;
    const finJornadaMinutos = FIN_JORNADA * 60;

    // Si estamos fuera del horario laboral, no mostrar la línea
    if (horaMinutos < inicioJornadaMinutos || horaMinutos >= finJornadaMinutos) {
      return null;
    }

    // Calcular posición en píxeles
    // Cada fila de la tabla tiene 80px de altura (según el CSS)
    // Cada fila representa un slot de 30 minutos (SLOT_MINUTOS)
    const minutosDesdeInicio = horaMinutos - inicioJornadaMinutos;

    // Calcular qué slot (fila) corresponde a esta hora
    const slotIndex = Math.floor(minutosDesdeInicio / SLOT_MINUTOS);

    // Calcular el offset dentro del slot (0-30 minutos)
    const minutosEnSlot = minutosDesdeInicio % SLOT_MINUTOS;
    const offsetEnSlot = (minutosEnSlot / SLOT_MINUTOS) * 80; // 80px es la altura de cada fila

    // Altura del header de la tabla (thead) - aproximadamente 60px
    const headerHeight = 60;

    // Posición total en píxeles desde el top del contenedor
    const topPixels = headerHeight + (slotIndex * 80) + offsetEnSlot;

    return {
      topPixels,
      hora: `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`
    };
  };

  const lineaActual = calcularPosicionLineaActual();

  // Cargar datos
  // CU-AG01.5: Si es odontólogo, no cargar todos los odontólogos, solo filtrar por el suyo
  const { data: odontologosData, isLoading: loadingOdontologos } = useOdontologosPorEspecialidad();

  const { data: turnosData, isLoading: loadingTurnos, refetch: refetchTurnos } = useTurnosPorFecha(fechaStr, odontologoIdParaConsulta);
  const { data: disponibilidades, isLoading: loadingDisponibilidades } = useDisponibilidadesSemanal(fechaStr, fechaStr);

  // CU-AG01.5 y CU-AG01.6: Filtrar odontólogos si es odontólogo o según filtro
  const odontologos = useMemo(() => {
    if (!odontologosData) return [];
    let odontologosFiltrados = odontologosData;

    // Si es odontólogo, solo mostrar el suyo
    if (esOdontologo && user?.id) {
      odontologosFiltrados = odontologosFiltrados.filter(odonto => odonto.userId === user.id);
    }

    // CU-AG01.6: Aplicar filtro de odontólogos seleccionados
    if (filtroOdontologos.length > 0) {
      odontologosFiltrados = odontologosFiltrados.filter(odonto =>
        filtroOdontologos.includes(odonto.userId)
      );
    }

    // Filtrar solo odontólogos con disponibilidad activa ese día - Solo en vista diaria
    // En vista semanal, se muestran todos los odontólogos que tienen turnos o disponibilidades en la semana
    if (vista === 'diaria' && soloConDisponibilidad && disponibilidades) {
      const fechaSeleccionadaStr = formatDate(fechaSeleccionada);
      const odontologosConDisponibilidad = new Set();

      disponibilidades.forEach(disp => {
        if (disp.fecha === fechaSeleccionadaStr && disp.tipo === 'LABORAL') {
          odontologosConDisponibilidad.add(disp.odontologoId);
        }
      });

      odontologosFiltrados = odontologosFiltrados.filter(odonto =>
        odontologosConDisponibilidad.has(odonto.userId)
      );
    }

    return odontologosFiltrados;
  }, [odontologosData, esOdontologo, user, filtroOdontologos, soloConDisponibilidad, disponibilidades, fechaSeleccionada, vista]);

  // Extraer turnos del array y aplicar filtros
  const turnos = useMemo(() => {
    if (!turnosData) return [];
    let turnosList = Array.isArray(turnosData) ? turnosData : (turnosData.data || []);

    // Filtrar por fecha seleccionada (comparar solo la fecha, sin hora, para evitar problemas de zona horaria)
    const fechaSeleccionadaStr = formatDate(fechaSeleccionada);
    turnosList = turnosList.filter(t => {
      if (!t.fechaHora) return false;
      const fechaTurno = new Date(t.fechaHora);
      const fechaTurnoStr = formatDate(fechaTurno);
      return fechaTurnoStr === fechaSeleccionadaStr;
    });

    // CU-AG01.5 y CU-AG01.6: Aplicar filtros
    // Por defecto, excluir turnos cancelados (a menos que se seleccione explícitamente el filtro CANCELADO)
    if (filtroEstado) {
      turnosList = turnosList.filter(t => t.estado === filtroEstado);
    } else {
      // Si no hay filtro de estado, excluir cancelados por defecto
      turnosList = turnosList.filter(t => t.estado !== 'CANCELADO');
    }
    if (filtroPaciente) {
      const busqueda = filtroPaciente.toLowerCase();
      turnosList = turnosList.filter(t =>
        t.Paciente?.nombre?.toLowerCase().includes(busqueda) ||
        t.Paciente?.apellido?.toLowerCase().includes(busqueda) ||
        t.Paciente?.dni?.includes(busqueda)
      );
    }
    // CU-AG01.6: Filtro por tratamiento/motivo
    if (filtroTratamiento) {
      const busqueda = filtroTratamiento.toLowerCase();
      turnosList = turnosList.filter(t =>
        t.motivo?.toLowerCase().includes(busqueda)
      );
    }
    // CU-AG01.6: Filtro por odontólogo (si hay filtro activo)
    if (filtroOdontologos.length > 0) {
      turnosList = turnosList.filter(t =>
        filtroOdontologos.includes(t.odontologoId)
      );
    }

    return turnosList;
  }, [turnosData, fechaSeleccionada, filtroEstado, filtroPaciente, filtroTratamiento, filtroOdontologos]);

  // Determinar el rango horario dinámico según disponibilidades/turnos
  const { horarioMinimo, horarioMaximo } = useMemo(() => {
    let min = INICIO_JORNADA * 60;
    let max = FIN_JORNADA * 60;

    turnos.forEach((turno) => {
      // Usar zona horaria de Argentina para obtener las horas correctas
      const inicioStr = getHoraStringArgentina(turno.fechaHora);
      const inicioMin = horaStringToMinutes(inicioStr);
      const finMin = inicioMin + (turno.duracion || 30);
      min = Math.min(min, inicioMin);
      max = Math.max(max, finMin);
    });

    disponibilidades
      ?.filter((disp) => disp.fecha === fechaStr)
      ?.forEach((disp) => {
        const inicioMin = horaStringToMinutes(normalizarHora(disp.horaInicio));
        const finMin = horaStringToMinutes(normalizarHora(disp.horaFin));
        min = Math.min(min, inicioMin);
        max = Math.max(max, finMin);
      });

    // Añadir margen mínimo de 60 minutos para evitar vistas vacías
    const minAjustado = Math.max(INICIO_JORNADA * 60, Math.floor(min / SLOT_MINUTOS) * SLOT_MINUTOS);
    const maxAjustado = Math.min(
      FIN_JORNADA * 60,
      Math.max(minAjustado + 60, Math.ceil(max / SLOT_MINUTOS) * SLOT_MINUTOS)
    );

    return {
      horarioMinimo: minAjustado,
      horarioMaximo: maxAjustado
    };
  }, [turnos, disponibilidades, fechaStr]);

  const HORARIOS = useMemo(
    () => generarHorarios(horarioMinimo, horarioMaximo),
    [horarioMinimo, horarioMaximo]
  );

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

  // Verificar si un horario está dentro de la disponibilidad laboral (intervalos dinámicos)
  const estaDisponible = (odontologoId, hora) => {
    if (!disponibilidades) return false;

    const dispOdontologo = disponibilidades.filter(
      d => d.odontologoId === odontologoId && d.fecha === fechaStr && d.tipo === 'LABORAL'
    );

    const slotMin = horaStringToMinutes(hora);

    for (const disp of dispOdontologo) {
      const inicioMin = horaStringToMinutes(normalizarHora(disp.horaInicio));
      const finMin = horaStringToMinutes(normalizarHora(disp.horaFin));

      if (slotMin >= inicioMin && slotMin < finMin) {
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

    const slotMin = horaStringToMinutes(hora);

    for (const bloqueo of bloqueos) {
      const horaInicio = normalizarHora(bloqueo.horaInicio);
      const horaFin = normalizarHora(bloqueo.horaFin);
      const inicioMin = horaStringToMinutes(horaInicio);
      const finMin = horaStringToMinutes(horaFin);

      if (slotMin >= inicioMin && slotMin < finMin) {
        return bloqueo;
      }
    }

    return null;
  };

  // Obtener turno en un horario específico (bloques de 30 minutos)
  const obtenerTurno = (odontologoId, hora) => {
    if (!turnos) return null;

    const horaSlotMin = horaStringToMinutes(hora);

    for (const turno of turnos) {
      if (turno.odontologoId !== odontologoId) continue;

      // Usar zona horaria de Argentina para obtener las horas correctas
      const horaInicioStr = getHoraStringArgentina(turno.fechaHora);
      const turnoFecha = new Date(turno.fechaHora);
      const horaFin = new Date(turnoFecha.getTime() + (turno.duracion || 30) * 60000);
      const horaFinStr = getHoraStringArgentina(horaFin);

      const inicioMin = horaStringToMinutes(horaInicioStr);
      const finMin = horaStringToMinutes(horaFinStr);

      // Calcular el slot de inicio del turno (redondear hacia abajo al slot de 30 min más cercano)
      const inicioSlot = Math.floor(inicioMin / SLOT_MINUTOS) * SLOT_MINUTOS;

      // El turno se muestra en este slot si:
      // 1. Este slot es donde empieza el turno (redondeado al slot de 30 min), O
      // 2. Este slot está dentro del rango del turno
      const esSlotInicio = horaSlotMin === inicioSlot;
      const estaEnRango = horaSlotMin >= inicioMin && horaSlotMin < finMin;

      if (esSlotInicio || estaEnRango) {
        return {
          ...turno,
          esInicio: esSlotInicio, // Es inicio si estamos en el slot donde empieza (redondeado)
          horaInicioStr,
          horaFinStr
        };
      }
    }

    return null;
  };

  // CU-AG01.4: Manejar selección de turno para cancelación múltiple
  const handleToggleSeleccionTurno = (turno) => {
    if (!modoSeleccionMultiple) return;

    setTurnosSeleccionados(prev => {
      const existe = prev.find(t => t.id === turno.id);
      if (existe) {
        return prev.filter(t => t.id !== turno.id);
      } else {
        // Solo permitir seleccionar turnos PENDIENTES
        if (turno.estado === 'PENDIENTE') {
          return [...prev, turno];
        } else {
          showToast('Solo se pueden cancelar turnos pendientes', 'warning');
          return prev;
        }
      }
    });
  };

  // CU-AG01.4: Manejar click en celda
  const handleClickCelda = (odontologoId, hora, e) => {
    // CU-AG01.5: Si es odontólogo, solo puede ver turnos, no crear
    if (esOdontologo) {
      const turno = obtenerTurno(odontologoId, hora);
      if (turno) {
        // Solo puede abrir detalles del turno
        setTurnoSeleccionado(turno);
        setModalAbierto(true);
      }
      return;
    }

    // Si está en modo selección múltiple y hay un turno, toggle selección
    if (modoSeleccionMultiple) {
      const turno = obtenerTurno(odontologoId, hora);
      if (turno) {
        e?.stopPropagation();
        handleToggleSeleccionTurno(turno);
        return;
      }
    }

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
      // Ir a crear turno con datos pre-cargados (solo recepcionista)
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

  // CU-AG01.4: Activar/desactivar modo selección múltiple
  const toggleModoSeleccionMultiple = () => {
    if (modoSeleccionMultiple) {
      setTurnosSeleccionados([]);
    }
    setModoSeleccionMultiple(!modoSeleccionMultiple);
  };

  // CU-AG01.4: Abrir modal de cancelación múltiple
  const handleAbrirCancelacionMultiple = () => {
    if (turnosSeleccionados.length === 0) {
      showToast('Debe seleccionar al menos un turno', 'warning');
      return;
    }
    setModalCancelacionMultiple(true);
  };

  const estaCargandoTodo = loadingOdontologos || loadingTurnos || loadingDisponibilidades;

  return (
    <div className="agenda-diaria-container" style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 120px)' }}>
      {/* Sidebar con mini calendario */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <MiniCalendarioSidebar
          fechaSeleccionada={fechaSeleccionada}
          setFechaSeleccionada={setFechaSeleccionada}
          disponibilidadesMes={disponibilidadesMes}
          turnosMesData={turnosMesData}
          mesActual={mesActual}
          onMesVistaChange={setMesVistaCalendario}
        />

        {/* Checkbox para filtrar solo odontólogos con disponibilidad - Solo en vista diaria */}
        {setSoloConDisponibilidad && vista === 'diaria' && (
          <div style={{
            background: 'white',
            borderRadius: '6px',
            padding: '1rem',
            boxShadow: '0 2px 6px rgba(170, 147, 147, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
              color: '#1c1c1e',
              userSelect: 'none',
              width: '100%'
            }}>
              <input
                type="checkbox"
                checked={soloConDisponibilidad}
                onChange={(e) => setSoloConDisponibilidad(e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                  accentColor: '#145c63'
                }}
              />
              <span>Disponibilidad activa</span>
            </label>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Controles de navegación compactos - Se adaptan según la vista */}
        <div className="controles-fecha" style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          marginBottom: '0.75rem',
          flexWrap: 'wrap'
        }}>
          {vista === 'semanal' ? (
            <>
              <button
                onClick={() => {
                  const nuevaFecha = new Date(semanaActual.inicioSemana);
                  nuevaFecha.setDate(nuevaFecha.getDate() - 7);
                  setFechaSeleccionada(nuevaFecha);
                }}
                className="btn-nav"
              >
                <FaChevronLeft /> Ant
              </button>

              <div className="fecha-selector">
                {semanaActual?.dias[0]?.toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} -
                {semanaActual?.dias[6]?.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              <button
                onClick={() => {
                  const hoy = new Date();
                  setFechaSeleccionada(hoy);
                }}
                className="btn-hoy"
              >
                Hoy
              </button>

              <button
                onClick={() => {
                  const nuevaFecha = new Date(semanaActual.inicioSemana);
                  nuevaFecha.setDate(nuevaFecha.getDate() + 7);
                  setFechaSeleccionada(nuevaFecha);
                }}
                className="btn-nav"
              >
                Sig <FaChevronRight />
              </button>
            </>
          ) : (
            <>
              <button className="btn-nav" onClick={irDiaAnterior}>
                <FaChevronLeft /> Ant
              </button>

              <div className="fecha-selector">
                {formatDateReadable(fechaSeleccionada)}
              </div>

              <button className="btn-hoy" onClick={irHoy}>
                Hoy
              </button>

              <button className="btn-nav" onClick={irDiaSiguiente}>
                Sig <FaChevronRight />
              </button>
            </>
          )}

          {/* CU-AG01.5: Controles de vista y filtros */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '1rem' }}>
            <button
              className={`btn-vista ${vista === 'semanal' ? 'active' : ''}`}
              onClick={() => setVista(vista === 'diaria' ? 'semanal' : 'diaria')}
            >
              <FaCalendarWeek /> {vista === 'diaria' ? 'Vista Semanal' : 'Vista Diaria'}
            </button>

            <button
              className={`btn-filtro ${mostrarFiltros ? 'active' : ''}`}
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
              <FaFilter /> Filtros
            </button>
          </div>


          {/* CU-AG01.4: Controles de cancelación múltiple - Solo recepcionista */}
          {!esOdontologo && (
            <div className="controles-seleccion-multiple" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                className={`btn-seleccion-multiple ${modoSeleccionMultiple ? 'active' : ''}`}
                onClick={toggleModoSeleccionMultiple}
              >
                <FaCheckSquare /> {modoSeleccionMultiple ? 'Cancelar selección' : 'Seleccionar turnos'}
              </button>

              {modoSeleccionMultiple && turnosSeleccionados.length > 0 && (
                <>
                  <span style={{ color: '#7f8c8d' }}>
                    {turnosSeleccionados.length} seleccionado(s)
                  </span>
                  <button
                    className="btn-cancelar-multiple"
                    onClick={handleAbrirCancelacionMultiple}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#e74c3c',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '600'
                    }}
                  >
                    <FaBan /> Cancelar {turnosSeleccionados.length} turno(s)
                  </button>
                </>
              )}
            </div>
          )}
        </div>


        {/* CU-AG01.5 y CU-AG01.6: Panel de filtros */}
        {mostrarFiltros && (
          <div style={{
            marginBottom: '1rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Estado:</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    minWidth: '150px'
                  }}
                >
                  <option value="">Todos</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="ASISTIO">Asistió</option>
                  <option value="AUSENTE">Ausente</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Paciente:</label>
                <input
                  type="text"
                  value={filtroPaciente}
                  onChange={(e) => setFiltroPaciente(e.target.value)}
                  placeholder="Buscar por nombre, apellido o DNI..."
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    minWidth: '200px'
                  }}
                />
              </div>

              {/* CU-AG01.6: Filtro por odontólogo */}
              {!esOdontologo && odontologosData && odontologosData.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Odontólogos:</label>
                  <div style={{
                    maxHeight: '120px',
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    background: 'white',
                    minWidth: '200px'
                  }}>
                    {odontologosData.map(odonto => (
                      <label key={odonto.userId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={filtroOdontologos.includes(odonto.userId)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFiltroOdontologos([...filtroOdontologos, odonto.userId]);
                            } else {
                              setFiltroOdontologos(filtroOdontologos.filter(id => id !== odonto.userId));
                            }
                          }}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{ fontSize: '0.85rem' }}>
                          Dr. {odonto.Usuario?.nombre} {odonto.Usuario?.apellido}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* CU-AG01.6: Filtro por tratamiento/motivo */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Tratamiento/Motivo:</label>
                <input
                  type="text"
                  value={filtroTratamiento}
                  onChange={(e) => setFiltroTratamiento(e.target.value)}
                  placeholder="Buscar por motivo o tratamiento..."
                  style={{
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    minWidth: '200px'
                  }}
                />
              </div>

              <button
                onClick={() => {
                  setFiltroEstado('');
                  setFiltroPaciente('');
                  setFiltroTratamiento('');
                  setFiltroOdontologos([]);
                }}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer',
                  marginTop: '1.5rem'
                }}
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}

        {/* CU-AG01.5: Vista semanal o diaria */}
        {estaCargandoTodo ? (
          <div className="pacientes-loader" style={{ flex: 1 }}>
            <Lottie animationData={loadingAnim} loop autoplay style={{ width: 180 }} />
            <p style={{ marginTop: '1rem', fontWeight: '850', color: '#145c63' }}>Cargando agenda del día...</p>
          </div>
        ) : vista === 'semanal' ? (
          <div>
            {/* Tabla semanal tipo calendario */}
            {/* En vista semanal, mostrar todos los odontólogos que tienen turnos o disponibilidades en la semana */}
            {(() => {
              // Para la vista semanal, obtener odontólogos que tienen actividad en la semana
              let odontologosSemana = odontologos;
              if (vista === 'semanal' && semanaActual) {
                const odontologosConActividad = new Set();

                // Agregar odontólogos con turnos en la semana
                if (turnosSemanaData) {
                  let turnosList = [];
                  if (Array.isArray(turnosSemanaData)) {
                    turnosList = turnosSemanaData;
                  } else if (turnosSemanaData.data) {
                    turnosList = Array.isArray(turnosSemanaData.data) ? turnosSemanaData.data : [];
                  } else if (turnosSemanaData.rows) {
                    turnosList = turnosSemanaData.rows || [];
                  }

                  turnosList.forEach(turno => {
                    if (turno.odontologoId) {
                      odontologosConActividad.add(turno.odontologoId);
                    }
                  });
                }

                // Agregar odontólogos con disponibilidades en la semana
                if (disponibilidadesSemana) {
                  disponibilidadesSemana.forEach(disp => {
                    if (disp.tipo === 'LABORAL' && disp.odontologoId) {
                      odontologosConActividad.add(disp.odontologoId);
                    }
                  });
                }

                // Filtrar odontólogos que tienen actividad en la semana
                if (odontologosConActividad.size > 0) {
                  odontologosSemana = odontologos.filter(odonto =>
                    odontologosConActividad.has(odonto.userId)
                  );
                }
              }

              return odontologosSemana;
            })().length > 0 ? (
              <div className="agenda-tabla-container" style={{
                flex: 1,
                overflow: 'auto',
                maxHeight: 'calc(100vh - 280px)'
              }}>
                <table className="agenda-tabla" style={{ fontSize: '0.85rem' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
                    <tr>
                      <th className="col-hora" style={{
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        width: '60px',
                        minWidth: '60px',
                        color: '#1f2937',
                        fontWeight: '600',
                        background: '#f7f9fc',
                        borderRight: '1px solid #e5e8ef'
                      }}>Hora</th>
                      {semanaActual.dias.map((dia, diaIndex) => {
                        const diaStr = formatDate(dia);
                        const esHoyDia = diaStr === formatDate(new Date());
                        const nombreDia = dia.toLocaleDateString('es-AR', { weekday: 'short' });
                        const numeroDia = dia.getDate();

                        return (
                          <th key={diaIndex} style={{
                            padding: '0.5rem',
                            minWidth: '200px',
                            background: esHoyDia ? '#fef3c7' : '#f7f9fc',
                            borderRight: '1px solid #e5e8ef',
                            borderLeft: diaIndex === 0 ? '1px solid #e5e8ef' : 'none'
                          }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}>
                              <div style={{
                                fontSize: '0.7rem',
                                color: '#667085',
                                textTransform: 'uppercase',
                                fontWeight: '500'
                              }}>
                                {nombreDia}
                              </div>
                              <div style={{
                                fontSize: '1rem',
                                fontWeight: '700',
                                color: esHoyDia ? '#92400e' : '#1c1c1e'
                              }}>
                                {numeroDia}
                              </div>
                            </div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {HORARIOS.map((hora) => (
                      <tr key={hora} style={{ height: 'auto' }}>
                        <td className="celda-hora" style={{
                          padding: '0.4rem',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          textAlign: 'center',
                          color: '#374151',
                          background: '#f7f9fc',
                          borderRight: '1px solid #e5e8ef',
                          borderBottom: '1px solid #f0f0f0'
                        }}>{hora}</td>
                        {semanaActual.dias.map((dia, diaIndex) => {
                          const diaStr = formatDate(dia);
                          const esHoyDia = diaStr === formatDate(new Date());

                          return (
                            <td
                              key={diaIndex}
                              style={{
                                padding: '0.25rem',
                                textAlign: 'center',
                                verticalAlign: 'top',
                                borderRight: '1px solid #f0f0f0',
                                borderBottom: '1px solid #f0f0f0',
                                background: esHoyDia ? '#fef3c7' : 'white',
                                minHeight: '60px',
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minHeight: '50px' }}>
                                {/* Mostrar disponibilidades para cada odontólogo */}
                                {(() => {
                                  // Para la vista semanal, obtener odontólogos que tienen actividad en la semana
                                  let odontologosSemana = odontologos;
                                  if (vista === 'semanal' && semanaActual) {
                                    const odontologosConActividad = new Set();

                                    // Agregar odontólogos con turnos en la semana
                                    if (turnosSemanaData) {
                                      let turnosList = [];
                                      if (Array.isArray(turnosSemanaData)) {
                                        turnosList = turnosSemanaData;
                                      } else if (turnosSemanaData.data) {
                                        turnosList = Array.isArray(turnosSemanaData.data) ? turnosSemanaData.data : [];
                                      } else if (turnosSemanaData.rows) {
                                        turnosList = turnosSemanaData.rows || [];
                                      }

                                      turnosList.forEach(turno => {
                                        if (turno.odontologoId) {
                                          odontologosConActividad.add(turno.odontologoId);
                                        }
                                      });
                                    }

                                    // Agregar odontólogos con disponibilidades en la semana
                                    if (disponibilidadesSemana) {
                                      disponibilidadesSemana.forEach(disp => {
                                        if (disp.tipo === 'LABORAL' && disp.odontologoId) {
                                          odontologosConActividad.add(disp.odontologoId);
                                        }
                                      });
                                    }

                                    // Filtrar odontólogos que tienen actividad en la semana
                                    if (odontologosConActividad.size > 0) {
                                      odontologosSemana = odontologos.filter(odonto =>
                                        odontologosConActividad.has(odonto.userId)
                                      );
                                    }
                                  }

                                  return odontologosSemana;
                                })().map((odontologo) => {
                                  // Buscar disponibilidad para este odontólogo, día y hora
                                  const disponibilidadesDelDia = disponibilidadesSemana?.filter(disp =>
                                    disp.fecha === diaStr &&
                                    disp.odontologoId === odontologo.userId &&
                                    disp.tipo === 'LABORAL'
                                  ) || [];

                                  const estaDisponible = disponibilidadesDelDia.some(disp => {
                                    const slotMin = horaStringToMinutes(hora);
                                    const inicioMin = horaStringToMinutes(normalizarHora(disp.horaInicio));
                                    const finMin = horaStringToMinutes(normalizarHora(disp.horaFin));
                                    return slotMin >= inicioMin && slotMin < finMin;
                                  });

                                  // Buscar turno para este odontólogo, día y hora
                                  const turnosDelOdontologo = turnosPorDia[diaIndex]?.filter(t =>
                                    t.odontologoId === odontologo.userId
                                  ) || [];

                                  const turnoEnHora = turnosDelOdontologo.find(t => {
                                    const fechaTurno = new Date(t.fechaHora);
                                    const turnoHora = getHoraStringArgentina(fechaTurno);
                                    return turnoHora === hora;
                                  });

                                  if (turnoEnHora) {
                                    const fechaTurno = new Date(turnoEnHora.fechaHora);
                                    const horaInicioStr = getHoraStringArgentina(fechaTurno);
                                    const turnoFecha = new Date(turnoEnHora.fechaHora);
                                    const horaFinStr = getHoraStringArgentina(new Date(turnoFecha.getTime() + (turnoEnHora.duracion || 30) * 60000));

                                    // CU-AG01.5: Calcular indicadores de tiempo
                                    const ahora = new Date();
                                    const minutosHastaTurno = Math.floor((fechaTurno - ahora) / (1000 * 60));
                                    const minutosRetraso = Math.floor((ahora - fechaTurno) / (1000 * 60));
                                    const esProximo = minutosHastaTurno >= 0 && minutosHastaTurno <= 30;
                                    const tieneRetraso = minutosRetraso > 0 && turnoEnHora.estado === 'PENDIENTE';

                                    return (
                                      <div
                                        key={odontologo.userId}
                                        className={`turno-card-semanal ${esProximo ? 'turno-proximo' : ''} ${tieneRetraso ? 'turno-retraso' : ''}`}
                                        onClick={() => {
                                          setTurnoSeleccionado(turnoEnHora);
                                          setModalAbierto(true);
                                        }}
                                        style={{
                                          background: esProximo ? '#fef3c7' : tieneRetraso ? '#fee2e2' : coloresPorOdontologo[odontologo.userId]?.bg || '#dbeafe',
                                          border: `2px solid ${esProximo ? '#f59e0b' : tieneRetraso ? '#ef4444' : coloresPorOdontologo[odontologo.userId]?.border || '#3b82f6'}`,
                                          borderRadius: '4px',
                                          padding: '0.3rem',
                                          cursor: 'pointer',
                                          position: 'relative',
                                          fontSize: '0.7rem',
                                          marginBottom: '0.2rem'
                                        }}
                                      >
                                        {/* Badge de estado */}
                                        <span style={{
                                          position: 'absolute',
                                          top: '0.1rem',
                                          right: '0.1rem',
                                          fontSize: '0.6rem'
                                        }}>
                                          {turnoEnHora.estado === 'PENDIENTE' && '⏳'}
                                          {turnoEnHora.estado === 'ASISTIO' && '✓'}
                                          {turnoEnHora.estado === 'AUSENTE' && '✗'}
                                          {turnoEnHora.estado === 'CANCELADO' && '⊘'}
                                        </span>

                                        {/* Indicador de tiempo */}
                                        {(esProximo || tieneRetraso) && (
                                          <div style={{
                                            position: 'absolute',
                                            top: '0.1rem',
                                            left: '0.1rem',
                                            background: esProximo ? '#f59e0b' : '#ef4444',
                                            color: 'white',
                                            padding: '0.1rem 0.3rem',
                                            borderRadius: '3px',
                                            fontSize: '0.6rem',
                                            fontWeight: 'bold'
                                          }}>
                                            {esProximo ? `${minutosHastaTurno}m` : `${minutosRetraso}m`}
                                          </div>
                                        )}

                                        {/* Nombre del odontólogo */}
                                        <div style={{
                                          fontSize: '0.65rem',
                                          fontWeight: '600',
                                          color: '#1c1c1e',
                                          marginBottom: '0.15rem',
                                          opacity: 0.9
                                        }}>
                                          Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                                        </div>

                                        <div style={{ fontWeight: '600', marginBottom: '0.1rem', fontSize: '0.7rem' }}>
                                          {turnoEnHora.Paciente?.nombre} {turnoEnHora.Paciente?.apellido}
                                        </div>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.85, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                          {turnoEnHora.motivo}
                                        </div>
                                        <div style={{ fontSize: '0.6rem', opacity: 0.75, marginTop: '0.1rem' }}>
                                          {horaInicioStr} - {horaFinStr}
                                        </div>
                                      </div>
                                    );
                                  } else if (estaDisponible) {
                                    const disponibilidadDelDia = disponibilidadesDelDia.find(disp => {
                                      const slotMin = horaStringToMinutes(hora);
                                      const inicioMin = horaStringToMinutes(normalizarHora(disp.horaInicio));
                                      const finMin = horaStringToMinutes(normalizarHora(disp.horaFin));
                                      return slotMin >= inicioMin && slotMin < finMin;
                                    });

                                    return (
                                      <div
                                        key={odontologo.userId}
                                        style={{
                                          background: '#d1fae5',
                                          border: '1px dashed #10b981',
                                          borderRadius: '4px',
                                          padding: '0.3rem',
                                          fontSize: '0.65rem',
                                          color: '#065f46',
                                          marginBottom: '0.2rem'
                                        }}
                                        title={disponibilidadDelDia ? `Disponible: ${disponibilidadDelDia.horaInicio} - ${disponibilidadDelDia.horaFin}` : 'Disponible'}
                                      >
                                        <div style={{
                                          fontWeight: '600',
                                          marginBottom: '0.15rem',
                                          fontSize: '0.7rem'
                                        }}>
                                          Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                                        </div>
                                        <div style={{
                                          fontSize: '0.65rem',
                                          textAlign: 'center',
                                          opacity: 0.9
                                        }}>
                                          ✓ Disponible
                                        </div>
                                        {disponibilidadDelDia && (
                                          <div style={{
                                            fontSize: '0.6rem',
                                            opacity: 0.75,
                                            marginTop: '0.1rem',
                                            textAlign: 'center'
                                          }}>
                                            {disponibilidadDelDia.horaInicio} - {disponibilidadDelDia.horaFin}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }

                                  return null;
                                })}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(170, 147, 147, 0.1)',
                minHeight: '400px'
              }}>
                <div style={{
                  textAlign: 'center',
                  color: '#667085'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    opacity: 0.5
                  }}>
                    📅
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1c1c1e',
                    marginBottom: '0.5rem'
                  }}>
                    No hay odontólogos disponibles
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#667085',
                    margin: 0
                  }}>
                    No hay odontólogos con disponibilidad activa para esta semana.
                    {soloConDisponibilidad && (
                      <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        Desactiva el filtro "Disponibilidad activa" para ver todos los odontólogos.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            {/* Tabla de agenda compacta */}
            {odontologos && odontologos.length > 0 ? (
              <div className="agenda-tabla-container" style={{
                flex: 1,
                overflow: 'auto',
                maxHeight: 'calc(100vh - 280px)'
              }}>
                <table className="agenda-tabla" style={{ fontSize: '0.85rem' }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: 'white' }}>
                    <tr>
                      <th className="col-hora" style={{
                        padding: '0.5rem',
                        fontSize: '0.8rem',
                        width: '60px',
                        minWidth: '60px',
                        color: '#1f2937',
                        fontWeight: '600'
                      }}>Hora</th>
                      {odontologos?.map((odontologo) => (
                        <th key={odontologo.userId} className="col-odontologo" style={{
                          padding: '0.5rem',
                          minWidth: '180px'
                        }}>
                          <div className="odontologo-header" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                          }}>
                            <div
                              className="color-indicator"
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: coloresPorOdontologo[odontologo.userId]?.border,
                                flexShrink: 0
                              }}
                            ></div>
                            <div className="odontologo-info" style={{ flex: 1, minWidth: 0 }}>
                              <div className="odontologo-nombre" style={{
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                color: '#1f2937',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                              </div>
                              <div className="odontologo-especialidad" style={{
                                fontSize: '0.7rem',
                                color: '#4b5563',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                              }}>
                                {odontologo.OdontologoEspecialidades?.[0]?.Especialidad?.nombre || 'General'}
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HORARIOS.map((hora) => (
                      <tr key={hora} style={{ height: 'auto' }}>
                        <td className="celda-hora" style={{
                          padding: '0.4rem',
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          textAlign: 'center',
                          color: '#374151'
                        }}>{hora}</td>
                        {odontologos?.map((odontologo) => {
                          const turno = obtenerTurno(odontologo.userId, hora);
                          const bloqueo = obtenerBloqueo(odontologo.userId, hora);
                          const disponible = estaDisponible(odontologo.userId, hora);
                          const colores = coloresPorOdontologo[odontologo.userId];

                          // Si hay turno y es el inicio
                          if (turno && turno.esInicio) {
                            const duracionSlots = Math.max(1, Math.ceil((turno.duracion || 30) / SLOT_MINUTOS));
                            const estaSeleccionado = turnosSeleccionados.some(t => t.id === turno.id);
                            const puedeSeleccionar = modoSeleccionMultiple && turno.estado === 'PENDIENTE';

                            // CU-AG01.5: Calcular indicadores de tiempo (amarillo próximos 30 min, rojo retraso)
                            const ahora = new Date();
                            const fechaTurno = new Date(turno.fechaHora);
                            const minutosHastaTurno = Math.floor((fechaTurno - ahora) / (1000 * 60));
                            const minutosRetraso = Math.floor((ahora - fechaTurno) / (1000 * 60));
                            const esProximo = minutosHastaTurno >= 0 && minutosHastaTurno <= 30; // Próximos 30 min
                            const tieneRetraso = minutosRetraso > 0 && turno.estado === 'PENDIENTE'; // Retraso y pendiente

                            return (
                              <td
                                key={odontologo.userId}
                                rowSpan={duracionSlots}
                                className={`celda-turno ${estaSeleccionado ? 'turno-seleccionado' : ''} ${puedeSeleccionar ? 'turno-seleccionable' : ''} ${esProximo ? 'turno-proximo' : ''} ${tieneRetraso ? 'turno-retraso' : ''}`}
                                style={{
                                  backgroundColor: estaSeleccionado ? '#fff3cd' :
                                    tieneRetraso ? '#fee2e2' :
                                      esProximo ? '#fef3c7' :
                                        colores.bg,
                                  borderLeft: `4px solid ${estaSeleccionado ? '#ffc107' :
                                    tieneRetraso ? '#ef4444' :
                                      esProximo ? '#f59e0b' :
                                        colores.border
                                    }`,
                                  color: estaSeleccionado ? '#856404' :
                                    tieneRetraso ? '#991b1b' :
                                      esProximo ? '#92400e' :
                                        colores.text,
                                  position: 'relative',
                                }}
                                onClick={(e) => handleClickCelda(odontologo.userId, hora, e)}
                              >
                                {/* CU-AG01.4: Checkbox para selección múltiple */}
                                {modoSeleccionMultiple && turno.estado === 'PENDIENTE' && (
                                  <div
                                    className="turno-checkbox"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleSeleccionTurno(turno);
                                    }}
                                    style={{
                                      position: 'absolute',
                                      top: '0.5rem',
                                      right: '0.5rem',
                                      zIndex: 10,
                                      cursor: 'pointer',
                                      background: estaSeleccionado ? '#27ae60' : 'white',
                                      border: '2px solid #27ae60',
                                      borderRadius: '4px',
                                      width: '24px',
                                      height: '24px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '14px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {estaSeleccionado && '✓'}
                                  </div>
                                )}

                                {/* CU-AG01.5: Indicadores de tiempo */}
                                {(esProximo || tieneRetraso) && (
                                  <div
                                    className="indicador-tiempo"
                                    style={{
                                      position: 'absolute',
                                      top: '0.15rem',
                                      right: '1.8rem', // Mover a la derecha, dejando espacio para el badge de estado
                                      background: esProximo ? '#f59e0b' : '#ef4444',
                                      color: 'white',
                                      padding: '0.15rem 0.4rem',
                                      borderRadius: '4px',
                                      fontSize: '0.65rem',
                                      fontWeight: 'bold',
                                      zIndex: 5,
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {esProximo ? `⏰ ${minutosHastaTurno} min` : `⚠️ ${minutosRetraso} min retraso`}
                                  </div>
                                )}

                                <div className="turno-content" style={{
                                  padding: '0.2rem',
                                  fontSize: '0.75rem',
                                  lineHeight: '1.2',
                                  // Ajustar padding-top si hay indicador de tiempo para evitar que tape el nombre
                                  paddingTop: (esProximo || tieneRetraso) ? '1.5rem' : '0.2rem'
                                }}>
                                  {/* Badge de estado en la esquina superior derecha */}
                                  <span className={`turno-estado-badge estado-${turno.estado.toLowerCase()}`} style={{
                                    position: 'absolute',
                                    top: '0.15rem',
                                    right: '0.15rem',
                                    fontSize: '0.65rem'
                                  }}>
                                    {turno.estado === 'PENDIENTE' && '⏳'}
                                    {turno.estado === 'ASISTIO' && '✓'}
                                    {turno.estado === 'AUSENTE' && '✗'}
                                    {turno.estado === 'CANCELADO' && '⊘'}
                                  </span>

                                  <div className="turno-paciente" style={{
                                    fontWeight: '600',
                                    marginBottom: '0.1rem',
                                    fontSize: '0.75rem',
                                    lineHeight: '1.2',
                                    color: estaSeleccionado ? '#856404' :
                                      tieneRetraso ? '#991b1b' :
                                        esProximo ? '#92400e' :
                                          colores.text
                                  }}>
                                    {turno.Paciente?.nombre} {turno.Paciente?.apellido}
                                  </div>
                                  <div className="turno-motivo" style={{
                                    fontSize: '0.7rem',
                                    color: estaSeleccionado ? '#856404' :
                                      tieneRetraso ? '#991b1b' :
                                        esProximo ? '#92400e' :
                                          colores.text,
                                    opacity: 0.85,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    lineHeight: '1.2'
                                  }}>{turno.motivo}</div>
                                  <div className="turno-horario" style={{
                                    fontSize: '0.65rem',
                                    color: estaSeleccionado ? '#856404' :
                                      tieneRetraso ? '#991b1b' :
                                        esProximo ? '#92400e' :
                                          colores.text,
                                    opacity: 0.75,
                                    marginTop: '0.1rem',
                                    lineHeight: '1.2'
                                  }}>
                                    {turno.horaInicioStr} - {turno.horaFinStr}
                                  </div>
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
                                style={{ padding: '0.25rem', textAlign: 'center' }}
                              >
                                <div className="bloqueado-content" style={{ fontSize: '0.7rem', color: '#ef4444' }}>
                                  🚫
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
                                style={{ padding: '0.25rem', textAlign: 'center' }}
                              >
                                <div className="disponible-content" style={{ fontSize: '0.7rem', color: '#10b981' }}>
                                  <FaPlus style={{ fontSize: '0.7rem' }} />
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
                    style={{ top: `${lineaActual.topPixels}px` }}
                  >
                    <div className="linea-hora-actual-indicator">
                      <span className="hora-actual-text">{lineaActual.hora}</span>
                    </div>
                    <div className="linea-hora-actual-line"></div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem',
                background: 'white',
                borderRadius: '6px',
                boxShadow: '0 2px 6px rgba(170, 147, 147, 0.1)',
                minHeight: '400px'
              }}>
                <div style={{
                  textAlign: 'center',
                  color: '#667085'
                }}>
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    opacity: 0.5
                  }}>
                    📅
                  </div>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    color: '#1c1c1e',
                    marginBottom: '0.5rem'
                  }}>
                    No hay odontólogos disponibles
                  </h3>
                  <p style={{
                    fontSize: '0.95rem',
                    color: '#667085',
                    margin: 0
                  }}>
                    No hay odontólogos con disponibilidad activa para el día seleccionado.
                    {soloConDisponibilidad && (
                      <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                        Desactiva el filtro "Disponibilidad activa" para ver todos los odontólogos.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
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

      {/* CU-AG01.4: Modal de cancelación múltiple */}
      <CancelarTurnosMultipleModal
        isOpen={modalCancelacionMultiple}
        onClose={() => {
          setModalCancelacionMultiple(false);
          setTurnosSeleccionados([]);
          setModoSeleccionMultiple(false);
        }}
        turnosSeleccionados={turnosSeleccionados}
        onSuccess={() => {
          refetchTurnos();
          setModalCancelacionMultiple(false);
          setTurnosSeleccionados([]);
          setModoSeleccionMultiple(false);
        }}
      />

      {/* Modal de búsqueda de turnos */}
      <BuscarTurnosModal
        isOpen={modalBusquedaAbierto}
        onClose={() => setModalBusquedaAbierto(false)}
        onTurnoClick={(turno) => {
          setTurnoSeleccionado(turno);
          setModalBusquedaAbierto(false);
          setModalAbierto(true);
        }}
      />
    </div>
  );
}

