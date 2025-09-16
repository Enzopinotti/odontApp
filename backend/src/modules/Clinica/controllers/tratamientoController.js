// Catálogo de tratamientos
import * as tratamientoSvc from '../services/tratamientoService.js';
// Para historial por paciente (timeline desde CaraTratada)
import * as odontogramaSvc from '../services/odontogramaService.js';
import ApiError from '../../../utils/ApiError.js';

export const listarTratamientos = async (req, res) => {
  const lista = await tratamientoSvc.obtenerTodos();
  res.ok(lista);
};

export const crearTratamiento = async (req, res) => {
  const { nombre, precio } = req.body;

  if (!nombre || typeof nombre !== 'string') {
    throw new ApiError('El nombre del tratamiento es obligatorio', 400, [
      { field: 'nombre', message: 'Debe ingresar un nombre válido' },
    ]);
  }
  if (isNaN(precio)) {
    throw new ApiError('El precio debe ser numérico', 400, [
      { field: 'precio', message: 'Debe ingresar un número válido' },
    ]);
  }

  const creado = await tratamientoSvc.crear(req.body);
  res.created(creado, 'Tratamiento creado correctamente');
};

export const actualizarTratamiento = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError('ID inválido', 400, null, 'TRATAMIENTO_ID_INVALIDO');

  const actualizado = await tratamientoSvc.actualizar(id, req.body);
  if (!actualizado) throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');

  res.ok(actualizado, 'Tratamiento actualizado');
};

export const eliminarTratamiento = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) throw new ApiError('ID inválido', 400, null, 'TRATAMIENTO_ID_INVALIDO');

  const eliminado = await tratamientoSvc.eliminar(id);
  if (!eliminado) throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');

  res.ok(null, 'Tratamiento eliminado');
};

/* --- Endpoint existente para historial (lo resolvemos con odontogramaSvc) --- */
export const historialTratamientos = async (req, res) => {
  const pacienteId = parseInt(req.params.pacienteId, 10);
  if (isNaN(pacienteId)) throw new ApiError('ID de paciente inválido', 400, null, 'PACIENTE_ID_INVALIDO');

  const historial = await odontogramaSvc.historialPorPaciente(pacienteId);
  res.ok(historial);
};
