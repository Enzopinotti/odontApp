// src/features/agenda/pages/NuevoTurnoPaso1.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTratamientos, useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useSlotsDisponibles, useTurnosPorFecha } from '../hooks/useTurnos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import useAuth from '../../../features/auth/hooks/useAuth';
import useToast from '../../../hooks/useToast';
import BackBar from '../../../components/BackBar';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import {
  FaUserMd, FaTooth, FaCalendarAlt, FaClock, FaCheck, FaTimes, FaSearch,
  FaChevronLeft, FaChevronRight, FaInfoCircle, FaCalendarCheck
} from 'react-icons/fa';
import '../../../styles/agenda.scss';

// Configurar zona horaria de Argentina para todas las operaciones de fecha
// Esto asegura que las fechas se interpreten correctamente
const ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';

export default function NuevoTurnoPaso1() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const { pacientePreseleccionado } = location.state || {};

  // CU-AG01.5: Proteger ruta - Solo recepcionista puede crear turnos
  useEffect(() => {
    const esOdontologo = user?.Rol?.nombre?.toUpperCase() === 'ODONTÓLOGO';
    if (esOdontologo) {
      navigate('/agenda/diaria');
    }
  }, [user, navigate]);
  const [mesActual, setMesActual] = useState(new Date());
  const [fecha, setFecha] = useState(null);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [odontologoId, setOdontologoId] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  const [busquedaOdontologo, setBusquedaOdontologo] = useState('');
  const [mostrarListaOdontologos, setMostrarListaOdontologos] = useState(false);
  const odontologoInputRef = useRef(null);
  const odontologoListRef = useRef(null);
  const tratamientoInputRef = useRef(null); // Added for consistency with the snippet, though not strictly used for focus/blur here

  // Función helper para convertir hora string a minutos (debe estar antes de los useMemo que la usan)
  // Normaliza el formato de hora (puede venir como "HH:MM:SS" o "HH:MM")
  const horaStringToMinutes = (hora) => {
    if (!hora) return 0;
    // Normalizar: quitar segundos si existen
    const horaNormalizada = hora.length > 5 ? hora.substring(0, 5) : hora;
    const [h, m] = horaNormalizada.split(':');
    const horas = parseInt(h, 10) || 0;
    const minutos = parseInt(m, 10) || 0;
    return horas * 60 + minutos;
  };

  // Función helper para normalizar formato de hora (siempre devuelve "HH:MM")
  const normalizarHora = (hora) => {
    if (!hora) return '';
    // Si tiene más de 5 caracteres, tomar solo HH:MM
    return hora.length > 5 ? hora.substring(0, 5) : hora;
  };

  // Función helper para normalizar formato de fecha (siempre devuelve "YYYY-MM-DD")
  const normalizarFecha = (fecha) => {
    if (!fecha) return '';
    if (typeof fecha === 'string') {
      // Si viene como "YYYY-MM-DD" o "YYYY-MM-DDTHH:MM:SS" o "YYYY-MM-DDTHH:MM:SS.000Z"
      return fecha.split('T')[0].split(' ')[0];
    }
    if (fecha instanceof Date) {
      // Si es Date, convertir a formato YYYY-MM-DD
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${año}-${mes}-${dia}`;
    }
    return String(fecha);
  };

  const { data: tratamientos, isLoading: tratamientosLoading } = useTratamientos();
  const { data: odontologos, isLoading: odontologosLoading } = useOdontologosPorEspecialidad();

  // Filtrar odontólogos basado en la búsqueda
  const odontologosFiltrados = useMemo(() => {
    if (!odontologos || !Array.isArray(odontologos)) return [];

    if (!busquedaOdontologo || busquedaOdontologo.trim() === '') {
      return odontologos;
    }

    const termino = busquedaOdontologo.toLowerCase().trim();
    return odontologos.filter(odontologo => {
      const nombre = `${odontologo.Usuario?.nombre || ''} ${odontologo.Usuario?.apellido || ''}`.toLowerCase();
      const matricula = odontologo.matricula?.toLowerCase() || '';
      return nombre.includes(termino) || matricula.includes(termino);
    });
  }, [odontologos, busquedaOdontologo]);

  // Obtener el odontólogo seleccionado para mostrar en el input
  const odontologoSeleccionado = useMemo(() => {
    if (!odontologoId) return null;
    return odontologos?.find(o => o.userId === odontologoId);
  }, [odontologoId, odontologos]);

  // Actualizar búsqueda cuando se selecciona un odontólogo
  useEffect(() => {
    if (odontologoSeleccionado) {
      setBusquedaOdontologo(`Dr. ${odontologoSeleccionado.Usuario?.nombre} ${odontologoSeleccionado.Usuario?.apellido}`);
    }
  }, [odontologoSeleccionado]);

  // Cerrar lista al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        odontologoInputRef.current &&
        !odontologoInputRef.current.contains(event.target) &&
        odontologoListRef.current &&
        !odontologoListRef.current.contains(event.target)
      ) {
        setMostrarListaOdontologos(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calcular rango del mes para obtener disponibilidades
  const fechaInicioMes = useMemo(() => {
    const inicio = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    return inicio.toISOString().split('T')[0];
  }, [mesActual]);

  const fechaFinMes = useMemo(() => {
    const fin = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    return fin.toISOString().split('T')[0];
  }, [mesActual]);

  const { data: disponibilidadesMes, isLoading: loadingDisponibilidades } = useDisponibilidadesSemanal(
    fechaInicioMes,
    fechaFinMes,
    odontologoId
  );

  // Obtener disponibilidades del día seleccionado (si hay fecha)
  const { data: disponibilidadesDia, isLoading: loadingDisponibilidadesDia } = useDisponibilidadesSemanal(
    fecha || fechaInicioMes,
    fecha || fechaInicioMes,
    odontologoId
  );

  // Log de disponibilidades recibidas
  useEffect(() => {
    if (disponibilidadesDia && fecha && odontologoId) {
      console.log('[NuevoTurnoPaso1] Disponibilidades del día recibidas:', {
        fecha,
        odontologoId,
        cantidad: disponibilidadesDia.length,
        disponibilidades: disponibilidadesDia.map(d => ({
          id: d.id,
          fecha: d.fecha,
          fechaTipo: typeof d.fecha,
          fechaNormalizada: normalizarFecha(d.fecha),
          odontologoId: d.odontologoId,
          tipo: d.tipo,
          horaInicio: d.horaInicio,
          horaFin: d.horaFin
        }))
      });
    }
  }, [disponibilidadesDia, fecha, odontologoId]);

  // Obtener turnos del día seleccionado para marcar horarios ocupados
  const { data: turnosDiaData, isLoading: turnosDiaLoading } = useTurnosPorFecha(
    fecha && odontologoId ? fecha : null,
    fecha && odontologoId ? odontologoId : null
  );

  // Obtener días con disponibilidad y días no laborales en el mes
  const diasConDisponibilidad = useMemo(() => {
    if (!disponibilidadesMes) return { disponibles: new Set(), noLaborales: new Set() };

    const diasDisponibles = new Set();
    const diasNoLaborales = new Set();

    disponibilidadesMes.forEach(disp => {
      // Parsear la fecha manualmente para evitar problemas de zona horaria
      // La fecha viene en formato "YYYY-MM-DD", extraer el día directamente
      let dia;
      if (typeof disp.fecha === 'string') {
        // Formato: "YYYY-MM-DD"
        const partes = disp.fecha.split('-');
        if (partes.length === 3) {
          dia = parseInt(partes[2], 10);
        } else {
          // Fallback: usar Date pero en zona horaria local
          const fechaLocal = new Date(disp.fecha + 'T12:00:00'); // Usar mediodía para evitar problemas de zona horaria
          dia = fechaLocal.getDate();
        }
      } else if (disp.fecha instanceof Date) {
        dia = disp.fecha.getDate();
      } else {
        // Si viene como objeto con propiedades
        const fechaStr = disp.fecha.toString();
        const partes = fechaStr.split('-');
        if (partes.length === 3) {
          dia = parseInt(partes[2], 10);
        } else {
          const fechaLocal = new Date(fechaStr + 'T12:00:00');
          dia = fechaLocal.getDate();
        }
      }

      // Si se seleccionó un odontólogo específico, filtrar por ese odontólogo
      // Usar comparación robusta (string) para evitar problemas de tipos
      const coincideOdontologo = !odontologoId || String(disp.odontologoId) === String(odontologoId);

      if (coincideOdontologo) {
        if (disp.tipo === 'LABORAL') {
          diasDisponibles.add(dia);
        } else if (disp.tipo === 'NOLABORAL') {
          diasNoLaborales.add(dia);
        }
      }
    });

    return {
      disponibles: diasDisponibles,
      noLaborales: diasNoLaborales
    };
  }, [disponibilidadesMes, odontologoId]);

  // Obtener slots disponibles (solo si hay odontólogo, fecha y tratamiento seleccionados)
  // La duración del tratamiento es importante para generar los slots correctos
  // Solo hacer la consulta si todos los parámetros están disponibles
  const { data: slots, isLoading: slotsLoading } = useSlotsDisponibles(
    fecha && odontologoId && tratamientoSeleccionado ? fecha : null,
    fecha && odontologoId && tratamientoSeleccionado ? odontologoId : null,
    tratamientoSeleccionado?.duracion || 30
  );
  const estaCargandoHorarios = slotsLoading || turnosDiaLoading || loadingDisponibilidades;

  // Obtener franjas de disponibilidad del odontólogo seleccionado para validación
  const franjasDisponibilidad = useMemo(() => {
    if (!disponibilidadesDia || !odontologoId || !fecha) return [];

    // Normalizar la fecha seleccionada para comparación
    const fechaNormalizada = normalizarFecha(fecha);

    console.log('[NuevoTurnoPaso1] Buscando franjas:', {
      fecha,
      fechaNormalizada,
      odontologoId,
      disponibilidadesDia: disponibilidadesDia.map(d => ({
        fecha: d.fecha,
        fechaNormalizada: normalizarFecha(d.fecha),
        odontologoId: d.odontologoId,
        tipo: d.tipo,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin
      }))
    });

    const franjas = disponibilidadesDia
      .filter(disp => {
        const dispFechaNormalizada = normalizarFecha(disp.fecha);
        const coincideFecha = dispFechaNormalizada === fechaNormalizada;
        const coincideOdontologo = disp.odontologoId === odontologoId;
        const esLaboral = disp.tipo === 'LABORAL';

        if (!coincideFecha) {
          console.log('[NuevoTurnoPaso1] Fecha no coincide:', {
            dispFecha: disp.fecha,
            dispFechaNormalizada,
            fechaSeleccionada: fecha,
            fechaNormalizada
          });
        }

        return coincideFecha && coincideOdontologo && esLaboral;
      })
      .map(disp => ({
        inicio: normalizarHora(disp.horaInicio),
        fin: normalizarHora(disp.horaFin)
      }))
      .filter(franja => franja.inicio && franja.fin); // Solo franjas válidas

    console.log('[NuevoTurnoPaso1] Franjas encontradas:', {
      fecha,
      fechaNormalizada,
      odontologoId,
      cantidad: franjas.length,
      franjas,
      totalDisponibilidades: disponibilidadesDia.length
    });

    return franjas;
  }, [disponibilidadesDia, fecha, odontologoId]);

  // Filtrar y validar slots: deben estar dentro de las franjas LABORAL del doctor
  const slotsFiltrados = useMemo(() => {
    if (!slots || slots.length === 0) {
      return [];
    }

    if (!franjasDisponibilidad || franjasDisponibilidad.length === 0) {
      // Si no hay franjas, no hay slots válidos
      return [];
    }

    // Función para verificar si un slot está dentro de alguna franja
    const estaDentroDeFranja = (inicioSlot, finSlot) => {
      const inicioMinutos = horaStringToMinutes(inicioSlot);
      const finMinutos = finSlot ? horaStringToMinutes(finSlot) : inicioMinutos + (tratamientoSeleccionado?.duracion || 30);

      return franjasDisponibilidad.some(franja => {
        const inicioFranja = horaStringToMinutes(franja.inicio);
        const finFranja = horaStringToMinutes(franja.fin);
        // El slot está dentro de la franja si su inicio y fin están dentro
        return inicioMinutos >= inicioFranja && finMinutos <= finFranja;
      });
    };

    // Formatear y filtrar slots
    const slotsFormateados = slots
      .map(slot => {
        if (typeof slot === 'string') {
          return { inicio: normalizarHora(slot), fin: null };
        }
        return {
          inicio: normalizarHora(slot.inicio),
          fin: slot.fin ? normalizarHora(slot.fin) : null
        };
      })
      .filter(slot => {
        // Validar que el slot esté dentro de alguna franja del doctor
        const valido = estaDentroDeFranja(slot.inicio, slot.fin);
        if (!valido) {
          console.log('[NuevoTurnoPaso1] Slot rechazado (fuera de franja):', {
            slot,
            franjas: franjasDisponibilidad
          });
        }
        return valido;
      });

    console.log('[NuevoTurnoPaso1] Slots filtrados:', {
      slotsOriginales: slots,
      slotsFiltrados: slotsFormateados,
      franjas: franjasDisponibilidad
    });

    return slotsFormateados;
  }, [slots, franjasDisponibilidad, tratamientoSeleccionado]);

  // Turnos existentes para marcar horarios ocupados
  const turnosDelDia = useMemo(() => {
    if (!turnosDiaData) return [];
    if (Array.isArray(turnosDiaData)) return turnosDiaData;
    if (turnosDiaData.data) {
      return Array.isArray(turnosDiaData.data) ? turnosDiaData.data : [];
    }
    if (turnosDiaData.rows) {
      return turnosDiaData.rows;
    }
    return [];
  }, [turnosDiaData]);

  const horariosOcupados = useMemo(() => {
    if (!turnosDelDia || turnosDelDia.length === 0) return [];
    if (!franjasDisponibilidad || franjasDisponibilidad.length === 0) return [];

    // Función para verificar si un horario está dentro de alguna franja de disponibilidad
    const estaDentroDeFranja = (inicioMinutos, finMinutos) => {
      return franjasDisponibilidad.some(franja => {
        const inicioFranja = horaStringToMinutes(franja.inicio);
        const finFranja = horaStringToMinutes(franja.fin);
        // El turno está dentro de la franja si su inicio está dentro y su fin también
        return inicioMinutos >= inicioFranja && finMinutos <= finFranja;
      });
    };

    return turnosDelDia
      .filter(turno => turno.estado !== 'CANCELADO')
      .map(turno => {
        // Parsear fechaHora considerando zona horaria de Argentina
        const fechaInicio = new Date(turno.fechaHora);
        // Usar métodos locales para obtener hora en zona horaria de Argentina
        const horaInicio = fechaInicio.getHours();
        const minutosInicio = fechaInicio.getMinutes();
        const inicio = normalizarHora(`${String(horaInicio).padStart(2, '0')}:${String(minutosInicio).padStart(2, '0')}`);

        const fechaFin = new Date(fechaInicio.getTime() + (turno.duracion || 30) * 60000);
        const horaFin = fechaFin.getHours();
        const minutosFin = fechaFin.getMinutes();
        const fin = normalizarHora(`${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`);
        const inicioMinutos = horaStringToMinutes(inicio);
        const finMinutos = horaStringToMinutes(fin);

        return {
          tipo: 'ocupado',
          inicio,
          fin,
          inicioMinutos,
          finMinutos,
          id: turno.id,
          motivo: turno.motivo || 'Horario ocupado',
          estado: turno.estado,
          estaDentroFranja: estaDentroDeFranja(inicioMinutos, finMinutos)
        };
      })
      .filter(turno => turno.estaDentroFranja); // Solo mostrar turnos dentro de las franjas del doctor
  }, [turnosDelDia, franjasDisponibilidad]);

  const horariosParaMostrar = useMemo(() => {
    // Si no hay fecha, odontólogo o tratamiento, no mostrar nada
    if (!fecha || !odontologoId || !tratamientoSeleccionado) {
      return [];
    }

    // Si no hay franjas de disponibilidad, no hay horarios disponibles
    if (!franjasDisponibilidad || franjasDisponibilidad.length === 0) {
      return [];
    }

    // Calcular rangos de horarios ocupados
    const horariosOcupadosConRango = horariosOcupados.map(h => ({
      ...h,
      inicioMinutos: horaStringToMinutes(h.inicio),
      finMinutos: horaStringToMinutes(h.fin || h.inicio) || horaStringToMinutes(h.inicio) + (tratamientoSeleccionado?.duracion || 30)
    }));

    // Filtrar slots disponibles: deben estar dentro de franjas Y no estar ocupados
    // Esta es la validación CRÍTICA - solo mostramos horarios que realmente están disponibles
    const disponibles = (slotsFiltrados || [])
      .filter(slot => {
        const inicioSlot = horaStringToMinutes(slot.inicio);
        const duracionSlot = tratamientoSeleccionado?.duracion || 30;
        const finSlot = slot.fin ? horaStringToMinutes(slot.fin) : inicioSlot + duracionSlot;

        // VALIDACIÓN 1: Debe estar dentro de alguna franja laboral
        // Usar la MISMA lógica que el backend:
        // Backend busca: horaInicioFranja <= horaInicioTurno && horaFinFranja >= horaFinTurno
        const estaDentroDeFranja = franjasDisponibilidad.some(franja => {
          const inicioFranja = horaStringToMinutes(franja.inicio);
          const finFranja = horaStringToMinutes(franja.fin);

          // Validación equivalente al backend:
          // - inicioFranja <= inicioSlot (el inicio de la franja debe ser <= al inicio del slot)
          // - finFranja >= finSlot (el fin de la franja debe ser >= al fin del slot)
          // Esto permite que un turno termine exactamente cuando termina la franja
          const dentro = inicioFranja <= inicioSlot && finFranja >= finSlot;

          if (!dentro) {
            console.log('[NuevoTurnoPaso1] Slot fuera de franja:', {
              slot: { inicio: slot.inicio, fin: slot.fin || `${Math.floor((inicioSlot + duracionSlot) / 60)}:${String((inicioSlot + duracionSlot) % 60).padStart(2, '0')}` },
              franja: { inicio: franja.inicio, fin: franja.fin },
              inicioSlot,
              finSlot,
              inicioFranja,
              finFranja,
              diferenciaInicio: inicioSlot - inicioFranja,
              diferenciaFin: finFranja - finSlot
            });
          }

          return dentro;
        });

        if (!estaDentroDeFranja) {
          return false; // No mostrar si no está dentro de franja
        }

        // VALIDACIÓN 2: No debe solaparse con ningún turno ocupado
        // Un slot está ocupado si se solapa con algún turno existente
        const noEstaOcupado = !horariosOcupadosConRango.some(h => {
          // Verificar solapamiento: 
          // - El inicio del slot está dentro del turno ocupado, O
          // - El fin del slot está dentro del turno ocupado, O
          // - El slot contiene completamente al turno ocupado
          const solapa = (inicioSlot >= h.inicioMinutos && inicioSlot < h.finMinutos) ||
            (finSlot > h.inicioMinutos && finSlot <= h.finMinutos) ||
            (inicioSlot <= h.inicioMinutos && finSlot >= h.finMinutos);

          if (solapa) {
            console.log('[NuevoTurnoPaso1] Slot solapa con turno ocupado:', {
              slot: { inicio: slot.inicio, fin: slot.fin || `${inicioSlot + duracionSlot}min` },
              ocupado: { inicio: h.inicio, fin: h.fin },
              inicioSlot,
              finSlot,
              inicioOcupado: h.inicioMinutos,
              finOcupado: h.finMinutos
            });
          }

          return solapa;
        });

        if (!noEstaOcupado) {
          return false; // No mostrar si está ocupado
        }

        // Si pasa ambas validaciones, el slot está disponible
        return true;
      })
      .map(slot => {
        const inicioNormalizado = normalizarHora(slot.inicio);
        const inicioMinutos = horaStringToMinutes(inicioNormalizado);
        const finMinutos = slot.fin ? horaStringToMinutes(normalizarHora(slot.fin)) : inicioMinutos + (tratamientoSeleccionado?.duracion || 30);
        const horasFin = Math.floor(finMinutos / 60);
        const minutosFin = finMinutos % 60;
        const finCalculado = `${String(horasFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`;

        return {
          tipo: 'libre',
          inicio: inicioNormalizado,
          fin: slot.fin ? normalizarHora(slot.fin) : finCalculado,
          inicioMinutos,
          finMinutos,
        };
      });

    // IMPORTANTE: Solo mostrar horarios DISPONIBLES (libres), NO mostrar ocupados
    // Si el usuario ve un horario, debe poder seleccionarlo sin errores
    return disponibles.sort((a, b) => horaStringToMinutes(a.inicio) - horaStringToMinutes(b.inicio));
  }, [slotsFiltrados, horariosOcupados, tratamientoSeleccionado, fecha, odontologoId, franjasDisponibilidad]);

  // Reset fecha y horario cuando cambia el odontólogo
  useEffect(() => {
    setFecha(null);
    setHorarioSeleccionado(null);
    setTratamientoSeleccionado(null);
  }, [odontologoId]);

  // Reset horario cuando cambia la fecha o el tratamiento
  useEffect(() => {
    setHorarioSeleccionado(null);
  }, [fecha, tratamientoSeleccionado]);

  // Generar días del mes para el calendario
  const diasDelMes = useMemo(() => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay(); // 0 = domingo, 1 = lunes, etc.

    const dias = [];

    // Agregar días vacíos al inicio para alinear el calendario
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }

    // Agregar todos los días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaCompleta = new Date(año, mes, dia);
      // Formatear fecha en zona horaria local para evitar problemas de UTC
      const añoStr = año.toString();
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaStr = `${añoStr}-${mesStr}-${diaStr}`;
      const hoy = new Date();
      const esPasado = fechaCompleta < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const tieneDisponibilidad = diasConDisponibilidad.disponibles.has(dia);
      const esNoLaboral = diasConDisponibilidad.noLaborales.has(dia);

      dias.push({
        numero: dia,
        fecha: fechaStr,
        esPasado,
        tieneDisponibilidad,
        esNoLaboral,
        esSeleccionado: fecha === fechaStr
      });
    }

    return dias;
  }, [mesActual, diasConDisponibilidad, fecha]);

  const cambiarMes = (direccion) => {
    setMesActual(prev => {
      const nuevo = new Date(prev);
      nuevo.setMonth(prev.getMonth() + direccion);
      return nuevo;
    });
  };

  const irMesActual = () => {
    setMesActual(new Date());
  };

  const handleSiguiente = () => {
    if (!tratamientoSeleccionado || !horarioSeleccionado || !odontologoId || !fecha) {
      showToast('Por favor completa todos los campos', 'error');
      return;
    }

    // Validar que el horario seleccionado esté dentro de las franjas del doctor
    if (!franjasDisponibilidad || franjasDisponibilidad.length === 0) {
      console.error('[NuevoTurnoPaso1] No hay franjas disponibles', { fecha, odontologoId, franjasDisponibilidad });
      showToast('No hay franjas horarias disponibles para este profesional', 'error');
      return;
    }

    const horarioNormalizado = normalizarHora(horarioSeleccionado);
    const inicioMinutos = horaStringToMinutes(horarioNormalizado);
    const duracion = Number(tratamientoSeleccionado.duracionMin || tratamientoSeleccionado.duracion || 30);
    const finMinutos = inicioMinutos + duracion;

    // VALIDACIÓN FINAL: Verificar que el horario seleccionado esté en la lista de disponibles
    // Si el horario está en la lista de disponibles, significa que pasó todas las validaciones
    const horarioEnDisponibles = horariosParaMostrar.some(h =>
      h.tipo === 'libre' && normalizarHora(h.inicio) === horarioNormalizado
    );

    if (!horarioEnDisponibles) {
      console.error('[NuevoTurnoPaso1] Horario no está en la lista de disponibles:', {
        horarioSeleccionado: horarioNormalizado,
        horariosDisponibles: horariosParaMostrar.filter(h => h.tipo === 'libre').map(h => h.inicio)
      });
      showToast('El horario seleccionado no está disponible', 'error');
      return;
    }

    // Verificar que el horario esté dentro de alguna franja (validación adicional)
    // IMPORTANTE: Usar la misma lógica que el backend
    // Backend busca: horaInicioFranja <= horaInicioTurno && horaFinFranja >= horaFinTurno
    const estaDentroDeFranja = franjasDisponibilidad.some(franja => {
      const inicioFranja = horaStringToMinutes(franja.inicio);
      const finFranja = horaStringToMinutes(franja.fin);

      // Validación equivalente al backend:
      // - inicioFranja <= inicioMinutos (el inicio de la franja debe ser <= al inicio del turno)
      // - finFranja >= finMinutos (el fin de la franja debe ser >= al fin del turno)
      const dentro = inicioFranja <= inicioMinutos && finFranja >= finMinutos;

      if (!dentro) {
        console.log('[NuevoTurnoPaso1] Horario fuera de franja:', {
          horario: horarioNormalizado,
          inicioMinutos,
          finMinutos,
          duracion,
          franja: { inicio: franja.inicio, fin: franja.fin, inicioFranja, finFranja },
          validacion: {
            inicioFranjaMenorIgual: inicioFranja <= inicioMinutos,
            finFranjaMayorIgual: finFranja >= finMinutos,
            diferenciaInicio: inicioMinutos - inicioFranja,
            diferenciaFin: finFranja - finMinutos
          }
        });
      }

      return dentro;
    });

    if (!estaDentroDeFranja) {
      console.error('[NuevoTurnoPaso1] Validación fallida - no está en franja:', {
        horarioSeleccionado: horarioNormalizado,
        inicioMinutos,
        finMinutos,
        duracion,
        franjasDisponibilidad
      });
      showToast('El horario seleccionado no es válido para este profesional', 'error');
      return;
    }

    // Verificar que no esté ocupado (validación adicional)
    const noEstaOcupado = !horariosOcupados.some(h => {
      const hInicio = horaStringToMinutes(h.inicio);
      const hFin = horaStringToMinutes(h.fin);
      return (inicioMinutos >= hInicio && inicioMinutos < hFin) ||
        (finMinutos > hInicio && finMinutos <= hFin) ||
        (inicioMinutos <= hInicio && finMinutos >= hFin);
    });

    if (!noEstaOcupado) {
      console.error('[NuevoTurnoPaso1] Validación fallida - está ocupado:', {
        horarioSeleccionado: horarioNormalizado,
        inicioMinutos,
        finMinutos,
        horariosOcupados
      });
      showToast('El horario seleccionado ya está ocupado', 'error');
      return;
    }

    console.log('[NuevoTurnoPaso1] Validación exitosa:', {
      horarioSeleccionado: horarioNormalizado,
      inicioMinutos,
      finMinutos,
      duracion,
      franjasDisponibilidad
    });

    // Construir fechaHora usando componentes locales para zona horaria de Argentina
    // Parsear fecha y hora manualmente
    const [año, mes, dia] = fecha.split('-').map(Number);
    const [hora, minutos] = horarioNormalizado.split(':').map(Number);

    // Crear fecha en zona horaria local de Argentina
    // Usar Date constructor con componentes locales (no UTC)
    const fechaHoraObj = new Date(año, mes - 1, dia, hora, minutos, 0, 0);

    // IMPORTANTE: Al convertir a ISO, JavaScript lo convierte a UTC
    // Para mantener la hora local, necesitamos ajustar el offset de Argentina (UTC-3)
    // Pero mejor aún: enviar la fecha como string en formato local
    // Formato: YYYY-MM-DDTHH:MM:00 (sin Z, para que se interprete como local)
    const fechaHoraISO = `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}T${String(hora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:00`;

    // Validar que la fecha/hora construida es correcta
    const fechaResultante = fechaHoraObj.getFullYear() + '-' +
      String(fechaHoraObj.getMonth() + 1).padStart(2, '0') + '-' +
      String(fechaHoraObj.getDate()).padStart(2, '0');
    const horaResultante = String(fechaHoraObj.getHours()).padStart(2, '0') + ':' +
      String(fechaHoraObj.getMinutes()).padStart(2, '0');

    console.log('[NuevoTurnoPaso1] FechaHora construida:', {
      fecha,
      horario: horarioNormalizado,
      componentes: { año, mes, dia, hora, minutos },
      fechaHoraObj,
      fechaHoraISO: fechaHoraObj.toISOString(),
      fechaResultante,
      horaResultante,
      coincideFecha: fechaResultante === fecha,
      coincideHora: horaResultante === horarioNormalizado,
      duracion,
      // Mostrar también en minutos para validación
      inicioMinutos,
      finMinutos,
      finCalculado: `${Math.floor(finMinutos / 60)}:${String(finMinutos % 60).padStart(2, '0')}`
    });

    // Advertencia si hay discrepancia
    if (fechaResultante !== fecha || horaResultante !== horarioNormalizado) {
      console.warn('[NuevoTurnoPaso1] ¡ADVERTENCIA! Discrepancia en fecha/hora:', {
        esperado: { fecha, hora: horarioNormalizado },
        obtenido: { fecha: fechaResultante, hora: horaResultante }
      });
    }

    // Enviar fechaHora en formato ISO pero asegurando que se interprete como hora local de Argentina
    // El backend debe parsear esto correctamente considerando la zona horaria
    navigate('/agenda/turnos/nuevo/paso2', {
      state: {
        fechaHora: fechaHoraISO, // Enviar como string sin Z para que se interprete como local
        tratamiento: tratamientoSeleccionado,
        odontologoId,
        duracion: Number(duracion),
        // Agregar datos adicionales para debugging
        fechaOriginal: fecha,
        horaOriginal: horarioNormalizado,
        pacientePreseleccionado,
      },
    });
  };

  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="nuevo-turno-container">
      <BackBar title="Nuevo turno" subtitle="Elegir fecha y tratamiento" to="/agenda" />

      <div className="nuevo-turno-steps">
        <div className="step-item active">
          <div className="step-circle active"><FaCheck /></div>
          <div className="step-label active">Fecha y Tratamiento</div>
        </div>
        <div className="step-item">
          <div className="step-circle">2</div>
          <div className="step-label">Datos</div>
        </div>
        <div className="step-item">
          <div className="step-circle">3</div>
          <div className="step-label">Confirmar</div>
        </div>
      </div>

      <div className="nuevo-turno-form">
        {/* Paso 1: Seleccionar Odontólogo con búsqueda */}
        <div className="form-section">
          <label className="form-label">Odontólogo <span style={{ color: 'red' }}>*</span></label>
          {odontologosLoading ? (
            <div className="pacientes-loader">
              <Lottie animationData={loadingAnim} loop autoplay style={{ width: 150 }} />
            </div>
          ) : (
            <div ref={odontologoInputRef} style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <FaUserMd style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  pointerEvents: 'none',
                  zIndex: 1
                }} />
                <input
                  type="text"
                  value={busquedaOdontologo}
                  onChange={(e) => {
                    const valor = e.target.value;
                    setBusquedaOdontologo(valor);
                    setMostrarListaOdontologos(true);

                    // Si se limpia la búsqueda, limpiar también la selección
                    if (!valor || valor.trim() === '') {
                      setOdontologoId(null);
                      setFecha(null);
                      setHorarioSeleccionado(null);
                    }
                  }}
                  onFocus={() => setMostrarListaOdontologos(true)}
                  placeholder="Buscar odontólogo por nombre, apellido o matrícula..."
                  className="form-input"
                  style={{
                    fontSize: '1rem',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                />
                {odontologoId && (
                  <button
                    type="button"
                    onClick={() => {
                      setBusquedaOdontologo('');
                      setOdontologoId(null);
                      setFecha(null);
                      setHorarioSeleccionado(null);
                      setMostrarListaOdontologos(false);
                    }}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#6b7280',
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                    title="Limpiar selección"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>

              {mostrarListaOdontologos && odontologosFiltrados && odontologosFiltrados.length > 0 && (
                <div
                  ref={odontologoListRef}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.25rem',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000
                  }}
                >
                  {odontologosFiltrados.map(odontologo => (
                    <div
                      key={odontologo.userId}
                      onClick={() => {
                        setOdontologoId(odontologo.userId);
                        setBusquedaOdontologo(`Dr. ${odontologo.Usuario?.nombre} ${odontologo.Usuario?.apellido}`);
                        setMostrarListaOdontologos(false);
                        setFecha(null);
                        setHorarioSeleccionado(null);
                      }}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s ease',
                        backgroundColor: odontologoId === odontologo.userId ? '#f0f9ff' : 'white'
                      }}
                      onMouseEnter={(e) => {
                        if (odontologoId !== odontologo.userId) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (odontologoId !== odontologo.userId) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                      </div>
                      {odontologo.matricula && (
                        <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                          Mat. {odontologo.matricula}
                        </div>
                      )}
                      {odontologo.OdontologoEspecialidades?.[0]?.Especialidad?.nombre && (
                        <div style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: '0.15rem' }}>
                          {odontologo.OdontologoEspecialidades[0].Especialidad.nombre}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {mostrarListaOdontologos && busquedaOdontologo && odontologosFiltrados && odontologosFiltrados.length === 0 && (
                <div
                  ref={odontologoListRef}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.25rem',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#6b7280',
                    zIndex: 1000
                  }}
                >
                  No se encontraron odontólogos
                </div>
              )}
            </div>
          )}
        </div>

        {/* Paso 2: Calendario mensual y Tratamientos lado a lado */}
        {odontologoId && (
          <div className="form-section">
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              alignItems: 'start'
            }}>
              {/* Calendario mensual - Izquierda */}
              <div>
                <label className="form-label">Seleccione la fecha <span style={{ color: 'red' }}>*</span></label>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {/* Controles del calendario */}
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
                        fontSize: '1.2rem',
                        color: '#145c63'
                      }}
                    >
                      <FaChevronLeft />
                    </button>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                      {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
                    </h3>
                    <button
                      onClick={() => cambiarMes(1)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0.5rem',
                        fontSize: '1.2rem',
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
                      padding: '0.5rem',
                      marginBottom: '1rem',
                      background: '#f0f0f0',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Ir a este mes
                  </button>

                  {/* Días de la semana */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    {nombresDias.map(dia => (
                      <div key={dia} style={{
                        textAlign: 'center',
                        fontWeight: '600',
                        fontSize: '0.85rem',
                        color: '#666',
                        padding: '0.5rem'
                      }}>
                        {dia}
                      </div>
                    ))}
                  </div>

                  {/* Días del mes */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '0.5rem'
                  }}>
                    {diasDelMes.map((dia, idx) => {
                      if (!dia) {
                        return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />;
                      }

                      return (
                        <button
                          key={dia.numero}
                          onClick={() => {
                            if (!dia.esPasado && dia.tieneDisponibilidad) {
                              setFecha(dia.fecha);
                            }
                          }}
                          disabled={dia.esPasado || !dia.tieneDisponibilidad}
                          style={{
                            aspectRatio: '1',
                            border: dia.esSeleccionado
                              ? '2px solid #145c63'
                              : '1px solid #e0e0e0',
                            borderRadius: '8px',
                            background: dia.esSeleccionado
                              ? '#145c63'
                              : dia.esNoLaboral
                                ? '#fff3cd'
                                : dia.tieneDisponibilidad
                                  ? '#e8f5e9'
                                  : '#f5f5f5',
                            color: dia.esSeleccionado
                              ? 'white'
                              : dia.esPasado
                                ? '#ccc'
                                : dia.esNoLaboral
                                  ? '#856404'
                                  : dia.tieneDisponibilidad
                                    ? '#2e7d32'
                                    : '#999',
                            cursor: (!dia.esPasado && (dia.tieneDisponibilidad || dia.esNoLaboral)) ? 'pointer' : 'not-allowed',
                            fontWeight: dia.esSeleccionado ? '600' : '400',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                            opacity: dia.esPasado ? 0.5 : 1,
                            position: 'relative'
                          }}
                          onMouseEnter={(e) => {
                            if (!dia.esPasado && (dia.tieneDisponibilidad || dia.esNoLaboral) && !dia.esSeleccionado) {
                              if (dia.esNoLaboral) {
                                e.target.style.background = '#ffe69c';
                              } else {
                                e.target.style.background = '#c8e6c9';
                              }
                              e.target.style.transform = 'scale(1.05)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!dia.esPasado && (dia.tieneDisponibilidad || dia.esNoLaboral) && !dia.esSeleccionado) {
                              if (dia.esNoLaboral) {
                                e.target.style.background = '#fff3cd';
                              } else {
                                e.target.style.background = '#e8f5e9';
                              }
                              e.target.style.transform = 'scale(1)';
                            }
                          }}
                          title={
                            dia.esPasado
                              ? 'Fecha pasada'
                              : dia.esNoLaboral
                                ? `No laboral - ${dia.fecha}`
                                : dia.tieneDisponibilidad
                                  ? `Disponible - ${dia.fecha}`
                                  : 'Sin disponibilidad'
                          }
                        >
                          {dia.numero}
                          {dia.tieneDisponibilidad && !dia.esPasado && (
                            <FaCalendarCheck
                              style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                fontSize: '0.6rem',
                                color: dia.esSeleccionado ? 'white' : '#4caf50'
                              }}
                            />
                          )}
                          {dia.esNoLaboral && !dia.esPasado && (
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '2px',
                                right: '2px',
                                fontSize: '0.5rem',
                                color: dia.esSeleccionado ? 'white' : '#856404',
                                fontWeight: 'bold'
                              }}
                            >
                              ✕
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Leyenda */}
                  <div style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e0e0e0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.85rem',
                    color: '#666'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: '#e8f5e9',
                        border: '1px solid #4caf50',
                        borderRadius: '4px'
                      }} />
                      <span>Disponible</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: '#fff3cd',
                        border: '1px solid #ffc107',
                        borderRadius: '4px'
                      }} />
                      <span>No laboral</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        background: '#f5f5f5',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }} />
                      <span>Sin disponibilidad</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tratamientos - Derecha */}
              <div className="form-section">
                <label className="form-label">Tratamiento <span style={{ color: 'red' }}>*</span></label>
                {tratamientosLoading ? (
                  <div className="pacientes-loader">
                    <Lottie animationData={loadingAnim} loop autoplay style={{ width: 150 }} />
                  </div>
                ) : (
                  <div ref={tratamientoInputRef} className="tratamientos-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '1rem'
                  }}>
                    {tratamientos?.map(tratamiento => (
                      <div
                        key={tratamiento.id}
                        className={`tratamiento-card ${tratamientoSeleccionado?.id === tratamiento.id ? 'selected' : ''
                          }`}
                        onClick={() => {
                          setTratamientoSeleccionado(tratamiento);
                          setHorarioSeleccionado(null); // Reset horario al cambiar tratamiento
                        }}
                        style={{
                          padding: '1rem',
                          border: tratamientoSeleccionado?.id === tratamiento.id
                            ? '2px solid #145c63'
                            : '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: tratamientoSeleccionado?.id === tratamiento.id
                            ? '#e0f2f7'
                            : 'white',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div className="tratamiento-nombre" style={{
                          fontWeight: '600',
                          marginBottom: '0.5rem',
                          fontSize: '0.95rem'
                        }}>
                          {tratamiento.nombre}
                        </div>
                        <div className="tratamiento-duracion" style={{
                          fontSize: '0.85rem',
                          color: '#666'
                        }}>
                          {tratamiento.duracionMin || tratamiento.duracion || 30} min
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Horarios disponibles (después de seleccionar tratamiento) */}
        {odontologoId && fecha && tratamientoSeleccionado && (
          <div className="form-section">
            <label className="form-label">Horarios disponibles <span style={{ color: 'red' }}>*</span></label>
            {estaCargandoHorarios ? (
              <div className="pacientes-loader">
                <Lottie animationData={loadingAnim} loop autoplay style={{ width: 150 }} />
              </div>
            ) : (
              <div className="horarios-disponibles" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '0.75rem',
                marginTop: '0.5rem'
              }}>
                {horariosParaMostrar && horariosParaMostrar.length > 0 ? (
                  horariosParaMostrar.map((slot, idx) => {
                    const isOcupado = slot.tipo === 'ocupado';
                    const isSelected = !isOcupado && horarioSeleccionado === slot.inicio;
                    const displayText = slot.fin ? `${slot.inicio} - ${slot.fin}` : slot.inicio;
                    const slotKey = `${slot.tipo}-${slot.inicio}-${slot.fin || ''}-${slot.id || idx}`;

                    return (
                      <div
                        key={slotKey}
                        className={`horario-slot ${isSelected ? 'selected' : ''} ${isOcupado ? 'ocupado' : ''}`}
                        onClick={isOcupado ? undefined : () => setHorarioSeleccionado(normalizarHora(slot.inicio))}
                        title={
                          isOcupado
                            ? `${displayText} ocupado${slot.motivo ? ` - ${slot.motivo}` : ''}`
                            : slot.fin
                              ? `De ${slot.inicio} a ${slot.fin}`
                              : `A las ${slot.inicio}`
                        }
                        style={{
                          padding: '0.75rem 1rem',
                          border: isSelected
                            ? '2px solid #145c63'
                            : isOcupado
                              ? '1px solid #fca5a5'
                              : '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: isOcupado ? 'not-allowed' : 'pointer',
                          pointerEvents: isOcupado ? 'none' : 'auto',
                          background: isSelected
                            ? '#145c63'
                            : isOcupado
                              ? '#fee2e2'
                              : 'white',
                          color: isSelected
                            ? 'white'
                            : isOcupado
                              ? '#b91c1c'
                              : '#374151',
                          fontWeight: isSelected ? '600' : '400',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem',
                          minHeight: '68px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.25rem'
                        }}
                        onMouseEnter={(e) => {
                          if (!isOcupado && !isSelected) {
                            e.currentTarget.style.background = '#e0f2f7';
                            e.currentTarget.style.borderColor = '#145c63';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isOcupado && !isSelected) {
                            e.currentTarget.style.background = 'white';
                            e.currentTarget.style.borderColor = '#e0e0e0';
                          }
                        }}
                      >
                        {displayText}
                        {isOcupado && (
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#b91c1c' }}>
                            Ocupado
                          </span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state" style={{
                    gridColumn: '1 / -1',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    {(() => {
                      // Diagnosticar el problema
                      const tieneFranjas = franjasDisponibilidad && franjasDisponibilidad.length > 0;
                      const tieneSlots = slotsFiltrados && slotsFiltrados.length > 0;
                      const tieneOcupados = horariosOcupados && horariosOcupados.length > 0;
                      const tieneDisponibilidadesDia = disponibilidadesDia && disponibilidadesDia.length > 0;

                      console.log('[NuevoTurnoPaso1] Diagnóstico de horarios no disponibles:', {
                        fecha,
                        odontologoId,
                        tratamientoSeleccionado: tratamientoSeleccionado?.nombre,
                        tieneFranjas,
                        cantidadFranjas: franjasDisponibilidad?.length || 0,
                        tieneSlots,
                        cantidadSlots: slotsFiltrados?.length || 0,
                        tieneOcupados,
                        cantidadOcupados: horariosOcupados?.length || 0,
                        tieneDisponibilidadesDia,
                        cantidadDisponibilidadesDia: disponibilidadesDia?.length || 0,
                        disponibilidadesDia: disponibilidadesDia?.map(d => ({
                          fecha: d.fecha,
                          fechaNormalizada: normalizarFecha(d.fecha),
                          odontologoId: d.odontologoId,
                          tipo: d.tipo
                        }))
                      });

                      if (tieneOcupados && !tieneSlots) {
                        return 'Todos los horarios del día ya tienen un turno asignado.';
                      }

                      if (!tieneDisponibilidadesDia) {
                        return `No se encontraron disponibilidades para este odontólogo en la fecha ${fecha || 'seleccionada'}. Verifique que haya disponibilidades LABORAL configuradas.`;
                      }

                      if (!tieneFranjas) {
                        const disponibilidadesDelOdontologo = disponibilidadesDia.filter(d =>
                          d.odontologoId === odontologoId
                        );
                        const disponibilidadesLaborales = disponibilidadesDelOdontologo.filter(d =>
                          d.tipo === 'LABORAL'
                        );

                        return `No hay franjas LABORAL para este odontólogo en la fecha ${fecha || 'seleccionada'}. 
                        ${disponibilidadesDelOdontologo.length > 0
                            ? `Se encontraron ${disponibilidadesDelOdontologo.length} disponibilidad(es) pero ninguna es LABORAL.`
                            : `No se encontraron disponibilidades para este odontólogo en esta fecha.`}`;
                      }

                      if (!tieneSlots) {
                        return `No hay slots disponibles después de filtrar por franjas y horarios ocupados. 
                        Franjas encontradas: ${franjasDisponibilidad.length}. 
                        Horarios ocupados: ${horariosOcupados.length}.`;
                      }

                      return `No hay horarios disponibles para este odontólogo en la fecha seleccionada.
                      ${!fecha ? 'Por favor, seleccione una fecha.' : ''}
                      ${!tratamientoSeleccionado ? 'Por favor, seleccione un tratamiento.' : ''}
                      Verifique que haya disponibilidades LABORAL configuradas para este odontólogo en la fecha ${fecha || 'seleccionada'}.`;
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="nuevo-turno-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate('/agenda')}
        >
          Volver
        </button>
        <button
          className="btn-primary"
          onClick={handleSiguiente}
          disabled={!tratamientoSeleccionado || !horarioSeleccionado || !odontologoId || !fecha}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

