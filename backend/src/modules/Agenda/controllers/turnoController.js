import * as turnoService from '../services/turnoService.js';
import { EstadoTurno } from '../models/enums.js';

/* GET /api/agenda/turnos */
export const obtenerTurnos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const { fecha, odontologoId, estado, pacienteId, ...filtros } = req.query;

    const { data, total } = await turnoService.buscarConFiltros({
      ...filtros,
      fecha,
      odontologoId,
      estado,
      pacienteId
    }, page, perPage);

    return res.paginated(data, { page, perPage, total }, 'Turnos listados');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/turnos */
export const crearTurno = async (req, res) => {
  try {
    const turno = await turnoService.crearTurno(req.body, req.user.id);
    return res.created(turno, 'Turno creado exitosamente');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.error(error.message, 400);
    }
    if (error.name === 'ConflictError') {
      return res.error(error.message, 409);
    }
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/turnos/:id */
export const obtenerTurnoPorId = async (req, res) => {
  try {
    const turno = await turnoService.obtenerTurnoPorId(req.params.id);
    if (!turno) {
      return res.error('Turno no encontrado', 404);
    }
    return res.ok(turno, 'Turno obtenido');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* PUT /api/agenda/turnos/:id */
export const actualizarTurno = async (req, res) => {
  try {
    const turno = await turnoService.actualizarTurno(req.params.id, req.body, req.user.id);
    return res.ok(turno, 'Turno actualizado');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.error(error.message, 400);
    }
    if (error.name === 'ConflictError') {
      return res.error(error.message, 409);
    }
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    return res.error(error.message, 500);
  }
};

/* DELETE /api/agenda/turnos/:id */
export const eliminarTurno = async (req, res) => {
  try {
    await turnoService.eliminarTurno(req.params.id, req.user.id);
    return res.ok(null, 'Turno eliminado');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/turnos/:id/cancelar */
export const cancelarTurno = async (req, res) => {
  try {
    const { motivo } = req.body;
    const turno = await turnoService.cancelarTurno(req.params.id, motivo, req.user.id);
    return res.ok(turno, 'Turno cancelado');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    if (error.name === 'ValidationError') {
      return res.error(error.message, 400);
    }
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/turnos/:id/marcar-asistencia */
export const marcarAsistencia = async (req, res) => {
  try {
    const { nota } = req.body;
    const turno = await turnoService.marcarAsistencia(req.params.id, nota, req.user.id);
    return res.ok(turno, 'Asistencia registrada');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    if (error.name === 'ValidationError') {
      return res.error(error.message, 400);
    }
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/turnos/:id/marcar-ausencia */
export const marcarAusencia = async (req, res) => {
  try {
    const { motivo } = req.body;
    const turno = await turnoService.marcarAusencia(req.params.id, motivo, req.user.id);
    return res.ok(turno, 'Ausencia registrada');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    if (error.name === 'ValidationError') {
      return res.error(error.message, 400);
    }
    return res.error(error.message, 500);
  }
};

/* PUT /api/agenda/turnos/:id/reprogramar */
export const reprogramarTurno = async (req, res) => {
  try {
    const { nuevaFechaHora } = req.body;
    const turno = await turnoService.reprogramarTurno(req.params.id, nuevaFechaHora, req.user.id);
    return res.ok(turno, 'Turno reprogramado');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    if (error.name === 'ValidationError') {
      return res.error(error.message, 400);
    }
    if (error.name === 'ConflictError') {
      return res.error(error.message, 409);
    }
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/turnos/agenda/:fecha */
export const obtenerAgendaPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    const { odontologoId } = req.query;
    
    const agenda = await turnoService.obtenerAgendaPorFecha(fecha, odontologoId);
    return res.ok(agenda, 'Agenda obtenida');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/turnos/slots-disponibles */
export const obtenerSlotsDisponibles = async (req, res) => {
  try {
    const { fecha, odontologoId, duracion = 30 } = req.query;
    
    if (!fecha || !odontologoId) {
      return res.error('Fecha y odontologoId son requeridos', 400);
    }
    
    const slots = await turnoService.obtenerSlotsDisponibles(fecha, odontologoId, parseInt(duracion));
    return res.ok(slots, 'Slots disponibles obtenidos');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

export default {
  obtenerTurnos,
  crearTurno,
  obtenerTurnoPorId,
  actualizarTurno,
  eliminarTurno,
  cancelarTurno,
  marcarAsistencia,
  marcarAusencia,
  reprogramarTurno,
  obtenerAgendaPorFecha,
  obtenerSlotsDisponibles
};
