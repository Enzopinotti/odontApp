import * as repo from '../repositories/disponibilidadRepository.js';
import * as turnoRepo from '../repositories/turnoRepository.js';
import ApiError from '../../../utils/ApiError.js';
import { TipoDisponibilidad } from '../models/enums.js';
import { registrarLog } from '../../Usuarios/services/auditService.js';

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

  const nuevaDisponibilidad = await repo.create(data);
  
  // CU-AG02: Registrar auditoría
  try {
    await registrarLog(usuarioId, 'disponibilidad', 'crear', null);
  } catch (error) {
    console.error('Error al registrar auditoría de creación de disponibilidad:', error);
    // No fallar si la auditoría falla, solo loguear
  }
  
  return nuevaDisponibilidad;
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

  const disponibilidadActualizada = await repo.update(disponibilidad, data);
  
  // CU-AG02: Registrar auditoría
  try {
    await registrarLog(usuarioId, 'disponibilidad', 'modificar', null);
  } catch (error) {
    console.error('Error al registrar auditoría de modificación de disponibilidad:', error);
    // No fallar si la auditoría falla, solo loguear
  }
  
  return disponibilidadActualizada;
};

export const eliminarDisponibilidad = async (id, usuarioId) => {
  const disponibilidad = await obtenerDisponibilidadPorId(id);

  // Verificar si hay turnos futuros PENDIENTES en este bloque (no considerar CANCELADOS)
  const turnosFuturos = await turnoRepo.findFiltered({
    odontologoId: disponibilidad.odontologoId,
    fecha: disponibilidad.fecha,
    estado: 'PENDIENTE' // Solo considerar turnos pendientes
  });

  const turnosEnBloque = turnosFuturos.rows.filter(turno => {
    // Verificar que el turno esté dentro del rango horario del bloque
    // Normalizar fechas para comparación
    const fechaTurno = new Date(turno.fechaHora).toISOString().split('T')[0];
    const fechaDisponibilidad = disponibilidad.fecha instanceof Date 
      ? disponibilidad.fecha.toISOString().split('T')[0] 
      : disponibilidad.fecha.split('T')[0];
    
    // Primero verificar que las fechas coincidan
    if (fechaTurno !== fechaDisponibilidad) return false;
    
    // Luego verificar el rango horario
    const turnoHora = turno.fechaHora.toTimeString().slice(0, 5);
    return turnoHora >= disponibilidad.horaInicio && turnoHora < disponibilidad.horaFin;
  });

  if (turnosEnBloque.length > 0) {
    throw new ApiError('No se puede eliminar un bloque con turnos futuros', 409, null, 'TURNOS_FUTUROS_EXISTENTES');
  }

  await repo.remove(disponibilidad);
  
  // CU-AG02: Registrar auditoría
  try {
    await registrarLog(usuarioId, 'disponibilidad', 'eliminar', null);
  } catch (error) {
    console.error('Error al registrar auditoría de eliminación de disponibilidad:', error);
    // No fallar si la auditoría falla, solo loguear
  }
};

export const obtenerDisponibilidadPorFecha = async (fecha, odontologoId) => {
  return await repo.obtenerDisponibilidadPorFecha(fecha, odontologoId);
};

export const obtenerDisponibilidadPorRango = async (fechaInicio, fechaFin, odontologoId) => {
  // Normalizar fechas antes de buscar
  const normalizarFecha = (fecha) => {
    if (!fecha) return fecha;
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    if (typeof fecha === 'string') {
      return fecha.split('T')[0].split(' ')[0];
    }
    return fecha;
  };
  
  const fechaInicioNorm = normalizarFecha(fechaInicio);
  const fechaFinNorm = normalizarFecha(fechaFin);
  
  console.log('[disponibilidadService.obtenerDisponibilidadPorRango] Parámetros:', {
    fechaInicio,
    fechaInicioNormalizada: fechaInicioNorm,
    fechaFin,
    fechaFinNormalizada: fechaFinNorm,
    odontologoId
  });
  
  return await repo.obtenerDisponibilidadPorRango(fechaInicioNorm, fechaFinNorm, odontologoId);
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

  const disponibilidades = await repo.generarDisponibilidadesAutomaticas(odontologoId, fechaInicio, fechaFin, horarioLaboral);
  
  // Registrar auditoría
  try {
    await registrarLog(usuarioId, 'disponibilidad', 'crear', null);
  } catch (error) {
    console.error('Error al registrar auditoría de disponibilidades automáticas:', error);
  }
  
  return disponibilidades;
};

export const generarDisponibilidadesRecurrentes = async (data, usuarioId) => {
  const { odontologoId, tipoRecurrencia, diasSemana, diaSemana, posicionMes, horaInicio, horaFin, fechaInicio, fechaFin } = data;
  
  // Validar fechas
  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);
  
  if (fechaInicioObj >= fechaFinObj) {
    throw new ApiError('La fecha de inicio debe ser anterior a la fecha de fin', 400, null, 'FECHAS_INVALIDAS');
  }

  // Validar horario
  if (!horaInicio || !horaFin) {
    throw new ApiError('Se debe especificar hora de inicio y fin', 400, null, 'HORARIO_INVALIDO');
  }

  if (horaFin <= horaInicio) {
    throw new ApiError('La hora de fin debe ser posterior a la hora de inicio', 400, null, 'HORARIO_INVALIDO');
  }

  // Validar duración mínima
  const inicio = new Date(`2000-01-01T${horaInicio}`);
  const fin = new Date(`2000-01-01T${horaFin}`);
  const duracionMinutos = (fin - inicio) / (1000 * 60);
  if (duracionMinutos < 60) {
    throw new ApiError('La duración mínima es de 1 hora', 400, null, 'DURACION_INSUFICIENTE');
  }

  // Validar configuración según tipo de recurrencia
  let configuracion = {};
  if (tipoRecurrencia === 'semanal') {
    if (!diasSemana || !Array.isArray(diasSemana) || diasSemana.length === 0) {
      throw new ApiError('Debe seleccionar al menos un día de la semana', 400, null, 'CONFIGURACION_INVALIDA');
    }
    configuracion.diasSemana = diasSemana;
  } else if (tipoRecurrencia === 'mensual') {
    if (diaSemana === undefined || diaSemana === null || diaSemana === '') {
      throw new ApiError('Debe seleccionar un día de la semana', 400, null, 'CONFIGURACION_INVALIDA');
    }
    if (!posicionMes) {
      throw new ApiError('Debe seleccionar la posición en el mes', 400, null, 'CONFIGURACION_INVALIDA');
    }
    configuracion.diaSemana = parseInt(diaSemana);
    configuracion.posicionMes = posicionMes;
  } else {
    throw new ApiError('Tipo de recurrencia inválido', 400, null, 'TIPO_RECURRENCIA_INVALIDO');
  }

  const horarioLaboral = { horaInicio, horaFin };
  const disponibilidades = await repo.generarDisponibilidadesRecurrentes(
    odontologoId,
    tipoRecurrencia,
    configuracion,
    fechaInicio,
    fechaFin,
    horarioLaboral
  );
  
  // Registrar auditoría
  try {
    await registrarLog(usuarioId, 'disponibilidad', 'crear', null);
  } catch (error) {
    console.error('Error al registrar auditoría de disponibilidades recurrentes:', error);
  }
  
  return { creadas: disponibilidades.length, disponibilidades };
};

export const validarDisponibilidad = async (fecha, horaInicio, horaFin, odontologoId, disponibilidadIdExcluir = null) => {
  // Validar que los parámetros estén presentes
  if (!fecha || !horaInicio || !horaFin || !odontologoId) {
    throw new ApiError('Faltan parámetros requeridos para la validación', 400, null, 'PARAMETROS_FALTANTES');
  }

  // Verificar solapamiento con otras disponibilidades
  const solapamiento = await repo.verificarSolapamiento(
    fecha,
    horaInicio,
    horaFin,
    odontologoId,
    disponibilidadIdExcluir
  );

  // Si hay solapamiento, no es válido
  if (solapamiento) {
    return false;
  }

  // Si no hay solapamiento, es válido (no necesitamos verificar bloques laborales previos para crear disponibilidades)
  return true;
};
