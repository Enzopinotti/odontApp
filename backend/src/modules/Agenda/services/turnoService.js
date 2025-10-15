import * as repo from '../repositories/turnoRepository.js';
import * as disponibilidadRepo from '../repositories/disponibilidadRepository.js';
import * as notaRepo from '../repositories/notaRepository.js';
import ApiError from '../../../utils/ApiError.js';
import { EstadoTurno } from '../models/enums.js';

// turnoService.js
import TurnoSujeto from "../notifiers/turnoSujeto.js";
import PacienteObserver from "../notifiers/pacienteObserver.js";
import OdontologoObserver from "../notifiers/odontologoObserver.js";


export const buscarConFiltros = async (filtros, page, perPage) => {
  const { rows, count } = await repo.findFiltered(filtros, page, perPage);
  return { data: rows, total: count };
};

export const obtenerTurnoPorId = async (id) => {
  const turno = await repo.findById(id);
  if (!turno) {
    throw new ApiError('Turno no encontrado', 404, null, 'TURNO_INEXISTENTE');
  }
  return turno;
};

// CU-AG01.2: Generar ID único para el turno (formato: T-AAAAMMDD-NNN)
const generarIdUnico = (fecha) => {
  const fechaStr = fecha.toISOString().split('T')[0].replace(/-/g, '');
  const numeroSecuencial = Math.floor(Math.random() * 999) + 1;
  return `T-${fechaStr}-${numeroSecuencial.toString().padStart(3, '0')}`;
};

export const crearTurno = async (data, recepcionistaId) => {
  // Validar que la fecha sea futura
  const fechaHora = new Date(data.fechaHora);
  if (fechaHora <= new Date()) {
    throw new ApiError('La fecha del turno debe ser futura', 400, null, 'FECHA_INVALIDA');
  }

  // RN-AG03: Validar duración mínima 15 minutos, máximo 120
  if (data.duracion < 15 || data.duracion > 120) {
    throw new ApiError('La duración debe estar entre 15 y 120 minutos', 400, null, 'DURACION_INVALIDA');
  }

  // RN-AG01: Verificar solapamiento con otros turnos del mismo odontólogo
  const solapamiento = await repo.verificarSolapamiento(
    fechaHora, 
    data.duracion, 
    data.odontologoId
  );
  
  if (solapamiento) {
    throw new ApiError('El horario se solapa con otro turno existente', 409, null, 'SOLAPAMIENTO_TURNO');
  }
  
  // RN-AG02: Verificar que el turno esté dentro de un bloque laboral
  const esDisponible = await disponibilidadRepo.validarDisponibilidad(
    fechaHora.toISOString().split('T')[0],
    fechaHora.toTimeString().slice(0, 5),
    new Date(fechaHora.getTime() + data.duracion * 60000).toTimeString().slice(0, 5),
    data.odontologoId
  );

  if (!esDisponible) {
    throw new ApiError('El horario no está dentro de los bloques laborales del odontólogo', 409, null, 'HORARIO_NO_DISPONIBLE');
  }

  // Generar ID único para el turno
  const idUnico = generarIdUnico(fechaHora);

  // Crear el turno
  const turnoData = {
    ...data,
    fechaHora,
    recepcionistaId,
    idUnico, // Agregar ID único
    estado: EstadoTurno.PENDIENTE
  };

  const turno = await repo.create(turnoData);


  // --- Notificación ---
  const mensaje = `Se ha creado un nuevo turno para ${fechaHora.toLocaleString()} con duración de ${data.duracion} minutos.`;
  await NotificacionService.enviarNotificacionesTurno(turno, mensaje);

  return await repo.findById(turno.id); // Retornar con relaciones
};

export const actualizarTurno = async (id, data, usuarioId) => {
  const turno = await obtenerTurnoPorId(id);
  
  // Solo se puede actualizar turnos pendientes
  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se pueden actualizar turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  // Si se cambia la fecha/hora, validar nuevamente
  if (data.fechaHora || data.duracion || data.odontologoId) {
    const fechaHora = data.fechaHora ? new Date(data.fechaHora) : turno.fechaHora;
    const duracion = data.duracion || turno.duracion;
    const odontologoId = data.odontologoId || turno.odontologoId;

    // Verificar solapamiento
    const solapamiento = await repo.verificarSolapamiento(
      fechaHora, 
      duracion, 
      odontologoId,
      id
    );
    
    if (solapamiento) {
      throw new ApiError('El nuevo horario se solapa con otro turno existente', 409, null, 'SOLAPAMIENTO_TURNO');
    }
  }
  
  // Actualizar el turno
  const turnoActualizado = await repo.update(turno, data);

  // Armar mensaje de notificación según los cambios
  let mensaje = '';
  if (data.fechaHora || data.duracion) {
    mensaje += `El turno se ha modificado a ${fechaHora.toLocaleString()} con duración de ${duracion} minutos. `;
  }
  if (data.odontologoId && data.odontologoId !== turno.odontologoId) {
    mensaje += `Se asignó un nuevo odontólogo.`;
  }

  // Enviar notificación solo si hubo cambios importantes
  if (mensaje) {
    await NotificacionService.enviarNotificacionesTurno(turnoActualizado, mensaje);
  }

  return turnoActualizado;
};

export const eliminarTurno = async (id, usuarioId) => {
  const turno = await obtenerTurnoPorId(id);
  
  // Solo se pueden eliminar turnos pendientes
  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se pueden eliminar turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  await repo.remove(turno);
};

export const cancelarTurno = async (id, motivo, usuarioId) => {
  const turno = await obtenerTurnoPorId(id);
  
  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se pueden cancelar turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  // Cancelar el turno
  await turno.cancelar(motivo);

  // Agregar nota si se proporciona motivo
  if (motivo) {
    await notaRepo.create({
      descripcion: `Turno cancelado: ${motivo}`,
      turnoId: id,
      usuarioId
    });
  }

  return await repo.findById(id);
};

export const marcarAsistencia = async (id, nota, usuarioId) => {
  const turno = await obtenerTurnoPorId(id);
  
  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se puede marcar asistencia en turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  // Verificar que el turno ya haya pasado
  if (turno.fechaHora > new Date()) {
    throw new ApiError('No se puede marcar asistencia antes de la hora del turno', 400, null, 'TURNO_NO_PASADO');
  }

  // Marcar asistencia
  await turno.marcarAsistencia();

  // Agregar nota si se proporciona
  if (nota) {
    await notaRepo.create({
      descripcion: nota,
      turnoId: id,
      usuarioId
    });
  }

  return await repo.findById(id);
};

export const marcarAusencia = async (id, motivo, usuarioId) => {
  const turno = await obtenerTurnoPorId(id);
  
  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se puede marcar ausencia en turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  // Marcar ausencia
  await turno.marcarAusencia();

  // Agregar nota con el motivo
  const descripcion = motivo ? `Ausente: ${motivo}` : 'Ausente';
  await notaRepo.create({
    descripcion,
    turnoId: id,
    usuarioId
  });

  return await repo.findById(id);
};

export const reprogramarTurno = async (id, nuevaFechaHora, usuarioId) => {
  const turno = await obtenerTurnoPorId(id);
  
  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se pueden reprogramar turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  const fechaHora = new Date(nuevaFechaHora);
  
  // Validar que la nueva fecha sea futura
  if (fechaHora <= new Date()) {
    throw new ApiError('La nueva fecha del turno debe ser futura', 400, null, 'FECHA_INVALIDA');
  }

  // Verificar solapamiento con el nuevo horario
  const solapamiento = await repo.verificarSolapamiento(
    fechaHora, 
    turno.duracion, 
    turno.odontologoId,
    id
  );
  
  if (solapamiento) {
    throw new ApiError('El nuevo horario se solapa con otro turno existente', 409, null, 'SOLAPAMIENTO_TURNO');
  }

  // Verificar disponibilidad
  const esDisponible = await disponibilidadRepo.validarDisponibilidad(
    fechaHora.toISOString().split('T')[0],
    fechaHora.toTimeString().slice(0, 5),
    new Date(fechaHora.getTime() + turno.duracion * 60000).toTimeString().slice(0, 5),
    turno.odontologoId
  );

  if (!esDisponible) {
    throw new ApiError('El nuevo horario no está disponible', 409, null, 'HORARIO_NO_DISPONIBLE');
  }

  // Reprogramar el turno
  await turno.reprogramar(fechaHora);

  // Agregar nota de reprogramación
  await notaRepo.create({
    descripcion: `Turno reprogramado de ${turno.fechaHora} a ${fechaHora}`,
    turnoId: id,
    usuarioId
  });

  return await repo.findById(id);
};

export const obtenerAgendaPorFecha = async (fecha, odontologoId = null) => {
  return await repo.obtenerTurnosPorFecha(fecha, odontologoId);
};

export const obtenerSlotsDisponibles = async (fecha, odontologoId, duracion = 30) => {
  return await disponibilidadRepo.generarSlotsDisponibles(fecha, odontologoId, duracion);
};

// CU-AG01.1: Obtener turnos pendientes concluidos (para registrar asistencia)
export const obtenerTurnosPendientesConcluidos = async (fecha = null) => {
  const fechaBusqueda = fecha ? new Date(fecha) : new Date();
  fechaBusqueda.setHours(0, 0, 0, 0);
  
  const fechaFin = new Date(fechaBusqueda);
  fechaFin.setHours(23, 59, 59, 999);
  
  const turnos = await repo.buscarConFiltros({
    fechaDesde: fechaBusqueda,
    fechaHasta: fechaFin,
    estado: EstadoTurno.PENDIENTE
  });
  
  const ahora = new Date();
  
  // Filtrar turnos cuya hora de fin ya transcurrió
  return turnos.data.filter(turno => {
    const fechaHoraTurno = new Date(turno.fechaHora);
    const horaFinTurno = new Date(fechaHoraTurno.getTime() + (turno.duracion * 60 * 1000));
    return horaFinTurno <= ahora;
  });
};

// CU-AG01.2: Buscar pacientes para autocompletado
export const buscarPacientes = async (termino) => {
  // Esta función debería interactuar con el módulo de Pacientes
  // Por ahora simulamos la funcionalidad
  try {
    // En una implementación real, esto haría una consulta al módulo Clinica
    // const pacientes = await pacienteRepo.buscarPorTermino(termino);
    
    // Simulación de búsqueda
    const pacientesMock = [
      { id: 1, dni: '12345678', nombre: 'Juan', apellido: 'Pérez', telefono: '1234567890' },
      { id: 2, dni: '87654321', nombre: 'María', apellido: 'García', telefono: '0987654321' }
    ];
    
    return pacientesMock.filter(p => 
      p.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      p.apellido.toLowerCase().includes(termino.toLowerCase()) ||
      p.dni.includes(termino)
    );
  } catch (error) {
    console.error('Error al buscar pacientes:', error);
    return [];
  }
};

// CU-AG01.2: Crear paciente rápido (flujo alternativo 3a)
export const crearPacienteRapido = async (datosMinimos) => {
  const { dni, nombre, apellido, telefono } = datosMinimos;
  
  // Validar datos mínimos requeridos
  if (!dni || !nombre || !apellido || !telefono) {
    throw new ApiError('DNI, nombre, apellido y teléfono son requeridos para crear un paciente', 400, null, 'DATOS_INCOMPLETOS');
  }
  
  try {
    // En una implementación real, esto interactuaría con el módulo Clinica
    // const paciente = await pacienteRepo.create(datosMinimos);
    
    // Simulación de creación rápida
    const pacienteNuevo = {
      id: Math.floor(Math.random() * 1000) + 100,
      dni,
      nombre,
      apellido,
      telefono,
      fechaCreacion: new Date()
    };
    
    return pacienteNuevo;
  } catch (error) {
    if (error.message.includes('dni')) {
      throw new ApiError('Ya existe un paciente con ese DNI', 409, null, 'DNI_DUPLICADO');
    }
    throw new ApiError('Error al crear paciente: ' + error.message, 500);
  }
};

// CU-AG01.2: Obtener odontólogos disponibles por especialidad
export const obtenerOdontologosPorEspecialidad = async (especialidad = null) => {
  try {
    // En una implementación real, esto interactuaría con el módulo Usuarios
    // const odontologos = await odontologoRepo.buscarPorEspecialidad(especialidad);
    
    // Simulación
    const odontologosMock = [
      { id: 1, nombre: 'Dr. Juan', apellido: 'Pérez', especialidad: 'Ortodoncia' },
      { id: 2, nombre: 'Dra. María', apellido: 'García', especialidad: 'Endodoncia' },
      { id: 3, nombre: 'Dr. Carlos', apellido: 'López', especialidad: 'Cirugía' }
    ];
    
    if (especialidad) {
      return odontologosMock.filter(o => o.especialidad.toLowerCase().includes(especialidad.toLowerCase()));
    }
    
    return odontologosMock;
  } catch (error) {
    console.error('Error al obtener odontólogos:', error);
    return [];
  }
};

// CU-AG01.2: Obtener tratamientos disponibles
export const obtenerTratamientos = async () => {
  // Simulación de tratamientos comunes
  return [
    { id: 1, nombre: 'Consulta General', duracionDefault: 30 },
    { id: 2, nombre: 'Limpieza Dental', duracionDefault: 45 },
    { id: 3, nombre: 'Extracción Simple', duracionDefault: 30 },
    { id: 4, nombre: 'Extracción Compleja', duracionDefault: 60 },
    { id: 5, nombre: 'Endodoncia', duracionDefault: 90 },
    { id: 6, nombre: 'Ortodoncia - Control', duracionDefault: 30 },
    { id: 7, nombre: 'Cirugía Menor', duracionDefault: 60 },
    { id: 8, nombre: 'Prótesis', duracionDefault: 45 }
  ];
};

// RN-AG06: Marcar ausencia automática si no hay registro 15 min después de hora fin
export const procesarAusenciasAutomaticas = async () => {
  const ahora = new Date();
  const hace15Min = new Date(ahora.getTime() - (15 * 60 * 1000));
  
  const turnos = await repo.buscarConFiltros({
    estado: EstadoTurno.PENDIENTE
  });
  
  const turnosVencidos = turnos.data.filter(turno => {
    const fechaHoraTurno = new Date(turno.fechaHora);
    const horaFinTurno = new Date(fechaHoraTurno.getTime() + (turno.duracion * 60 * 1000));
    return horaFinTurno <= hace15Min;
  });
  
  const procesados = [];
  
  for (const turno of turnosVencidos) {
    try {
      await marcarAusencia(turno.id, 'Ausencia automática - sin registro de asistencia', 1); // Sistema
      procesados.push(turno.id);
    } catch (error) {
      console.error(`Error al procesar ausencia automática para turno ${turno.id}:`, error);
    }
  }
  
  return procesados;
};