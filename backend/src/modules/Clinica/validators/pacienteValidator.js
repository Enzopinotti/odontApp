import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

/* eslint-disable security/detect-object-injection */

export const vCrearPaciente = [
  // ───────────────────────────────────────── Paciente
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
  body('dni').notEmpty().withMessage('El DNI es obligatorio'),

  // ───────────────────────────────────────── Contacto
  body('contacto')
    .custom((v) => typeof v === 'object' && v !== null)
    .withMessage('El contacto es obligatorio'),

  body('contacto.email')
    .optional({ nullable: true })
    .isEmail()
    .withMessage('Correo de contacto inválido'),

  // ───────────────────────────────────────── Dirección
  body('contacto.direccion')
    .custom((v) => typeof v === 'object' && v !== null)
    .withMessage('La dirección es obligatoria'),

  body('contacto.direccion.calle')
    .notEmpty().withMessage('La calle es obligatoria'),

  body('contacto.direccion.ciudad')
    .notEmpty().withMessage('La ciudad es obligatoria'),

  validate,
];

export const vActualizarPaciente = [
  param('id').isInt().withMessage('ID inválido'),
  body().custom((b) => Object.keys(b).length > 0).withMessage('Debe enviar al menos un campo'),
  validate,
];
