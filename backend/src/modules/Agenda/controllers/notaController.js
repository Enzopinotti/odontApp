import * as notaService from '../services/notaService.js';

/* GET /api/agenda/notas */
export const obtenerNotas = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const { turnoId, usuarioId, ...filtros } = req.query;

    const { data, total } = await notaService.buscarConFiltros({
      ...filtros,
      turnoId,
      usuarioId
    }, page, perPage);

    return res.paginated(data, { page, perPage, total }, 'Notas listadas');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/notas */
export const crearNota = async (req, res) => {
  try {
    const nota = await notaService.crearNota(req.body, req.user.id);
    return res.created(nota, 'Nota creada exitosamente');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.error(error.message, 400);
    }
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/notas/:id */
export const obtenerNotaPorId = async (req, res) => {
  try {
    const nota = await notaService.obtenerNotaPorId(req.params.id);
    if (!nota) {
      return res.error('Nota no encontrada', 404);
    }
    return res.ok(nota, 'Nota obtenida');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* PUT /api/agenda/notas/:id */
export const actualizarNota = async (req, res) => {
  try {
    const nota = await notaService.actualizarNota(req.params.id, req.body, req.user.id);
    return res.ok(nota, 'Nota actualizada');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.error(error.message, 400);
    }
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    if (error.name === 'ForbiddenError') {
      return res.error(error.message, 403);
    }
    return res.error(error.message, 500);
  }
};

/* DELETE /api/agenda/notas/:id */
export const eliminarNota = async (req, res) => {
  try {
    await notaService.eliminarNota(req.params.id, req.user.id);
    return res.ok(null, 'Nota eliminada');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    if (error.name === 'ForbiddenError') {
      return res.error(error.message, 403);
    }
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/notas/turno/:turnoId */
export const obtenerNotasPorTurno = async (req, res) => {
  try {
    const { turnoId } = req.params;
    const notas = await notaService.obtenerNotasPorTurno(turnoId);
    return res.ok(notas, 'Notas del turno obtenidas');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/notas/recientes */
export const obtenerNotasRecientes = async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const notas = await notaService.obtenerNotasRecientes(limite);
    return res.ok(notas, 'Notas recientes obtenidas');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

export default {
  obtenerNotas,
  crearNota,
  obtenerNotaPorId,
  actualizarNota,
  eliminarNota,
  obtenerNotasPorTurno,
  obtenerNotasRecientes
};
