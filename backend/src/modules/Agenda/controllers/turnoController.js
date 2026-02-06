import * as turnoService from '../services/turnoService.js';
import { EstadoTurno } from '../models/enums.js';

/* GET /api/agenda/turnos */
export const obtenerTurnos = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const { fecha, odontologoId, estado, pacienteId, ...filtros } = req.query;

    // CU-AG01.5: Si el usuario es odontólogo, solo puede ver su propia agenda
    let odontologoIdFiltrado = odontologoId;
    if (req.user.roleId === 2) { // ID 2 = Odontólogo (verificar según tu seed)
      // Obtener el odontologoId del usuario autenticado
      const { Odontologo } = await import('../../Usuarios/models/index.js');
      const odontologo = await Odontologo.findOne({ where: { userId: req.user.id } });
      if (odontologo) {
        odontologoIdFiltrado = odontologo.userId;
      } else {
        // Si no es odontólogo registrado, no puede ver turnos
        return res.paginated([], { page, perPage, total: 0 }, 'Turnos listados');
      }
    }

    const { data, total } = await turnoService.buscarConFiltros({
      ...filtros,
      fecha,
      odontologoId: odontologoIdFiltrado,
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
    const ip = req.ip || req.connection.remoteAddress;
    const turno = await turnoService.crearTurno(req.body, req.user.id, ip);
    return res.created(turno, 'Turno creado exitosamente');
  } catch (error) {
    if (error.status) {
      return res.error(error.message, error.status, error.details || null);
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
    if (error.status) {
      return res.error(error.message, error.status, error.details || null);
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
    const ip = req.ip || req.connection.remoteAddress;
    const turno = await turnoService.cancelarTurno(req.params.id, motivo, req.user.id, ip);
    return res.ok(turno, 'Turno cancelado exitosamente');
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

/* POST /api/agenda/turnos/cancelar-multiple - CU-AG01.4 Flujo Alternativo 4a */
export const cancelarTurnosMultiple = async (req, res) => {
  try {
    const { turnoIds, motivo } = req.body;

    if (!Array.isArray(turnoIds) || turnoIds.length === 0) {
      return res.error('Debe proporcionar al menos un ID de turno', 400);
    }

    if (!motivo || !motivo.trim()) {
      return res.error('El motivo es requerido para cancelación múltiple', 400);
    }

    const ip = req.ip || req.connection.remoteAddress;
    const resultado = await turnoService.cancelarTurnosMultiple(turnoIds, motivo, req.user.id, ip);

    return res.ok(resultado, `Se cancelaron ${resultado.cancelados} turno(s) exitosamente`);
  } catch (error) {
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
    const ip = req.ip || req.connection.remoteAddress;
    const turno = await turnoService.marcarAsistencia(req.params.id, nota, req.user.id, ip);
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
    const ip = req.ip || req.connection.remoteAddress;
    const resultado = await turnoService.marcarAusencia(req.params.id, motivo, req.user.id, ip);

    // CU-AG01.1 Flujo Alternativo 5b: Incluir sugerencia de reprogramar en la respuesta
    if (resultado.sugerirReprogramar) {
      return res.ok({
        turno: resultado.turno,
        sugerirReprogramar: true,
        mensaje: resultado.mensaje
      }, resultado.mensaje);
    }

    return res.ok(resultado.turno, resultado.mensaje);
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
    const { nuevaFechaHora, odontologoId } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const turno = await turnoService.reprogramarTurno(req.params.id, nuevaFechaHora, req.user.id, ip, odontologoId);
    return res.ok(turno, 'Turno reprogramado exitosamente');
  } catch (error) {
    if (error.status) {
      return res.error(error.message, error.status, error.details || null);
    }
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/turnos/agenda/:fecha */
export const obtenerAgendaPorFecha = async (req, res) => {
  try {
    const { fecha } = req.params;
    let { odontologoId } = req.query;

    // CU-AG01.5: Si el usuario es odontólogo, solo puede ver su propia agenda
    if (req.user.roleId === 2) { // ID 2 = Odontólogo
      const { Odontologo } = await import('../../Usuarios/models/index.js');
      const odontologo = await Odontologo.findOne({ where: { userId: req.user.id } });
      if (odontologo) {
        odontologoId = odontologo.userId;
      } else {
        return res.ok([], 'Agenda obtenida');
      }
    }

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

/* GET /api/agenda/turnos/pendientes-concluidos */
export const obtenerTurnosPendientesConcluidos = async (req, res) => {
  try {
    const { fecha } = req.query;
    console.log('📅 Obteniendo turnos para fecha:', fecha);
    const turnos = await turnoService.obtenerTurnosPendientesConcluidos(fecha);
    console.log('✅ Turnos encontrados:', turnos.length);
    if (turnos.length > 0) {
      console.log('📋 Primer turno:', JSON.stringify({
        id: turnos[0].id,
        fechaHora: turnos[0].fechaHora,
        motivo: turnos[0].motivo,
        tienePaciente: !!turnos[0].Paciente,
        tieneOdontologo: !!turnos[0].Odontologo
      }));
    }
    return res.ok(turnos, 'Turnos pendientes concluidos obtenidos');
  } catch (error) {
    console.error('❌ Error obteniendo turnos:', error);
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/turnos/procesar-ausencias-automaticas */
export const procesarAusenciasAutomaticas = async (req, res) => {
  try {
    const turnosProcesados = await turnoService.procesarAusenciasAutomaticas();
    return res.ok({
      procesados: turnosProcesados.length,
      turnos: turnosProcesados
    }, 'Ausencias automáticas procesadas');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/turnos/buscar-pacientes */
export const buscarPacientes = async (req, res) => {
  try {
    const { termino } = req.query;
    if (!termino || termino.length < 2) {
      return res.error('El término de búsqueda debe tener al menos 2 caracteres', 400);
    }

    const pacientes = await turnoService.buscarPacientes(termino);
    return res.ok(pacientes, 'Pacientes encontrados');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/turnos/crear-paciente-rapido */
export const crearPacienteRapido = async (req, res) => {
  try {
    const paciente = await turnoService.crearPacienteRapido(req.body);
    return res.ok(paciente, 'Paciente creado exitosamente');
  } catch (error) {
    if (error.status) {
      return res.error(error.message, error.status, error.details || null);
    }
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/turnos/odontologos */
export const obtenerOdontologosPorEspecialidad = async (req, res) => {
  try {
    const { especialidad } = req.query;
    const odontologos = await turnoService.obtenerOdontologosPorEspecialidad(especialidad);
    return res.ok(odontologos, 'Odontólogos obtenidos');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/turnos/tratamientos */
export const obtenerTratamientos = async (req, res) => {
  try {
    const tratamientos = await turnoService.obtenerTratamientos();
    return res.ok(tratamientos, 'Tratamientos obtenidos');
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
