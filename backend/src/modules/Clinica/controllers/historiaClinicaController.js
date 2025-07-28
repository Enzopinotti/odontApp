// backend/src/modules/Clinica/controllers/historiaClinicaController.js

import * as hcSvc from '../services/historiaClinicaService.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- OBTENER HISTORIA CLÍNICA POR PACIENTE ---------- */
export const obtenerHistoriaClinica = async (req, res) => {
  const pacienteId = parseInt(req.params.pacienteId);
  if (isNaN(pacienteId)) {
    throw new ApiError('ID de paciente inválido', 400, null, 'PACIENTE_ID_INVALIDO');
  }

  const historia = await hcSvc.obtenerPorPaciente(pacienteId);
  res.ok(historia);
};

/* ---------- REGISTRAR ENTRADA CLÍNICA ---------- */
export const registrarEntradaClinica = async (req, res) => {
  const pacienteId = parseInt(req.params.pacienteId);
  if (isNaN(pacienteId)) {
    throw new ApiError('ID de paciente inválido', 400, null, 'PACIENTE_ID_INVALIDO');
  }

  const entrada = await hcSvc.registrarEntrada(pacienteId, req.body);
  res.created(entrada, 'Consulta registrada');
};

/* ---------- SUBIR IMAGEN CLÍNICA ---------- */
export const subirImagenClinica = async (req, res) => {
  const historiaClinicaId = parseInt(req.params.historiaClinicaId);
  if (isNaN(historiaClinicaId)) {
    throw new ApiError('ID inválido', 400, null, 'HISTORIA_ID_INVALIDO');
  }

  if (!req.file) {
    throw new ApiError('Debe subir una imagen válida', 400, null, 'IMAGEN_REQUERIDA');
  }

  const { tipoImagen, fechaCarga } = req.body;

  const imagen = await hcSvc.subirImagen({
    historiaClinicaId,
    tipoImagen,
    fechaCarga,
    url: req.file.path,
  });

  res.created(imagen, 'Imagen subida correctamente');
};
