import * as repo from '../repositories/turnoRepository.js';
import * as disponibilidadRepo from '../repositories/disponibilidadRepository.js';
import * as notaRepo from '../repositories/notaRepository.js';
import ApiError from '../../../utils/ApiError.js';
import { EstadoTurno } from '../models/enums.js';

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

export const crearTurno = async (data, recepcionistaId) => {
  // Validar que la fecha sea futura
  const fechaHora = new Date(data.fechaHora);
  if (fechaHora <= new Date()) {
    throw new ApiError('La fecha del turno debe ser futura', 400, null, 'FECHA_INVALIDA');
  }

  // Validar duración
  if (data.duracion < 15 || data.duracion > 120) {
    throw new ApiError('La duración debe estar entre 15 y 120 minutos', 400, null, 'DURACION_INVALIDA');
  }

  // Verificar solapamiento con otros turnos
  const solapamiento = await repo.verificarSolapamiento(
    fechaHora, 
    data.duracion, 
    data.odontologoId
  );
  
  if (solapamiento) {
    throw new ApiError('El horario se solapa con otro turno existente', 409, null, 'SOLAPAMIENTO_TURNO');
  }

  // Verificar que el turno esté dentro de un bloque laboral
  const esDisponible = await disponibilidadRepo.validarDisponibilidad(
    fechaHora.toISOString().split('T')[0],
    fechaHora.toTimeString().slice(0, 5),
    new Date(fechaHora.getTime() + data.duracion * 60000).toTimeString().slice(0, 5),
    data.odontologoId
  );

  if (!esDisponible) {
    throw new ApiError('El horario no está dentro de los bloques laborales del odontólogo', 409, null, 'HORARIO_NO_DISPONIBLE');
  }

  // Crear el turno
  const turnoData = {
    ...data,
    fechaHora,
    recepcionistaId,
    estado: EstadoTurno.PENDIENTE
  };

  const turno = await repo.create(turnoData);
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

  return await repo.update(turno, data);
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
