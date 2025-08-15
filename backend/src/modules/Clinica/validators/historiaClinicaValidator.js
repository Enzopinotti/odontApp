// src/modules/Clinica/validators/historiaClinicaValidator.js
import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

export const vRegistrarEntrada = [
  param('pacienteId').isInt().withMessage('ID inválido'),
  body('motivoConsulta').notEmpty().withMessage('Motivo de consulta obligatorio'),
  validate,
];

export const vSubirImagen = [
  param('historiaClinicaId').isInt().withMessage('ID inválido'),
  body('tipoImagen').notEmpty().withMessage('Tipo de imagen obligatorio'),
  validate,
];
