// src/modules/Usuarios/validators/authValidator.js
import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

export const vLogin = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
  validate,
];

export const vRegister = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate,
];

export const vForgot = [
  body('email').isEmail().withMessage('Email inválido'),
  validate,
];

export const vReset = [
  param('token').notEmpty().withMessage('Token requerido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  validate,
];
