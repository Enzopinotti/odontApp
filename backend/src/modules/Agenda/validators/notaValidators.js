import { body, param, query } from 'express-validator';

// Validadores para crear nota
export const validarCrearNota = [
  body('descripcion')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('La descripción debe tener entre 1 y 1000 caracteres'),
  
  body('turnoId')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero válido')
];

// Validadores para actualizar nota
export const validarActualizarNota = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la nota debe ser un número entero válido'),
  
  body('descripcion')
    .optional()
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('La descripción debe tener entre 1 y 1000 caracteres')
];

// Validadores para obtener notas
export const validarObtenerNotas = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('perPage')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El número de elementos por página debe estar entre 1 y 100'),
  
  query('turnoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero válido'),
  
  query('usuarioId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del usuario debe ser un número entero válido'),
  
  query('descripcion')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La descripción no puede exceder 1000 caracteres')
];

// Validadores para obtener notas recientes
export const validarObtenerNotasRecientes = [
  query('limite')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100')
];

// Validadores para ID de nota
export const validarIdNota = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la nota debe ser un número entero válido')
];

// Validadores para ID de turno en notas
export const validarIdTurnoEnNotas = [
  param('turnoId')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero válido')
];
