// backend/src/modules/Clinica/controllers/pacienteController.js

import * as pacienteSvc from '../services/pacienteService.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- LISTAR PACIENTES ---------- */
export const listarPacientes = async (req, res) => {
  const { page = 1, perPage = 20, ...filtros } = req.query;

  const resultado = await pacienteSvc.buscarConFiltros(
    filtros,
    parseInt(page),
    parseInt(perPage)
  );

  res.ok(resultado);
};

/* ---------- OBTENER PACIENTE POR ID ---------- */
export const obtenerPacientePorId = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ApiError('ID inválido', 400);

  const paciente = await pacienteSvc.obtenerPorId(id);
  if (!paciente) throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');

  res.ok(paciente);
};

/* ---------- CREAR PACIENTE ---------- */
export const crearPaciente = async (req, res) => {
  const nuevoPaciente = await pacienteSvc.crear(req.body);
  res.created(nuevoPaciente, 'Paciente creado correctamente');
};

/* ---------- ACTUALIZAR PACIENTE ---------- */
export const actualizarPaciente = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ApiError('ID inválido', 400);

  const actualizado = await pacienteSvc.actualizar(id, req.body);
  if (!actualizado) throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');

  res.ok(actualizado, 'Paciente actualizado');
};

/* ---------- ELIMINAR PACIENTE (BAJA LÓGICA) ---------- */
export const eliminarPaciente = async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) throw new ApiError('ID inválido', 400);

  const eliminado = await pacienteSvc.eliminar(id);
  if (!eliminado) throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');

  res.ok(null, 'Paciente eliminado');
};
