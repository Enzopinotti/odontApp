import * as repo from '../repositories/turnoRepository.js';
import * as disponibilidadRepo from '../repositories/disponibilidadRepository.js';
import * as notaRepo from '../repositories/notaRepository.js';
import * as pacienteRepo from '../../Clinica/repositories/pacienteRepository.js';
import * as pacienteService from '../../Clinica/services/pacienteService.js';
import { Odontologo, Usuario, Especialidad, OdontologoEspecialidad } from '../../Usuarios/models/index.js';
import { Tratamiento } from '../../Clinica/models/index.js';
import { Op } from 'sequelize';
import ApiError from '../../../utils/ApiError.js';
import { EstadoTurno } from '../models/enums.js';
import { registrarLog } from '../../Usuarios/services/auditService.js';

// turnoService.js - notificadores desde módulo Notificador
import TurnoSujeto from "../../Notificador/subject/turnoSujeto.js";
import PacienteObserver from "../../Notificador/observers/pacienteObservador.js";
import OdontologoObserver from "../../Notificador/observers/odontologoObserver.js";


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

export const crearTurno = async (data, recepcionistaId, ip = null) => {
  // Parsear fechaHora considerando zona horaria de Argentina
  // El frontend envía la fecha como string en formato: YYYY-MM-DDTHH:MM:SS (sin Z)
  // Esto debe interpretarse como hora local de Argentina
  let fechaHora;
  if (typeof data.fechaHora === 'string') {
    // Si viene como string sin Z, parsearlo como hora local
    // Formato esperado: "2025-01-15T17:00:00" (sin Z)
    if (data.fechaHora.includes('T') && !data.fechaHora.endsWith('Z')) {
      // Parsear manualmente para evitar conversiones de zona horaria
      const [fechaPart, horaPart] = data.fechaHora.split('T');
      const [año, mes, dia] = fechaPart.split('-').map(Number);
      const [hora, minutos, segundos = 0] = horaPart.split(':').map(Number);
      // Crear Date en zona horaria local (Argentina)
      fechaHora = new Date(año, mes - 1, dia, hora, minutos, segundos || 0, 0);
    } else {
      // Si viene con Z o como ISO completo, parsear y convertir a local
      const fechaISO = new Date(data.fechaHora);
      const año = fechaISO.getFullYear();
      const mes = fechaISO.getMonth();
      const dia = fechaISO.getDate();
      const hora = fechaISO.getHours();
      const minutos = fechaISO.getMinutes();
      const segundos = fechaISO.getSeconds();
      fechaHora = new Date(año, mes, dia, hora, minutos, segundos, 0);
    }
  } else {
    fechaHora = new Date(data.fechaHora);
  }

  console.log('[turnoService.crear] FechaHora parseada:', {
    fechaHoraRecibida: data.fechaHora,
    fechaHoraParseada: fechaHora,
    fechaHoraISO: fechaHora.toISOString(),
    fechaHoraLocal: fechaHora.toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
    componentes: {
      año: fechaHora.getFullYear(),
      mes: fechaHora.getMonth() + 1,
      dia: fechaHora.getDate(),
      hora: fechaHora.getHours(),
      minutos: fechaHora.getMinutes()
    }
  });

  // Validar que la fecha sea futura
  if (fechaHora <= new Date()) {
    throw new ApiError('La fecha del turno debe ser futura', 400, null, 'FECHA_INVALIDA');
  }

  // RN-AG03: Validar duración solo 30 o 60 minutos
  if (data.duracion !== 30 && data.duracion !== 60) {
    throw new ApiError('La duración solo puede ser de 30 o 60 minutos', 400, null, 'DURACION_INVALIDA');
  }

  // RN-AG01: Verificar solapamiento con otros turnos del mismo odontólogo
  const solapamiento = await repo.verificarSolapamiento(
    fechaHora,
    data.duracion,
    data.odontologoId
  );

  if (solapamiento) {
    // CU-AG01.2 Flujo Alternativo 6a: Mensaje más descriptivo con información del conflicto
    const turnoConflicto = await repo.findById(solapamiento.id);
    const odontologoNombre = turnoConflicto?.Odontologo?.Usuario
      ? `${turnoConflicto.Odontologo.Usuario.nombre} ${turnoConflicto.Odontologo.Usuario.apellido}`
      : 'el odontólogo';

    // CU-AG01.2: Buscar odontólogos alternativos disponibles para la misma fecha/hora
    const fechaStr = fechaHora.toISOString().split('T')[0];
    const odontologosAlternativos = await obtenerOdontologosAlternativos(
      fechaStr,
      fechaHora.toTimeString().slice(0, 5),
      new Date(fechaHora.getTime() + data.duracion * 60000).toTimeString().slice(0, 5),
      data.duracion,
      data.odontologoId
    );

    // CU-AG01.2: Buscar slots disponibles para el mismo odontólogo en el mismo día
    const slotsAlternativos = await disponibilidadRepo.generarSlotsDisponibles(
      fechaStr,
      data.odontologoId,
      data.duracion
    );

    throw new ApiError(
      `Conflicto con la agenda del Dr. ${odontologoNombre}. El horario seleccionado se solapa con otro turno existente.`,
      409,
      {
        conflicto: true,
        turnoId: solapamiento.id,
        odontologoId: data.odontologoId,
        odontologoNombre,
        // Opciones sugeridas para resolver el conflicto
        opciones: {
          cambiarOdontologo: odontologosAlternativos.length > 0,
          odontologosAlternativos: odontologosAlternativos.slice(0, 5), // Máximo 5 sugerencias
          reprogramarFecha: slotsAlternativos.length > 0,
          slotsAlternativos: slotsAlternativos.slice(0, 10) // Máximo 10 slots sugeridos
        }
      },
      'SOLAPAMIENTO_TURNO'
    );
  }
  
  // RN-AG02: Verificar que el turno esté dentro de un bloque laboral
  const fechaStr = fechaHora.toISOString().split('T')[0];

  // IMPORTANTE: Usar métodos UTC para evitar problemas de zona horaria
  // O mejor aún, usar los componentes locales directamente
  const horaInicio = fechaHora.getHours();
  const minutosInicio = fechaHora.getMinutes();
  let horaInicioStr = `${String(horaInicio).padStart(2, '0')}:${String(minutosInicio).padStart(2, '0')}`;

  // Calcular hora de fin usando los mismos componentes
  const fechaFin = new Date(fechaHora.getTime() + data.duracion * 60000);
  const horaFin = fechaFin.getHours();
  const minutosFin = fechaFin.getMinutes();
  let horaFinStr = `${String(horaFin).padStart(2, '0')}:${String(minutosFin).padStart(2, '0')}`;

  // Calcular en minutos para validación
  const horaInicioMinutos = horaInicio * 60 + minutosInicio;
  const horaFinMinutos = horaFin * 60 + minutosFin;

  console.log('[turnoService.crear] Validando disponibilidad:', {
    fechaHoraRecibida: data.fechaHora,
    fechaHoraObj: fechaHora,
    fechaStr,
    horaInicioStr,
    horaFinStr,
    duracion: data.duracion,
    odontologoId: data.odontologoId,
    componentes: {
      horaInicio,
      minutosInicio,
      horaFin,
      minutosFin
    },
    // Debug: mostrar en minutos para comparación
    horaInicioMinutos,
    horaFinMinutos,
    // Mostrar también usando toTimeString para comparar
    horaInicioTimeString: fechaHora.toTimeString().slice(0, 5),
    horaFinTimeString: fechaFin.toTimeString().slice(0, 5)
  });

  const esDisponible = await disponibilidadRepo.validarDisponibilidad(
    fechaStr,
    horaInicioStr,
    horaFinStr,
    data.odontologoId
  );

  if (!esDisponible) {
    console.error('[turnoService.crear] Horario no disponible:', {
      fechaStr,
      horaInicioStr,
      horaFinStr,
      odontologoId: data.odontologoId
    });
    throw new ApiError('El horario no está dentro de los bloques laborales del odontólogo', 409, null, 'HORARIO_NO_DISPONIBLE');
  }

  console.log('[turnoService.crear] Validación exitosa');

  // Crear el turno
  const turnoData = {
    ...data,
    fechaHora,
    recepcionistaId,
    estado: EstadoTurno.PENDIENTE
  };

  const turno = await repo.create(turnoData);

  // CU-AG01.2: Registrar auditoría
  try {
    await registrarLog(recepcionistaId, 'turnos', 'crear', ip);
  } catch (error) {
    console.error('Error al registrar auditoría de creación de turno:', error);
    // No fallar si la auditoría falla, solo loguear
  }

  const turnoCreado = await repo.findById(turno.id); // Retornar con relaciones

  // CU-AG01.2: Agregar código de turno personalizado
  if (turnoCreado) {
    turnoCreado.dataValues.codigoTurno = turnoCreado.getCodigoTurno();
  }

  return turnoCreado;
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

export const cancelarTurno = async (id, motivo, usuarioId, ip = null) => {
  const turno = await obtenerTurnoPorId(id);

  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se pueden cancelar turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  // Cancelar el turno (libera el slot automáticamente)
  await turno.cancelar(motivo);

  // CU-AG01.4: Registrar auditoría
  try {
    await registrarLog(usuarioId, 'turnos', 'cancelar', ip);
  } catch (error) {
    console.error('Error al registrar auditoría de cancelación:', error);
    // No fallar si la auditoría falla, solo loguear
  }

  // Agregar nota si se proporciona motivo
  if (motivo) {
    await notaRepo.create({
      descripcion: `Turno cancelado: ${motivo}`,
      turnoId: id,
      usuarioId
    });
  }

  const turnoCancelado = await repo.findById(id);

  // CU-AG01.2: Agregar código de turno personalizado
  if (turnoCancelado) {
    turnoCancelado.dataValues.codigoTurno = turnoCancelado.getCodigoTurno();
  }

  return turnoCancelado;
};

// CU-AG01.4 Flujo Alternativo 4a: Cancelación múltiple
export const cancelarTurnosMultiple = async (turnoIds, motivo, usuarioId, ip = null) => {
  if (!Array.isArray(turnoIds) || turnoIds.length === 0) {
    throw new ApiError('Debe proporcionar al menos un ID de turno', 400, null, 'TURNOS_INVALIDOS');
  }

  if (!motivo || !motivo.trim()) {
    throw new ApiError('El motivo es requerido para cancelación múltiple', 400, null, 'MOTIVO_REQUERIDO');
  }

  const resultados = {
    cancelados: 0,
    fallidos: 0,
    errores: [],
    turnos: []
  };

  // CU-AG01.4: Registrar auditoría de cancelación múltiple
  try {
    await registrarLog(usuarioId, 'turnos', 'cancelar_multiple', ip);
  } catch (error) {
    console.error('Error al registrar auditoría de cancelación múltiple:', error);
  }

  // Procesar cada turno
  for (const turnoId of turnoIds) {
    try {
      const turno = await cancelarTurno(turnoId, motivo, usuarioId, null); // IP ya registrada arriba
      resultados.cancelados++;
      resultados.turnos.push(turno);
    } catch (error) {
      resultados.fallidos++;
      resultados.errores.push({
        turnoId,
        error: error.message
      });
    }
  }

  return resultados;
};

export const marcarAsistencia = async (id, nota, usuarioId, ip = null) => {
  const turno = await obtenerTurnoPorId(id);

  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se puede marcar asistencia en turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  // CU-AG01.1: Verificar que la hora de fin del turno ya haya transcurrido
  const horaFinTurno = new Date(new Date(turno.fechaHora).getTime() + (turno.duracion * 60000));
  const ahora = new Date();

  if (horaFinTurno > ahora) {
    throw new ApiError('No se puede marcar asistencia antes de que concluya el turno', 400, null, 'TURNO_NO_CONCLUIDO');
  }

  // Marcar asistencia
  await turno.marcarAsistencia();

  // CU-AG01.1: Registrar auditoría
  try {
    await registrarLog(usuarioId, 'turnos', 'marcar_asistencia', ip);
  } catch (error) {
    console.error('Error al registrar auditoría de asistencia:', error);
    // No fallar si la auditoría falla, solo loguear
  }

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

export const marcarAusencia = async (id, motivo, usuarioId, ip = null) => {
  const turno = await obtenerTurnoPorId(id);

  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se puede marcar ausencia en turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  // Marcar ausencia
  await turno.marcarAusencia();

  // CU-AG01.1: Registrar auditoría
  try {
    await registrarLog(usuarioId, 'turnos', 'marcar_ausencia', ip);
  } catch (error) {
    console.error('Error al registrar auditoría de ausencia:', error);
    // No fallar si la auditoría falla, solo loguear
  }

  // Agregar nota con el motivo
  const descripcion = motivo ? `Ausente: ${motivo}` : 'Ausente';
  await notaRepo.create({
    descripcion,
    turnoId: id,
    usuarioId
  });

  // CU-AG01.1 Flujo Alternativo 5b: Sugerir reprogramar si el turno era futuro
  const ahora = new Date();
  const fechaHoraTurno = new Date(turno.fechaHora);
  const sugerirReprogramar = fechaHoraTurno >= ahora; // Si el turno aún no había comenzado

  return {
    turno: await repo.findById(id),
    sugerirReprogramar,
    mensaje: sugerirReprogramar
      ? 'Turno marcado como ausente. ¿Desea reprogramarlo?'
      : 'Ausencia registrada'
  };
};

export const reprogramarTurno = async (id, nuevaFechaHora, usuarioId, ip = null, nuevoOdontologoId = null) => {
  const turno = await obtenerTurnoPorId(id);

  if (turno.estado !== EstadoTurno.PENDIENTE) {
    throw new ApiError('Solo se pueden reprogramar turnos pendientes', 400, null, 'ESTADO_INVALIDO');
  }

  const fechaHora = new Date(nuevaFechaHora);
  const fechaHoraAnterior = new Date(turno.fechaHora);

  // CU-AG01.3: Permitir cambiar odontólogo al reprogramar
  const odontologoIdFinal = nuevoOdontologoId || turno.odontologoId;

  // Validar que la nueva fecha sea futura
  if (fechaHora <= new Date()) {
    throw new ApiError('La nueva fecha del turno debe ser futura', 400, null, 'FECHA_INVALIDA');
  }

  // Verificar solapamiento con el nuevo horario (usando el odontólogo final)
  const solapamiento = await repo.verificarSolapamiento(
    fechaHora,
    turno.duracion,
    odontologoIdFinal,
    id
  );

  if (solapamiento) {
    // CU-AG01.3 Flujo Alternativo 4a: Sin disponibilidad - sugerir alternativas
    const fechaStr = fechaHora.toISOString().split('T')[0];

    // Buscar odontólogos alternativos
    const odontologosAlternativos = await obtenerOdontologosAlternativos(
      fechaStr,
      fechaHora.toTimeString().slice(0, 5),
      new Date(fechaHora.getTime() + turno.duracion * 60000).toTimeString().slice(0, 5),
      turno.duracion,
      turno.odontologoId
    );

    // Buscar slots alternativos para el mismo odontólogo
    const slotsAlternativos = await disponibilidadRepo.generarSlotsDisponibles(
      fechaStr,
      turno.odontologoId,
      turno.duracion
    );

    throw new ApiError(
      'El nuevo horario se solapa con otro turno existente',
      409,
      {
        conflicto: true,
        turnoId: solapamiento.id,
        odontologoId: turno.odontologoId,
        opciones: {
          cambiarOdontologo: odontologosAlternativos.length > 0,
          odontologosAlternativos: odontologosAlternativos.slice(0, 5),
          reprogramarFecha: slotsAlternativos.length > 0,
          slotsAlternativos: slotsAlternativos.slice(0, 10)
        }
      },
      'SOLAPAMIENTO_TURNO'
    );
  }

  // Verificar disponibilidad (usando el odontólogo final)
  const esDisponible = await disponibilidadRepo.validarDisponibilidad(
    fechaHora.toISOString().split('T')[0],
    fechaHora.toTimeString().slice(0, 5),
    new Date(fechaHora.getTime() + turno.duracion * 60000).toTimeString().slice(0, 5),
    odontologoIdFinal
  );

  if (!esDisponible) {
    // CU-AG01.3 Flujo Alternativo 4a: Sin disponibilidad - sugerir alternativas
    const fechaStr = fechaHora.toISOString().split('T')[0];

    // Buscar slots alternativos para el mismo odontólogo
    const slotsAlternativos = await disponibilidadRepo.generarSlotsDisponibles(
      fechaStr,
      turno.odontologoId,
      turno.duracion
    );

    // Buscar odontólogos alternativos
    const odontologosAlternativos = await obtenerOdontologosAlternativos(
      fechaStr,
      fechaHora.toTimeString().slice(0, 5),
      new Date(fechaHora.getTime() + turno.duracion * 60000).toTimeString().slice(0, 5),
      turno.duracion,
      turno.odontologoId
    );

    throw new ApiError(
      'El nuevo horario no está disponible',
      409,
      {
        conflicto: true,
        odontologoId: turno.odontologoId,
        opciones: {
          cambiarOdontologo: odontologosAlternativos.length > 0,
          odontologosAlternativos: odontologosAlternativos.slice(0, 5),
          reprogramarFecha: slotsAlternativos.length > 0,
          slotsAlternativos: slotsAlternativos.slice(0, 10)
        }
      },
      'HORARIO_NO_DISPONIBLE'
    );
  }

  // CU-AG01.3: Si se cambió el odontólogo, actualizarlo antes de reprogramar
  if (nuevoOdontologoId && nuevoOdontologoId !== turno.odontologoId) {
    await repo.update(turno, { odontologoId: nuevoOdontologoId });
  }

  // Reprogramar el turno (libera el slot anterior automáticamente)
  await turno.reprogramar(fechaHora);

  // CU-AG01.3: Registrar auditoría
  try {
    await registrarLog(usuarioId, 'turnos', 'reprogramar', ip);
  } catch (error) {
    console.error('Error al registrar auditoría de reprogramación:', error);
    // No fallar si la auditoría falla, solo loguear
  }

  // Agregar nota de reprogramación
  await notaRepo.create({
    descripcion: `Turno reprogramado de ${fechaHoraAnterior.toLocaleString('es-AR')} a ${fechaHora.toLocaleString('es-AR')}`,
    turnoId: id,
    usuarioId
  });

  const turnoReprogramado = await repo.findById(id);

  // CU-AG01.2: Agregar código de turno personalizado
  if (turnoReprogramado) {
    turnoReprogramado.dataValues.codigoTurno = turnoReprogramado.getCodigoTurno();
  }

  return turnoReprogramado;
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

  // Obtener todos los turnos pendientes del día (sin filtrar por hora)
  const { data: turnos } = await buscarConFiltros({
    fechaInicio: fechaBusqueda.toISOString(),
    fechaFin: fechaFin.toISOString(),
    estado: EstadoTurno.PENDIENTE
  }, 1, 1000);

  // Devolver todos los turnos pendientes, no solo los concluidos
  return turnos;
};

// CU-AG01.2: Buscar pacientes para autocompletado
export const buscarPacientes = async (termino) => {
  try {
    // Usar el repositorio real de pacientes
    const { rows, count } = await pacienteRepo.search(termino, 1, 10);
    return rows.map(p => ({
      id: p.id,
      nombre: p.nombre,
      apellido: p.apellido,
      dni: p.dni,
      Contacto: p.Contacto ? {
        email: p.Contacto.email,
        telefonoMovil: p.Contacto.telefonoMovil,
        telefonoFijo: p.Contacto.telefonoFijo,
        Direccion: p.Contacto.Direccion
      } : null,
      obraSocial: p.obraSocial,
      ultimaVisita: p.ultimaVisita
    }));
  } catch (error) {
    console.error('Error al buscar pacientes:', error);
    throw new ApiError('Error al buscar pacientes', 500);
  }
};

// CU-AG01.2: Crear paciente rápido (flujo alternativo 3a)
export const crearPacienteRapido = async (datosMinimos) => {
  const { dni, nombre, apellido, Contacto } = datosMinimos;

  // Validar datos mínimos requeridos
  if (!dni || !nombre || !apellido) {
    throw new ApiError('DNI, nombre y apellido son requeridos para crear un paciente', 400, null, 'DATOS_INCOMPLETOS');
  }

  try {
    // Verificar si ya existe un paciente con ese DNI
    const pacienteExistente = await pacienteRepo.findByDNI(dni);
    if (pacienteExistente) {
      throw new ApiError('Ya existe un paciente con ese DNI', 409, null, 'DNI_DUPLICADO');
    }

    // Preparar datos para crear paciente
    const datosPaciente = {
      nombre,
      apellido,
      dni,
      obraSocial: datosMinimos.obraSocial || null,
      Contacto: Contacto ? {
        email: Contacto.email || null,
        telefonoMovil: Contacto.telefonoMovil || null,
        telefonoFijo: Contacto.telefonoFijo || null,
        Direccion: Contacto.Direccion || null
      } : null
    };

    // Crear paciente usando el servicio de pacientes
    const pacienteNuevo = await pacienteService.crearPaciente(datosPaciente);
    return pacienteNuevo;
  } catch (error) {
    if (error.name === 'ApiError') {
      throw error;
    }
    if (error.message.includes('dni') || error.message.includes('DNI')) {
      throw new ApiError('Ya existe un paciente con ese DNI', 409, null, 'DNI_DUPLICADO');
    }
    throw new ApiError('Error al crear paciente: ' + error.message, 500);
  }
};

// CU-AG01.2: Obtener odontólogos alternativos disponibles para un horario específico
const obtenerOdontologosAlternativos = async (fecha, horaInicio, horaFin, duracion, odontologoIdExcluir) => {
  try {
    // Obtener todos los odontólogos activos
    const odontologos = await Odontologo.findAll({
      include: [
        {
          model: Usuario,
          as: 'Usuario',
          where: { activo: true },
          required: true
        }
      ],
      order: [[{ model: Usuario, as: 'Usuario' }, 'apellido', 'ASC']]
    });

    const alternativos = [];

    // Verificar disponibilidad para cada odontólogo
    for (const odonto of odontologos) {
      if (odonto.userId === odontologoIdExcluir) continue;

      // Verificar disponibilidad
      const esDisponible = await disponibilidadRepo.validarDisponibilidad(
        fecha,
        horaInicio,
        horaFin,
        odonto.userId
      );

      if (esDisponible) {
        // Verificar que no haya solapamiento con otros turnos
        const solapamiento = await repo.verificarSolapamiento(
          new Date(`${fecha}T${horaInicio}`),
          duracion,
          odonto.userId
        );

        if (!solapamiento) {
          alternativos.push({
            userId: odonto.userId,
            matricula: odonto.matricula,
            Usuario: odonto.Usuario ? {
              id: odonto.Usuario.id,
              nombre: odonto.Usuario.nombre,
              apellido: odonto.Usuario.apellido,
              email: odonto.Usuario.email
            } : null
          });
        }
      }
    }

    return alternativos;
  } catch (error) {
    console.error('Error al obtener odontólogos alternativos:', error);
    return [];
  }
};

// CU-AG01.2: Obtener odontólogos disponibles por especialidad
export const obtenerOdontologosPorEspecialidad = async (especialidad = null) => {
  try {
    const where = {};
    const include = [
      {
        model: Usuario,
        as: 'Usuario',
        where: { activo: true },
        required: true
      }
    ];

    // Nota: Las especialidades se pueden obtener desde la relación many-to-many
    // pero por ahora no filtramos por especialidad si no se especifica
    // Esto se puede mejorar más adelante

    const odontologos = await Odontologo.findAll({
      where,
      include,
      order: [[{ model: Usuario, as: 'Usuario' }, 'apellido', 'ASC']]
    });

    return odontologos.map(odonto => ({
      userId: odonto.userId,
      matricula: odonto.matricula,
      Usuario: odonto.Usuario ? {
        id: odonto.Usuario.id,
        nombre: odonto.Usuario.nombre,
        apellido: odonto.Usuario.apellido,
        email: odonto.Usuario.email,
        telefono: odonto.Usuario.telefono
      } : null
    }));
  } catch (error) {
    console.error('Error al obtener odontólogos:', error);
    throw new ApiError('Error al obtener odontólogos', 500);
  }
};

// CU-AG01.2: Obtener tratamientos disponibles del catálogo real
export const obtenerTratamientos = async () => {
  try {
    const tratamientos = await Tratamiento.findAll({
      order: [['nombre', 'ASC']]
    });

    return tratamientos.map(t => ({
      id: t.id,
      nombre: t.nombre,
      duracion: t.duracionMin || 30, // Usar duración real o fallback de 30 min
      duracionDefault: t.duracionMin || 30,
      precio: t.precio
    }));
  } catch (error) {
    console.error('Error al obtener tratamientos:', error);
    throw new ApiError('Error al obtener tratamientos del catálogo', 500);
  }
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
      const resultado = await marcarAusencia(turno.id, 'Ausencia automática - sin registro de asistencia', 1, null); // Sistema (IP null)
      procesados.push(resultado.turno.id);
    } catch (error) {
      console.error(`Error al procesar ausencia automática para turno ${turno.id}:`, error);
    }
  }

  return procesados;
};