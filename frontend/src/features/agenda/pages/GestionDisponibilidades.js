// src/features/agenda/pages/GestionDisponibilidades.js
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import { useTurnosPorFecha, useTurnos } from '../hooks/useTurnos';
import useAuth from '../../../features/auth/hooks/useAuth';
import DisponibilidadModal from '../components/DisponibilidadModal';
import DisponibilidadRecurrenteModal from '../components/DisponibilidadRecurrenteModal';
import { FaChevronLeft, FaChevronRight, FaPlus, FaCalendarAlt, FaSyncAlt, FaCalendarCheck, FaUserMd, FaTimes } from 'react-icons/fa';
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
      
      const añoStr = año.toString();
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaStr = `${añoStr}-${mesStr}-${diaStr}`;
      
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
      borderRadius: '6px',
      padding: '1rem',
      boxShadow: '0 2px 6px rgba(170, 147, 147, 0.1)',
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
            color: '#145c63',
            transition: 'opacity 0.18s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
        >
          <FaChevronLeft />
        </button>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '600', color: '#1c1c1e' }}>
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
            color: '#145c63',
            transition: 'opacity 0.18s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '0.7'}
          onMouseLeave={(e) => e.target.style.opacity = '1'}
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
          background: '#f7f9fc',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.75rem',
          fontWeight: '500',
          color: '#1c1c1e',
          transition: 'background 0.18s ease'
        }}
        onMouseEnter={(e) => e.target.style.background = '#e5e7eb'}
        onMouseLeave={(e) => e.target.style.background = '#f7f9fc'}
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
            color: '#667085',
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
                  : dia.esHoy
                    ? '#92400e'
                    : '#2c3e50',
                cursor: 'pointer',
                fontWeight: dia.esSeleccionado || dia.esHoy ? '600' : '400',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 0.15s ease',
                fontSize: '0.85rem',
                opacity: dia.esPasado ? 0.7 : 1
              }}
              title={dia.esPasado ? 'Día pasado' : (dia.tieneTurnos ? 'Tiene turnos' : dia.tieneDisponibilidad ? 'Tiene disponibilidad' : '')}
              onMouseEnter={(e) => {
                if (!dia.esSeleccionado) {
                  e.target.style.background = dia.esHoy ? '#fde68a' : '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!dia.esSeleccionado) {
                  e.target.style.background = dia.esHoy
                    ? '#fef3c7'
                    : dia.tieneTurnos
                      ? '#dbeafe'
                      : dia.tieneDisponibilidad
                        ? '#d1fae5'
                        : '#f5f5f5';
                }
              }}
            >
              {dia.numero}
              {(dia.tieneTurnos || dia.tieneDisponibilidad) && (
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
    </div>
  );
}

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
  
  // Estado para el mes visualizado en el mini calendario
  const [mesVistaCalendario, setMesVistaCalendario] = useState(new Date());
  
  // Estado para filtros
  const [odontologoFiltro, setOdontologoFiltro] = useState([]); // [] = todos, array de IDs para múltiple
  const [filtroTipo, setFiltroTipo] = useState('todos'); // 'todos' | 'disponibles' | 'seleccionados'
  const [busquedaOdontologo, setBusquedaOdontologo] = useState(''); // Texto de búsqueda
  const [mostrarSugerenciasOdontologo, setMostrarSugerenciasOdontologo] = useState(false);
  const [odontologoSeleccionado, setOdontologoSeleccionado] = useState(null);
  
  // Estado para modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [disponibilidadSeleccionada, setDisponibilidadSeleccionada] = useState(null);
  
  // Estado para modal de disponibilidades recurrentes
  const [modalRecurrenteAbierto, setModalRecurrenteAbierto] = useState(false);
  
  // Calcular fecha actual para la query (solo diaria)
  const fechaActual = useMemo(() => formatDate(diaActual), [diaActual]);
  const fechaInicio = fechaActual;
  const fechaFin = fechaActual;
  
  // Calcular rango del mes para el mini calendario
  const mesVistaCalendarioCalculado = useMemo(() => {
    return mesVistaCalendario || new Date();
  }, [mesVistaCalendario]);
  
  const fechaInicioMes = useMemo(() => {
    const año = mesVistaCalendarioCalculado.getFullYear();
    const mes = mesVistaCalendarioCalculado.getMonth();
    return new Date(año, mes, 1);
  }, [mesVistaCalendarioCalculado]);
  
  const fechaFinMes = useMemo(() => {
    const año = mesVistaCalendarioCalculado.getFullYear();
    const mes = mesVistaCalendarioCalculado.getMonth();
    return new Date(año, mes + 1, 0);
  }, [mesVistaCalendarioCalculado]);
  
  const fechaInicioMesStr = useMemo(() => formatDate(fechaInicioMes), [fechaInicioMes]);
  const fechaFinMesStr = useMemo(() => formatDate(fechaFinMes), [fechaFinMes]);
  
  // Cargar odontólogos
  const { data: odontologos, isLoading: loadingOdontologos } = useOdontologosPorEspecialidad();
  
  // Cargar disponibilidades del día actual
  const { data: disponibilidades, isLoading: loadingDisponibilidades, refetch, isFetching } = useDisponibilidadesSemanal(fechaInicio, fechaFin);
  
  // Cargar disponibilidades del mes para el mini calendario
  const { data: disponibilidadesMes } = useDisponibilidadesSemanal(fechaInicioMesStr, fechaFinMesStr);
  
  // Cargar turnos del día actual (filtrado por odontólogo si está seleccionado)
  const { data: turnosData, isLoading: loadingTurnos } = useTurnosPorFecha(
    fechaActual, 
    odontologoFiltro.length === 1 ? odontologoFiltro[0] : null // Si hay solo uno, filtrar; si hay varios o ninguno, todos
  );
  const turnos = useMemo(() => {
    if (!turnosData) return [];
    return Array.isArray(turnosData) ? turnosData : (turnosData.data || []);
  }, [turnosData]);
  
  // Cargar turnos del mes para el mini calendario
  const { data: turnosMesData } = useTurnos({
    fechaInicio: fechaInicioMesStr,
    fechaFin: fechaFinMesStr
  });
  
  // Filtrar odontólogos según búsqueda
  const odontologosFiltradosPorBusqueda = useMemo(() => {
    if (!busquedaOdontologo || busquedaOdontologo.length < 1) {
      return odontologos || [];
    }
    
    const textoBusqueda = busquedaOdontologo.toLowerCase();
    return (odontologos || []).filter(odonto => {
      const nombre = odonto.Usuario?.nombre?.toLowerCase() || '';
      const apellido = odonto.Usuario?.apellido?.toLowerCase() || '';
      const matricula = odonto.matricula?.toLowerCase() || '';
      return nombre.includes(textoBusqueda) || 
             apellido.includes(textoBusqueda) || 
             matricula.includes(textoBusqueda) ||
             `${nombre} ${apellido}`.includes(textoBusqueda);
    });
  }, [odontologos, busquedaOdontologo]);
  
  // Manejar selección de odontólogo
  const handleSeleccionarOdontologo = (odontologo) => {
    if (odontologo === null) {
      // Seleccionar "Todos"
      setFiltroTipo('todos');
      setOdontologoFiltro([]);
      setOdontologoSeleccionado(null);
      setBusquedaOdontologo('');
    } else if (odontologo === 'disponibles') {
      // Seleccionar "Disponibles"
      setFiltroTipo('disponibles');
      setOdontologoFiltro([]);
      setOdontologoSeleccionado(null);
      setBusquedaOdontologo('');
    } else {
      // Seleccionar un odontólogo específico
      setOdontologoSeleccionado(odontologo);
      setOdontologoFiltro([odontologo.userId]);
      setFiltroTipo('seleccionados');
      setBusquedaOdontologo(`Dr. ${odontologo.Usuario?.nombre} ${odontologo.Usuario?.apellido}`);
      setMostrarSugerenciasOdontologo(false);
    }
  };
  
  // Manejar cambio de texto de búsqueda
  const handleCambiarBusquedaOdontologo = (texto) => {
    setBusquedaOdontologo(texto);
    setMostrarSugerenciasOdontologo(true); // Siempre mostrar cuando hay foco o texto
    if (texto.length === 0) {
      setOdontologoSeleccionado(null);
      // No cambiar el filtro automáticamente, solo limpiar la búsqueda
    }
  };
  
  // Manejar click en el input para mostrar opciones
  const handleClickInputOdontologo = () => {
    setMostrarSugerenciasOdontologo(true);
  };
  
  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarSugerenciasOdontologo && !event.target.closest('.filtro-odontologo-container')) {
        setMostrarSugerenciasOdontologo(false);
      }
    };
    
    if (mostrarSugerenciasOdontologo) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mostrarSugerenciasOdontologo]);
  
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
      <header className="disponibilidades-header">
        <div className="top-bar">
          <h2>Gestión de Disponibilidades</h2>
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
      </header>
      
      {/* Layout con sidebar y contenido principal */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        {/* Sidebar con mini calendario */}
        <div style={{ 
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <MiniCalendarioSidebar
            fechaSeleccionada={diaActual}
            setFechaSeleccionada={setDiaActual}
            disponibilidadesMes={disponibilidadesMes}
            turnosMesData={turnosMesData}
            mesActual={mesVistaCalendarioCalculado}
            onMesVistaChange={setMesVistaCalendario}
          />
        </div>

        {/* Contenido principal */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      
      {/* Controles de navegación diaria - Mismo estilo y orden que Agenda */}
      <div className="controles-fecha">
        <button className="btn-nav" onClick={irDiaAnterior}>
          <FaChevronLeft /> Ant
        </button>
        
        <div className="fecha-selector" style={{ position: 'relative', cursor: 'pointer' }}>
          <FaCalendarAlt />
          <span className="fecha-legible">
            {formatDateReadable(diaActual)}
          </span>
          <input
            id="fecha-selector-hidden"
            type="date"
            value={fechaActual}
            onChange={handleCambiarFecha}
            className="input-fecha"
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
        
        <button className="btn-hoy" onClick={irHoy}>
          Hoy
        </button>
        
        <button className="btn-nav" onClick={irDiaSiguiente}>
          Sig <FaChevronRight />
        </button>

        {/* Controles adicionales */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginLeft: '1rem' }}>
          <button 
            className="btn-secondary"
            onClick={() => setModalRecurrenteAbierto(true)}
          >
            <FaCalendarCheck />
            Agregar Disponibilidad Recurrente
          </button>
          
          {/* Filtro por odontólogo con búsqueda y desplegable */}
          <div className="filtro-odontologo-container" style={{ position: 'relative', minWidth: '250px' }}>
            <div style={{ position: 'relative' }}>
              <FaUserMd style={{ 
                position: 'absolute', 
                left: '0.75rem', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#667085',
                fontSize: '0.85rem',
                zIndex: 2
              }} />
              <input
                type="text"
                value={odontologoSeleccionado 
                  ? `Dr. ${odontologoSeleccionado.Usuario?.nombre} ${odontologoSeleccionado.Usuario?.apellido}`
                  : filtroTipo === 'disponibles' 
                    ? `Disponibles (${odontologosDisponibles.length})`
                    : filtroTipo === 'todos'
                      ? 'Todos los odontólogos'
                      : busquedaOdontologo}
                onChange={(e) => handleCambiarBusquedaOdontologo(e.target.value)}
                onFocus={handleClickInputOdontologo}
                onClick={handleClickInputOdontologo}
                placeholder="Seleccionar odontólogo..."
                readOnly={!mostrarSugerenciasOdontologo || (odontologoSeleccionado !== null || filtroTipo !== 'todos')}
                className={`btn-filtro-odontologo ${filtroTipo === 'disponibles' || filtroTipo === 'seleccionados' ? 'active' : ''}`}
                style={{
                  paddingLeft: '2.5rem',
                  paddingRight: (filtroTipo !== 'todos' || odontologoSeleccionado) ? '2.5rem' : '2.5rem',
                  cursor: (odontologoSeleccionado !== null || filtroTipo !== 'todos') ? 'pointer' : 'text',
                  backgroundImage: 'none !important',
                  backgroundRepeat: 'no-repeat !important'
                }}
              />
              {/* Icono de flecha/cerrar */}
              {(odontologoSeleccionado || filtroTipo !== 'todos') ? (
                <button
                  onClick={() => handleSeleccionarOdontologo(null)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#667085',
                    zIndex: 2
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#1c1c1e'}
                  onMouseLeave={(e) => e.target.style.color = '#667085'}
                >
                  <FaTimes />
                </button>
              ) : (
                <div
                  onClick={() => setMostrarSugerenciasOdontologo(!mostrarSugerenciasOdontologo)}
                  style={{
                    position: 'absolute',
                    right: '0.5rem',
                    top: '50%',
                    transform: mostrarSugerenciasOdontologo ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#667085',
                    zIndex: 2,
                    transition: 'transform 0.2s ease',
                    width: '16px',
                    height: '16px'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#1c1c1e'}
                  onMouseLeave={(e) => e.target.style.color = '#667085'}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L1 4H11L6 9Z" fill="currentColor"/>
                  </svg>
                </div>
              )}
            </div>
            
            {/* Desplegable de odontólogos */}
            {mostrarSugerenciasOdontologo && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #e4e6ed',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                maxHeight: '300px',
                overflowY: 'auto',
                zIndex: 1000,
                marginTop: '0.25rem'
              }}>
                {/* Campo de búsqueda dentro del desplegable */}
                <div style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0' }}>
                  <input
                    type="text"
                    value={busquedaOdontologo}
                    onChange={(e) => handleCambiarBusquedaOdontologo(e.target.value)}
                    placeholder="Buscar por nombre, apellido o matrícula..."
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      border: '1px solid #e4e6ed',
                      borderRadius: '4px',
                      fontSize: '0.9rem'
                    }}
                    autoFocus
                  />
                </div>
                
                {/* Opción "Todos" */}
                <div
                  onClick={() => handleSeleccionarOdontologo(null)}
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: filtroTipo === 'todos' ? '#f7f9fc' : 'white',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (filtroTipo !== 'todos') e.target.style.backgroundColor = '#f7f9fc';
                  }}
                  onMouseLeave={(e) => {
                    if (filtroTipo !== 'todos') e.target.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#1c1c1e' }}>
                    Todos los odontólogos
                  </div>
                </div>
                
                {/* Opción "Disponibles" */}
                <div
                  onClick={() => handleSeleccionarOdontologo('disponibles')}
                  style={{
                    padding: '0.75rem',
                    cursor: 'pointer',
                    borderBottom: '1px solid #f0f0f0',
                    backgroundColor: filtroTipo === 'disponibles' ? '#f7f9fc' : 'white',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (filtroTipo !== 'disponibles') e.target.style.backgroundColor = '#f7f9fc';
                  }}
                  onMouseLeave={(e) => {
                    if (filtroTipo !== 'disponibles') e.target.style.backgroundColor = 'white';
                  }}
                >
                  <div style={{ fontWeight: '500', color: '#1c1c1e' }}>
                    Disponibles ({odontologosDisponibles.length})
                  </div>
                </div>
                
                {/* Lista de odontólogos filtrados */}
                {odontologosFiltradosPorBusqueda.length > 0 ? (
                  odontologosFiltradosPorBusqueda.map((odontologo) => {
                    const estaDisponible = odontologosDisponibles.includes(odontologo.userId);
                    const estaSeleccionado = odontologoSeleccionado?.userId === odontologo.userId;
                    return (
                      <div
                        key={odontologo.userId}
                        onClick={() => handleSeleccionarOdontologo(odontologo)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: estaSeleccionado ? '#f7f9fc' : 'white',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!estaSeleccionado) e.target.style.backgroundColor = '#f7f9fc';
                        }}
                        onMouseLeave={(e) => {
                          if (!estaSeleccionado) e.target.style.backgroundColor = 'white';
                        }}
                      >
                        <div style={{ fontWeight: '500', color: '#1c1c1e', marginBottom: '0.25rem' }}>
                          Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#667085' }}>
                          Mat. {odontologo.matricula}
                          {estaDisponible && (
                            <span style={{ color: '#28a745', marginLeft: '0.5rem' }}>✓ Disponible</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : busquedaOdontologo.length >= 1 ? (
                  <div style={{ padding: '0.75rem', color: '#667085', textAlign: 'center' }}>
                    No se encontraron odontólogos
                  </div>
                ) : (
                  // Si no hay búsqueda, mostrar todos los odontólogos
                  odontologos?.map((odontologo) => {
                    const estaDisponible = odontologosDisponibles.includes(odontologo.userId);
                    const estaSeleccionado = odontologoSeleccionado?.userId === odontologo.userId;
                    return (
                      <div
                        key={odontologo.userId}
                        onClick={() => handleSeleccionarOdontologo(odontologo)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          backgroundColor: estaSeleccionado ? '#f7f9fc' : 'white',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!estaSeleccionado) e.target.style.backgroundColor = '#f7f9fc';
                        }}
                        onMouseLeave={(e) => {
                          if (!estaSeleccionado) e.target.style.backgroundColor = 'white';
                        }}
                      >
                        <div style={{ fontWeight: '500', color: '#1c1c1e', marginBottom: '0.25rem' }}>
                          Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#667085' }}>
                          Mat. {odontologo.matricula}
                          {estaDisponible && (
                            <span style={{ color: '#28a745', marginLeft: '0.5rem' }}>✓ Disponible</span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
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
            <div className="header-cell">Hora</div>
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

