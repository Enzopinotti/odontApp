import { body, param, validationResult } from 'express-validator';
import ApiError from '../../../utils/ApiError.js';

/**
 * Middleware genérico que revisa el resultado de express-validator
 * y lanza ApiError con detalles si hay errores.
 */
const validar = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // details = array con { field, message }
    const details = errors.array().map(err => ({
      field: err.param,
      message: err.msg,
    }));
    return next(new ApiError('Datos inválidos', 422, details));
  }
  next();
};

/* 🆕 Crear usuario */
export const validarCrearUsuario = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').trim().notEmpty().withMessage('El apellido es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  validar,
];

/* ✏️  Editar usuario */
export const validarEditarUsuario = [
  param('id').isInt().withMessage('ID inválido'),
  body('email').optional().isEmail().withMessage('Email inválido'),
  body('password').optional().isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
  body('telefono').optional().isMobilePhone().withMessage('Teléfono inválido'),
  validar,
];

