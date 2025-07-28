// src/modules/Clinica/validators/pacienteValidator.js
import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

export const vCrearPaciente = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
  body('dni').notEmpty().withMessage('El DNI es obligatorio'),
  body('contacto').isObject().withMessage('El contacto es obligatorio'),
  body('direccion').isObject().withMessage('La dirección es obligatoria'),
  validate,
];

export const vActualizarPaciente = [
  param('id').isInt().withMessage('ID inválido'),
  body().custom(body => Object.keys(body).length > 0).withMessage('Debe enviar al menos un campo'),
  validate,
];
