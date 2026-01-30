// backend/src/modules/Clinica/controllers/historiaClinicaController.js

import * as hcSvc from '../services/historiaClinicaService.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- OBTENER HISTORIA CLÍNICA POR PACIENTE ---------- */
// Permiso requerido: historia → ver
export const obtenerHistoriaClinica = async (req, res) => {
  const pacienteId = parseInt(req.params.pacienteId);
  if (isNaN(pacienteId)) {
    throw new ApiError('ID de paciente inválido', 400, null, 'PACIENTE_ID_INVALIDO');
  }

  const historia = await hcSvc.obtenerPorPaciente(pacienteId);
  res.ok(historia);
};

/* ---------- REGISTRAR ENTRADA CLÍNICA ---------- */
// Permiso requerido: historia → crear
export const registrarEntradaClinica = async (req, res) => {
  const pacienteId = parseInt(req.params.pacienteId);
  if (isNaN(pacienteId)) {
    throw new ApiError('ID de paciente inválido', 400, null, 'PACIENTE_ID_INVALIDO');
  }

  const entrada = await hcSvc.crear(pacienteId, req.body, req.files || []);
  res.created(entrada, 'Consulta registrada');
};

/* ---------- SUBIR IMAGEN CLÍNICA ---------- */
// Permiso requerido: historia → editar
export const subirImagenClinica = async (req, res) => {
  const historiaClinicaId = parseInt(req.params.historiaClinicaId);
  if (isNaN(historiaClinicaId)) {
    throw new ApiError('ID inválido', 400, null, 'HISTORIA_ID_INVALIDO');
  }

  if (!req.file) {
    throw new ApiError('Debe subir una imagen válida', 400, null, 'IMAGEN_REQUERIDA');
  }

  const { tipoImagen, fechaCarga } = req.body;

  const imagen = await hcSvc.crearImagen(historiaClinicaId, {
    tipo: tipoImagen,
    fechaCarga,
    url: req.file.path,
  });

  res.created(imagen, 'Imagen subida correctamente');
};


/* ---------- LISTAR TODAS LAS IMÁGENES DE UN PACIENTE ---------- */
// Permiso requerido: historia → ver
export const obtenerImagenesPorPaciente = async (req, res) => {
  const pacienteId = parseInt(req.params.pacienteId);
  if (isNaN(pacienteId)) {
    throw new ApiError('ID inválido', 400, null, 'PACIENTE_ID_INVALIDO');
  }

  const imagenes = await hcSvc.obtenerImagenesPorPaciente(pacienteId);
  res.ok(imagenes);
};

/* ---------- ELIMINAR IMAGEN CLÍNICA ---------- */
// Permiso requerido: historia → eliminar
export const eliminarImagenClinica = async (req, res) => {
  const imagenId = parseInt(req.params.imagenId);
  if (isNaN(imagenId)) {
    throw new ApiError('ID inválido', 400, null, 'IMAGEN_ID_INVALIDO');
  }

  await hcSvc.eliminarImagen(imagenId);
  res.ok(null, 'Imagen eliminada');
};
