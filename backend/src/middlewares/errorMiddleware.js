// src/middlewares/errorMiddleware.js
import ApiError from '../utils/ApiError.js';
import { ValidationError, UniqueConstraintError } from 'sequelize';

const errorMiddleware = (err, req, res, _next) => {
  const status = err.status || 500;
  const response = {
    success: false,
    message: err.message || 'Error interno del servidor',
  };

  // 🟡 Error personalizado (ApiError)
  if (err instanceof ApiError) {
    if (err.details) response.details = err.details;
    if (err.code) response.code = err.code;
    return res.status(status).json(response);
  }

  // 🔴 Error de Sequelize
  if (err instanceof ValidationError || err instanceof UniqueConstraintError) {
    response.message = 'Datos inválidos o duplicados';
    response.details = err.errors?.map(e => e.message);
    return res.status(400).json(response);
  }

  // 🔻 Otro error inesperado
  console.error('🛑 Error no controlado:', err.message, err.stack);
  return res.status(status).json(response);
};

export default errorMiddleware;
