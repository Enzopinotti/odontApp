import { body, validationResult } from 'express-validator';
import ApiError from '../../../utils/ApiError.js';

const finish = (req, _res, next) => {
  const e = validationResult(req);
  if (!e.isEmpty()) return next(new ApiError('Datos inválidos', 422, e.array()));
  next();
};

export const vUpdateMe = [
  body('nombre').optional().notEmpty(),
  body('apellido').optional().notEmpty(),
  body('telefono').optional().isMobilePhone(),
  finish,
];

export const vChangePassword = [
  body('actual').notEmpty(),
  body('nueva').isLength({ min: 6 }),
  finish,
];
