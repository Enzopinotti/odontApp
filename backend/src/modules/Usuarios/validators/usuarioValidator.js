import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';


/* 🆕 Crear usuario */
export const validarCrearUsuario = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  validate,
];

/* ✏️  Editar usuario */
export const validarEditarUsuario = [
  param('id').isInt().withMessage('ID inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('password').optional().isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  validate,
];

