// backend/src/modules/Clinica/controllers/tratamientoController.js

import * as tratamientoSvc from '../services/tratamientoService.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- LISTAR TRATAMIENTOS ---------- */
export const listarTratamientos = async (req, res) => {
  const lista = await tratamientoSvc.obtenerTodos();
  res.ok(lista);
};

/* ---------- CREAR TRATAMIENTO ---------- */
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

/* ---------- ACTUALIZAR TRATAMIENTO ---------- */
export const actualizarTratamiento = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw new ApiError('ID inválido', 400, null, 'TRATAMIENTO_ID_INVALIDO');
  }

  const actualizado = await tratamientoSvc.actualizar(id, req.body);
  if (!actualizado) {
    throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');
  }

  res.ok(actualizado, 'Tratamiento actualizado');
};

/* ---------- ELIMINAR TRATAMIENTO ---------- */
export const eliminarTratamiento = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    throw new ApiError('ID inválido', 400, null, 'TRATAMIENTO_ID_INVALIDO');
  }

  const eliminado = await tratamientoSvc.eliminar(id);
  if (!eliminado) {
    throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');
  }

  res.ok(null, 'Tratamiento eliminado');
};

export const historialTratamientos = async (req, res) => {
  const pacienteId = parseInt(req.params.pacienteId);
  if (isNaN(pacienteId)) {
    throw new ApiError('ID de paciente inválido', 400, null, 'PACIENTE_ID_INVALIDO');
  }

  const historial = await tratamientoSvc.historialPorPaciente(pacienteId);
  res.ok(historial);
};

