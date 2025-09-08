import * as repo from '../repositories/disponibilidadRepository.js';
import * as turnoRepo from '../repositories/turnoRepository.js';
import ApiError from '../../../utils/ApiError.js';
import { TipoDisponibilidad } from '../models/enums.js';

export const buscarConFiltros = async (filtros, page, perPage) => {
  const { rows, count } = await repo.findFiltered(filtros, page, perPage);
  return { data: rows, total: count };
};

export const obtenerDisponibilidadPorId = async (id) => {
  const disponibilidad = await repo.findById(id);
  if (!disponibilidad) {
    throw new ApiError('Disponibilidad no encontrada', 404, null, 'DISPONIBILIDAD_INEXISTENTE');
  }
  return disponibilidad;
};

export const crearDisponibilidad = async (data, usuarioId) => {
  // Validar que la hora de fin sea posterior a la hora de inicio
  if (data.horaFin <= data.horaInicio) {
    throw new ApiError('La hora de fin debe ser posterior a la hora de inicio', 400, null, 'HORARIO_INVALIDO');
  }

  // Validar duración mínima de 1 hora
  const inicio = new Date(`2000-01-01T${data.horaInicio}`);
  const fin = new Date(`2000-01-01T${data.horaFin}`);
  const duracionMinutos = (fin - inicio) / (1000 * 60);
  
  if (duracionMinutos < 60) {
    throw new ApiError('Los bloques de disponibilidad deben ser de al menos 1 hora', 400, null, 'DURACION_INSUFICIENTE');
  }

  // Verificar solapamiento con otras disponibilidades
  const solapamiento = await repo.verificarSolapamiento(
    data.fecha,
    data.horaInicio,
    data.horaFin,
    data.odontologoId
  );

  if (solapamiento) {
    throw new ApiError('El horario se solapa con otra disponibilidad existente', 409, null, 'SOLAPAMIENTO_DISPONIBILIDAD');
  }

  // Si es un bloque no laboral, requerir motivo
  if (data.tipo === TipoDisponibilidad.NOLABORAL && !data.motivo) {
    throw new ApiError('Los días no laborables requieren un motivo', 400, null, 'MOTIVO_REQUERIDO');
  }

  return await repo.create(data);
};

export const actualizarDisponibilidad = async (id, data, usuarioId) => {
  const disponibilidad = await obtenerDisponibilidadPorId(id);

  // Si se cambia el horario, validar nuevamente
  if (data.horaInicio || data.horaFin || data.fecha || data.odontologoId) {
    const fecha = data.fecha || disponibilidad.fecha;
    const horaInicio = data.horaInicio || disponibilidad.horaInicio;
    const horaFin = data.horaFin || disponibilidad.horaFin;
    const odontologoId = data.odontologoId || disponibilidad.odontologoId;

    // Verificar solapamiento
    const solapamiento = await repo.verificarSolapamiento(
      fecha,
      horaInicio,
      horaFin,
      odontologoId,
      id
    );

    if (solapamiento) {
      throw new ApiError('El nuevo horario se solapa con otra disponibilidad existente', 409, null, 'SOLAPAMIENTO_DISPONIBILIDAD');
    }
  }

  return await repo.update(disponibilidad, data);
};

export const eliminarDisponibilidad = async (id, usuarioId) => {
  const disponibilidad = await obtenerDisponibilidadPorId(id);

  // Verificar si hay turnos futuros en este bloque
  const turnosFuturos = await turnoRepo.findFiltered({
    odontologoId: disponibilidad.odontologoId,
    fecha: disponibilidad.fecha
  });

  const turnosEnBloque = turnosFuturos.rows.filter(turno => {
    const turnoHora = turno.fechaHora.toTimeString().slice(0, 5);
    return turnoHora >= disponibilidad.horaInicio && turnoHora < disponibilidad.horaFin;
  });

  if (turnosEnBloque.length > 0) {
    throw new ApiError('No se puede eliminar un bloque con turnos futuros', 409, null, 'TURNOS_FUTUROS_EXISTENTES');
  }

  await repo.remove(disponibilidad);
};

export const obtenerDisponibilidadPorFecha = async (fecha, odontologoId) => {
  return await repo.obtenerDisponibilidadPorFecha(fecha, odontologoId);
};

export const obtenerDisponibilidadPorRango = async (fechaInicio, fechaFin, odontologoId) => {
  return await repo.obtenerDisponibilidadPorRango(fechaInicio, fechaFin, odontologoId);
};

export const obtenerDisponibilidadesPorOdontologo = async (odontologoId) => {
  return await repo.obtenerDisponibilidadesPorOdontologo(odontologoId);
};

export const generarDisponibilidadesAutomaticas = async (odontologoId, fechaInicio, fechaFin, horarioLaboral, usuarioId) => {
  // Validar fechas
  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);
  
  if (fechaInicioObj >= fechaFinObj) {
    throw new ApiError('La fecha de inicio debe ser anterior a la fecha de fin', 400, null, 'FECHAS_INVALIDAS');
  }

  // Validar horario laboral
  if (!horarioLaboral.horaInicio || !horarioLaboral.horaFin) {
    throw new ApiError('Se debe especificar hora de inicio y fin del horario laboral', 400, null, 'HORARIO_INVALIDO');
  }

  if (horarioLaboral.horaFin <= horarioLaboral.horaInicio) {
    throw new ApiError('La hora de fin debe ser posterior a la hora de inicio', 400, null, 'HORARIO_INVALIDO');
  }

  return await repo.generarDisponibilidadesAutomaticas(odontologoId, fechaInicio, fechaFin, horarioLaboral);
};

export const validarDisponibilidad = async (fecha, horaInicio, horaFin, odontologoId, disponibilidadIdExcluir = null) => {
  // Verificar solapamiento con otras disponibilidades
  const solapamiento = await repo.verificarSolapamiento(
    fecha,
    horaInicio,
    horaFin,
    odontologoId,
    disponibilidadIdExcluir
  );

  if (solapamiento) {
    return false;
  }

  // Verificar que existe un bloque laboral que contenga el horario
  const esDisponible = await repo.validarDisponibilidad(fecha, horaInicio, horaFin, odontologoId);
  
  return esDisponible;
};
