// src/modules/Clinica/validators/odontogramaValidator.js
import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

export const vCrearOdontograma = [
  param('pacienteId').isInt().withMessage('ID de paciente inválido'),
  body('observaciones').optional().isString(),
  validate,
];

export const vActualizarDiente = [
  param('odontogramaId').isInt().withMessage('ID de odontograma inválido'),
  param('numero').notEmpty().withMessage('Número de diente requerido'),
  body('estadoDiente').notEmpty().withMessage('Estado requerido'),
  validate,
];

export const vAgregarCaraTratada = [
  param('dienteId').isInt().withMessage('ID de diente inválido'),
  body('simbolo').notEmpty().withMessage('Símbolo requerido'),
  body('tipoTrazo').notEmpty().withMessage('Tipo de trazo requerido'),
  body('estadoCara').notEmpty().withMessage('Estado de la cara requerido'),
  validate,
];
