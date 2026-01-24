import * as repo from '../repositories/notaRepository.js';
import * as turnoRepo from '../repositories/turnoRepository.js';
import ApiError from '../../../utils/ApiError.js';

export const buscarConFiltros = async (filtros, page, perPage) => {
  const { rows, count } = await repo.findFiltered(filtros, page, perPage);
  return { data: rows, total: count };
};

export const obtenerNotaPorId = async (id) => {
  const nota = await repo.findById(id);
  if (!nota) {
    throw new ApiError('Nota no encontrada', 404, null, 'NOTA_INEXISTENTE');
  }
  return nota;
};

export const crearNota = async (data, usuarioId) => {
  // Validar que el turno existe
  const turno = await turnoRepo.findById(data.turnoId);
  if (!turno) {
    throw new ApiError('El turno especificado no existe', 404, null, 'TURNO_INEXISTENTE');
  }

  // Validar descripción
  if (!data.descripcion || data.descripcion.trim().length === 0) {
    throw new ApiError('La descripción de la nota es requerida', 400, null, 'DESCRIPCION_REQUERIDA');
  }

  if (data.descripcion.length > 1000) {
    throw new ApiError('La descripción no puede exceder 1000 caracteres', 400, null, 'DESCRIPCION_DEMASIADO_LARGA');
  }

  const notaData = {
    ...data,
    descripcion: data.descripcion.trim(),
    usuarioId
  };

  return await repo.create(notaData);
};

export const actualizarNota = async (id, data, usuarioId) => {
  const nota = await obtenerNotaPorId(id);

  // Verificar que el usuario es el autor de la nota
  if (nota.usuarioId !== usuarioId) {
    throw new ApiError('No tienes permisos para editar esta nota', 403, null, 'SIN_PERMISOS');
  }

  // Validar descripción si se proporciona
  if (data.descripcion !== undefined) {
    if (!data.descripcion || data.descripcion.trim().length === 0) {
      throw new ApiError('La descripción de la nota es requerida', 400, null, 'DESCRIPCION_REQUERIDA');
    }

    if (data.descripcion.length > 1000) {
      throw new ApiError('La descripción no puede exceder 1000 caracteres', 400, null, 'DESCRIPCION_DEMASIADO_LARGA');
    }

    data.descripcion = data.descripcion.trim();
  }

  return await repo.update(nota, data);
};

export const eliminarNota = async (id, usuarioId) => {
  const nota = await obtenerNotaPorId(id);

  // Verificar que el usuario es el autor de la nota
  if (nota.usuarioId !== usuarioId) {
    throw new ApiError('No tienes permisos para eliminar esta nota', 403, null, 'SIN_PERMISOS');
  }

  await repo.remove(nota);
};

export const obtenerNotasPorTurno = async (turnoId) => {
  // Validar que el turno existe
  const turno = await turnoRepo.findById(turnoId);
  if (!turno) {
    throw new ApiError('El turno especificado no existe', 404, null, 'TURNO_INEXISTENTE');
  }

  return await repo.obtenerNotasPorTurno(turnoId);
};

export const obtenerNotasRecientes = async (limite = 10) => {
  if (limite < 1 || limite > 100) {
    throw new ApiError('El límite debe estar entre 1 y 100', 400, null, 'LIMITE_INVALIDO');
  }

  return await repo.obtenerNotasRecientes(limite);
};
