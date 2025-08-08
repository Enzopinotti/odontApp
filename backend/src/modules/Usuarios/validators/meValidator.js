// src/modules/Usuarios/validators/meValidator.js
import { body } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

export const vUpdateMe = [
  body('nombre').optional().notEmpty().withMessage('Nombre requerido'),
  body('apellido').optional().notEmpty().withMessage('Apellido requerido'),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  validate,
];

export const vChangePassword = [
  body('actual').notEmpty().withMessage('Contraseña actual requerida'),
  body('nueva').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate,
];
