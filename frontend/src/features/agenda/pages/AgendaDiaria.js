// src/features/agenda/pages/AgendaDiaria.js
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaArrowLeft, FaPlus, FaCheckSquare, FaBan, FaFilter, FaCalendarWeek } from 'react-icons/fa';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useTurnosPorFecha, useTurnos } from '../hooks/useTurnos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import DetallesTurnoModal from '../components/DetallesTurnoModal';
import CancelarTurnosMultipleModal from '../components/CancelarTurnosMultipleModal';
import useToast from '../../../hooks/useToast';
import useAuth from '../../../features/auth/hooks/useAuth';
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
  
  // CU-AG01.5: Estado para vista semanal y filtros
  const [vista, setVista] = useState('diaria'); // 'diaria' | 'semanal'
  const [filtroEstado, setFiltroEstado] = useState(''); // '' | 'PENDIENTE' | 'ASISTIO' | 'AUSENTE' | 'CANCELADO'
  const [filtroPaciente, setFiltroPaciente] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // CU-AG01.6: Filtros adicionales
  const [filtroOdontologos, setFiltroOdontologos] = useState([]); // Array de IDs de odontólogos seleccionados
  const [filtroTratamiento, setFiltroTratamiento] = useState(''); // Buscador de tratamiento/motivo
  
  // CU-AG01.5: Verificar si el usuario es odontólogo (debe estar antes de semanaActual)
  const esOdontologo = useMemo(() => {
    return user?.rol?.id === 2 || user?.RolId === 2 || user?.rol?.nombre === 'Odontólogo';
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
    
    return odontologosFiltrados;
  }, [odontologosData, esOdontologo, user, filtroOdontologos]);

  // Extraer turnos del array y aplicar filtros
  const turnos = useMemo(() => {
    if (!turnosData) return [];
    let turnosList = Array.isArray(turnosData) ? turnosData : (turnosData.data || []);
    
    // CU-AG01.5 y CU-AG01.6: Aplicar filtros
    if (filtroEstado) {
      turnosList = turnosList.filter(t => t.estado === filtroEstado);
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
  }, [turnosData, filtroEstado, filtroPaciente, filtroTratamiento, filtroOdontologos]);

  // Asignar colores a odontólogos
  const coloresPorOdontologo = useMemo(() => {
    if (!odontologos) return {};
    const colores = {};
    odontologos.forEach((odontologo, index) => {
      colores[odontologo.userId] = COLORES_ODONTOLOGO[index % COLORES_ODONTOLOGO.length];
    });
    return colores;
  }, [odontologos]);

  // CU-AG01.6: Calcular métricas de ocupación y disponibilidad
  const metricasOcupacion = useMemo(() => {
    if (!odontologos || !turnos || !disponibilidades) {
      return {
        ocupacionPorOdontologo: {},
        ocupacionDia: 0,
        odontologoMasDisponible: null
      };
    }

    const ocupacionPorOdontologo = {};
    let totalSlotsDia = 0;
    let totalSlotsOcupadosDia = 0;
    const disponibilidadPorOdontologo = {};

    odontologos.forEach(odontologo => {
      const odontologoId = odontologo.userId;
      
      // Calcular slots disponibles del odontólogo en el día
      const disponibilidadesOdonto = disponibilidades.filter(
        d => d.odontologoId === odontologoId && d.fecha === fechaStr && d.tipo === 'LABORAL'
      );
      
      let slotsDisponibles = 0;
      disponibilidadesOdonto.forEach(disp => {
        const horaInicio = parseInt(disp.horaInicio.split(':')[0]);
        const horaFin = parseInt(disp.horaFin.split(':')[0]);
        slotsDisponibles += (horaFin - horaInicio);
      });
      
      // Contar turnos del odontólogo en el día
      const turnosOdonto = turnos.filter(t => t.odontologoId === odontologoId);
      const slotsOcupados = turnosOdonto.length;
      
      // Calcular ocupación %
      const ocupacion = slotsDisponibles > 0 
        ? Math.round((slotsOcupados / slotsDisponibles) * 100) 
        : 0;
      
      ocupacionPorOdontologo[odontologoId] = {
        ocupacion,
        slotsDisponibles,
        slotsOcupados,
        nombre: `Dr. ${odontologo.Usuario?.nombre} ${odontologo.Usuario?.apellido}`
      };
      
      // Para métrica de disponibilidad (más slots libres)
      const slotsLibres = slotsDisponibles - slotsOcupados;
      disponibilidadPorOdontologo[odontologoId] = {
        slotsLibres,
        nombre: `Dr. ${odontologo.Usuario?.nombre} ${odontologo.Usuario?.apellido}`
      };
      
      totalSlotsDia += slotsDisponibles;
      totalSlotsOcupadosDia += slotsOcupados;
    });

    // Ocupación del día
    const ocupacionDia = totalSlotsDia > 0 
      ? Math.round((totalSlotsOcupadosDia / totalSlotsDia) * 100) 
      : 0;

    // Odontólogo con más disponibilidad (más slots libres)
    const odontologoMasDisponible = Object.entries(disponibilidadPorOdontologo)
      .sort((a, b) => b[1].slotsLibres - a[1].slotsLibres)[0];
    
    return {
      ocupacionPorOdontologo,
      ocupacionDia,
      odontologoMasDisponible: odontologoMasDisponible ? {
        id: odontologoMasDisponible[0],
        nombre: odontologoMasDisponible[1].nombre,
        slotsLibres: odontologoMasDisponible[1].slotsLibres
      } : null,
      totalSlotsDia,
      totalSlotsOcupadosDia
    };
  }, [odontologos, turnos, disponibilidades, fechaStr]);

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

        {/* CU-AG01.5: Controles de vista y filtros */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '1rem' }}>
          <button
            onClick={() => setVista(vista === 'diaria' ? 'semanal' : 'diaria')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #ddd',
              background: vista === 'semanal' ? '#3498db' : 'white',
              color: vista === 'semanal' ? 'white' : '#333',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaCalendarWeek /> {vista === 'diaria' ? 'Vista Semanal' : 'Vista Diaria'}
          </button>
          
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #ddd',
              background: mostrarFiltros ? '#27ae60' : 'white',
              color: mostrarFiltros ? 'white' : '#333',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <FaFilter /> Filtros
          </button>
        </div>

        {/* CU-AG01.4: Controles de cancelación múltiple */}
        <div className="controles-seleccion-multiple" style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            className={`btn-seleccion-multiple ${modoSeleccionMultiple ? 'active' : ''}`}
            onClick={toggleModoSeleccionMultiple}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              border: '1px solid #ddd',
              background: modoSeleccionMultiple ? '#3498db' : 'white',
              color: modoSeleccionMultiple ? 'white' : '#333',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
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
      </div>

      {/* CU-AG01.6: Métricas de ocupación y disponibilidad */}
      {vista === 'diaria' && !esOdontologo && (
        <div style={{
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>📊 Métricas del Día</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Ocupación del Día</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{metricasOcupacion.ocupacionDia}%</div>
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.25rem' }}>
                {metricasOcupacion.totalSlotsOcupadosDia} / {metricasOcupacion.totalSlotsDia} slots
              </div>
            </div>
            
            {metricasOcupacion.odontologoMasDisponible && (
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.5rem' }}>Más Disponible</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {metricasOcupacion.odontologoMasDisponible.nombre}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  {metricasOcupacion.odontologoMasDisponible.slotsLibres} slots libres
                </div>
              </div>
            )}
          </div>
          
          {/* Ocupación por odontólogo */}
          {Object.keys(metricasOcupacion.ocupacionPorOdontologo).length > 0 && (
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.75rem', opacity: 0.9 }}>Ocupación por Odontólogo:</div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {Object.entries(metricasOcupacion.ocupacionPorOdontologo).map(([id, data]) => (
                  <div 
                    key={id}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                      minWidth: '150px',
                      flex: '1 1 auto'
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '0.25rem' }}>
                      {data.nombre}
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: data.ocupacion > 80 ? '#ff6b6b' : data.ocupacion > 50 ? '#ffd93d' : '#6bcf7f'
                    }}>
                      {data.ocupacion}%
                    </div>
                    <div style={{ fontSize: '0.7rem', opacity: 0.8, marginTop: '0.25rem' }}>
                      {data.slotsOcupados} / {data.slotsDisponibles} slots
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
      {vista === 'semanal' ? (
        <div className="vista-semanal-container">
          {/* Navegación de semana */}
          <div className="controles-semana" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <button
              onClick={() => {
                const nuevaFecha = new Date(semanaActual.inicioSemana);
                nuevaFecha.setDate(nuevaFecha.getDate() - 7);
                setFechaSeleccionada(nuevaFecha);
              }}
              className="btn-nav"
            >
              <FaChevronLeft /> Semana Anterior
            </button>
            
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#2c3e50' }}>
                {semanaActual.dias[0].toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })} - 
                {semanaActual.dias[6].toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </h2>
              <button
                onClick={() => {
                  const hoy = new Date();
                  setFechaSeleccionada(hoy);
                }}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.5rem 1rem',
                  background: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Esta Semana
              </button>
            </div>
            
            <button
              onClick={() => {
                const nuevaFecha = new Date(semanaActual.inicioSemana);
                nuevaFecha.setDate(nuevaFecha.getDate() + 7);
                setFechaSeleccionada(nuevaFecha);
              }}
              className="btn-nav"
            >
              Semana Siguiente <FaChevronRight />
            </button>
          </div>

          {/* Grid de 7 días */}
          <div className="semana-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {semanaActual.dias.map((dia, index) => {
              const diaStr = formatDate(dia);
              const esHoyDia = diaStr === formatDate(new Date());
              const turnosDelDia = turnosPorDia[index] || [];
              const nombreDia = dia.toLocaleDateString('es-AR', { weekday: 'long' });
              const numeroDia = dia.getDate();
              const mes = dia.toLocaleDateString('es-AR', { month: 'short' });
              
              return (
                <div
                  key={index}
                  className={`dia-semana-card ${esHoyDia ? 'dia-hoy' : ''}`}
                  style={{
                    background: esHoyDia ? '#e3f2fd' : 'white',
                    border: `2px solid ${esHoyDia ? '#2196f3' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    minHeight: '400px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {/* Header del día */}
                  <div style={{
                    borderBottom: '2px solid #e0e0e0',
                    paddingBottom: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{
                      fontSize: '0.85rem',
                      color: '#7f8c8d',
                      textTransform: 'capitalize',
                      marginBottom: '0.25rem'
                    }}>
                      {nombreDia}
                    </div>
                    <div style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: esHoyDia ? '#2196f3' : '#2c3e50'
                    }}>
                      {numeroDia}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: '#95a5a6',
                      textTransform: 'uppercase'
                    }}>
                      {mes}
                    </div>
                  </div>

                  {/* Lista de turnos del día */}
                  <div style={{
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {loadingTurnosSemana ? (
                      <div style={{ textAlign: 'center', color: '#7f8c8d', padding: '1rem' }}>
                        Cargando...
                      </div>
                    ) : turnosDelDia.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#95a5a6', padding: '1rem', fontSize: '0.9rem' }}>
                        Sin turnos
                      </div>
                    ) : (
                      turnosDelDia.map((turno) => {
                        const fechaTurno = new Date(turno.fechaHora);
                        const horaStr = fechaTurno.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
                        
                        // CU-AG01.5: Calcular indicadores de tiempo
                        const ahora = new Date();
                        const minutosHastaTurno = Math.floor((fechaTurno - ahora) / (1000 * 60));
                        const minutosRetraso = Math.floor((ahora - fechaTurno) / (1000 * 60));
                        const esProximo = minutosHastaTurno >= 0 && minutosHastaTurno <= 30;
                        const tieneRetraso = minutosRetraso > 0 && turno.estado === 'PENDIENTE';
                        
                        return (
                          <div
                            key={turno.id}
                            className={`turno-card-semanal ${esProximo ? 'turno-proximo' : ''} ${tieneRetraso ? 'turno-retraso' : ''}`}
                            onClick={() => {
                              setTurnoSeleccionado(turno);
                              setModalAbierto(true);
                            }}
                            style={{
                              background: esProximo ? '#fef3c7' : tieneRetraso ? '#fee2e2' : '#f8f9fa',
                              border: `1px solid ${esProximo ? '#f59e0b' : tieneRetraso ? '#ef4444' : '#e0e0e0'}`,
                              borderRadius: '6px',
                              padding: '0.75rem',
                              marginBottom: '0.5rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {/* Indicador de tiempo */}
                            {(esProximo || tieneRetraso) && (
                              <div style={{
                                position: 'absolute',
                                top: '0.25rem',
                                right: '0.25rem',
                                background: esProximo ? '#f59e0b' : '#ef4444',
                                color: 'white',
                                padding: '0.15rem 0.4rem',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 'bold'
                              }}>
                                {esProximo ? `⏰ ${minutosHastaTurno} min` : `⚠️ ${minutosRetraso} min`}
                              </div>
                            )}
                            
                            {/* Hora */}
                            <div style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: '#2c3e50',
                              marginBottom: '0.25rem'
                            }}>
                              {horaStr}
                            </div>
                            
                            {/* Paciente */}
                            <div style={{
                              fontSize: '0.85rem',
                              color: '#34495e',
                              fontWeight: '500',
                              marginBottom: '0.15rem'
                            }}>
                              {turno.Paciente?.nombre} {turno.Paciente?.apellido}
                            </div>
                            
                            {/* Motivo */}
                            <div style={{
                              fontSize: '0.75rem',
                              color: '#7f8c8d',
                              marginBottom: '0.25rem',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {turno.motivo}
                            </div>
                            
                            {/* Estado */}
                            <div style={{
                              display: 'inline-block',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.7rem',
                              fontWeight: '600',
                              background: turno.estado === 'PENDIENTE' ? '#fff3cd' :
                                         turno.estado === 'ASISTIO' ? '#d4edda' :
                                         turno.estado === 'AUSENTE' ? '#f8d7da' :
                                         '#e2e3e5',
                              color: turno.estado === 'PENDIENTE' ? '#856404' :
                                    turno.estado === 'ASISTIO' ? '#155724' :
                                    turno.estado === 'AUSENTE' ? '#721c24' :
                                    '#383d41'
                            }}>
                              {turno.estado === 'PENDIENTE' && '⏳ Pendiente'}
                              {turno.estado === 'ASISTIO' && '✓ Asistió'}
                              {turno.estado === 'AUSENTE' && '✗ Ausente'}
                              {turno.estado === 'CANCELADO' && '⊘ Cancelado'}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <>
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
                          borderLeft: `4px solid ${
                            estaSeleccionado ? '#ffc107' : 
                            tieneRetraso ? '#ef4444' : 
                            esProximo ? '#f59e0b' : 
                            colores.border
                          }`,
                          color: colores.text,
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
                              top: '0.25rem',
                              left: '0.25rem',
                              background: esProximo ? '#f59e0b' : '#ef4444',
                              color: 'white',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '4px',
                              fontSize: '0.75rem',
                              fontWeight: 'bold',
                              zIndex: 5
                            }}
                          >
                            {esProximo ? `⏰ ${minutosHastaTurno} min` : `⚠️ ${minutosRetraso} min retraso`}
                          </div>
                        )}
                        
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
      </>
      )}

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
    </div>
  );
}

