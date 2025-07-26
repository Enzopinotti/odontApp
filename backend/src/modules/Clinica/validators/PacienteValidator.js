// modules/Clinica/validators/pacienteValidator.js
import { body, param, validationResult } from 'express-validator';
import ApiError from '../../../utils/ApiError.js';

// Middleware para manejar errores de validación
let defaultValidateOptions = { abortEarly: false };
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError('Invalid data', 422, errors.array());
  }
  next();
};

// Validador para crear un nuevo paciente
export const vCrearPaciente = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isString().withMessage('El nombre debe ser texto'),
  body('apellido')
    .notEmpty().withMessage('El apellido es obligatorio')
    .isString().withMessage('El apellido debe ser texto'),
  body('dni')
    .notEmpty().withMessage('El DNI es obligatorio')
    .isNumeric().withMessage('El DNI debe ser numérico')
    .isLength({ min: 7, max: 10 }).withMessage('El DNI debe tener entre 7 y 10 dígitos'),
  body('email')
    .optional()
    .isEmail().withMessage('El email debe tener formato válido'),
  validate
];

// Validador para actualizar un paciente existente
export const vActualizarPaciente = [
  param('id')
    .isUUID().withMessage('ID de paciente inválido'),
  body('nombre')
    .optional()
    .isString().withMessage('El nombre debe ser texto'),
  body('apellido')
    .optional()
    .isString().withMessage('El apellido debe ser texto'),
  body('dni')
    .optional()
    .isNumeric().withMessage('El DNI debe ser numérico')
    .isLength({ min: 7, max: 10 }).withMessage('El DNI debe tener entre 7 y 10 dígitos'),
  body('email')
    .optional()
    .isEmail().withMessage('El email debe tener formato válido'),
  validate
];
