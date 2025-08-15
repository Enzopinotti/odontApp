// src/modules/Clinica/validators/tratamientoValidator.js
import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

export const vCrearTratamiento = [
  body('nombre').notEmpty().withMessage('Nombre obligatorio'),
  body('precio').isFloat({ min: 0 }).withMessage('Precio inválido'),
  validate,
];

export const vActualizarTratamiento = [
  param('id').isInt().withMessage('ID inválido'),
  validate,
];
