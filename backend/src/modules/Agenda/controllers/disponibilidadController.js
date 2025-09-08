import * as disponibilidadService from '../services/disponibilidadService.js';

/* GET /api/agenda/disponibilidades */
export const obtenerDisponibilidades = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const { fecha, odontologoId, tipo, ...filtros } = req.query;

    const { data, total } = await disponibilidadService.buscarConFiltros({
      ...filtros,
      fecha,
      odontologoId,
      tipo
    }, page, perPage);

    return res.paginated(data, { page, perPage, total }, 'Disponibilidades listadas');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/disponibilidades */
export const crearDisponibilidad = async (req, res) => {
  try {
    const disponibilidad = await disponibilidadService.crearDisponibilidad(req.body, req.user.id);
    return res.created(disponibilidad, 'Disponibilidad creada exitosamente');
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

/* GET /api/agenda/disponibilidades/:id */
export const obtenerDisponibilidadPorId = async (req, res) => {
  try {
    const disponibilidad = await disponibilidadService.obtenerDisponibilidadPorId(req.params.id);
    if (!disponibilidad) {
      return res.error('Disponibilidad no encontrada', 404);
    }
    return res.ok(disponibilidad, 'Disponibilidad obtenida');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* PUT /api/agenda/disponibilidades/:id */
export const actualizarDisponibilidad = async (req, res) => {
  try {
    const disponibilidad = await disponibilidadService.actualizarDisponibilidad(req.params.id, req.body, req.user.id);
    return res.ok(disponibilidad, 'Disponibilidad actualizada');
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

/* DELETE /api/agenda/disponibilidades/:id */
export const eliminarDisponibilidad = async (req, res) => {
  try {
    await disponibilidadService.eliminarDisponibilidad(req.params.id, req.user.id);
    return res.ok(null, 'Disponibilidad eliminada');
  } catch (error) {
    if (error.name === 'NotFoundError') {
      return res.error(error.message, 404);
    }
    if (error.name === 'ConflictError') {
      return res.error(error.message, 409);
    }
    return res.error(error.message, 500);
  }
};

/* GET /api/agenda/disponibilidades/odontologo/:odontologoId */
export const obtenerDisponibilidadesPorOdontologo = async (req, res) => {
  try {
    const { odontologoId } = req.params;
    const { fecha, fechaInicio, fechaFin } = req.query;
    
    let disponibilidades;
    
    if (fecha) {
      disponibilidades = await disponibilidadService.obtenerDisponibilidadPorFecha(fecha, odontologoId);
    } else if (fechaInicio && fechaFin) {
      disponibilidades = await disponibilidadService.obtenerDisponibilidadPorRango(fechaInicio, fechaFin, odontologoId);
    } else {
      disponibilidades = await disponibilidadService.obtenerDisponibilidadesPorOdontologo(odontologoId);
    }
    
    return res.ok(disponibilidades, 'Disponibilidades obtenidas');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/disponibilidades/generar-automaticas */
export const generarDisponibilidadesAutomaticas = async (req, res) => {
  try {
    const { odontologoId, fechaInicio, fechaFin, horarioLaboral } = req.body;
    
    const disponibilidades = await disponibilidadService.generarDisponibilidadesAutomaticas(
      odontologoId, 
      fechaInicio, 
      fechaFin, 
      horarioLaboral,
      req.user.id
    );
    
    return res.created(disponibilidades, 'Disponibilidades generadas automáticamente');
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.error(error.message, 400);
    }
    return res.error(error.message, 500);
  }
};

/* POST /api/agenda/disponibilidades/validar */
export const validarDisponibilidad = async (req, res) => {
  try {
    const { fecha, horaInicio, horaFin, odontologoId, disponibilidadIdExcluir } = req.body;
    
    const esValida = await disponibilidadService.validarDisponibilidad(
      fecha, 
      horaInicio, 
      horaFin, 
      odontologoId, 
      disponibilidadIdExcluir
    );
    
    return res.ok({ esValida }, 'Validación completada');
  } catch (error) {
    return res.error(error.message, 500);
  }
};

export default {
  obtenerDisponibilidades,
  crearDisponibilidad,
  obtenerDisponibilidadPorId,
  actualizarDisponibilidad,
  eliminarDisponibilidad,
  obtenerDisponibilidadesPorOdontologo,
  generarDisponibilidadesAutomaticas,
  validarDisponibilidad
};
