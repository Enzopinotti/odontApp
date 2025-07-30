// src/utils/validateRequest.js
import { validationResult } from 'express-validator';
import ApiError from './ApiError.js';

const validateRequest = (req, _res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map(err => ({
    field: err.param,
    message: err.msg,
  }));

  return next(new ApiError('Datos inválidos', 422, details));
};

export default validateRequest;
