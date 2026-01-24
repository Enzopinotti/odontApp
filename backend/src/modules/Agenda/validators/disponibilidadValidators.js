import { body, param, query } from 'express-validator';

// Validadores para crear disponibilidad
export const validarCrearDisponibilidad = [
  body('fecha')
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  
  body('horaInicio')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de inicio debe tener formato HH:MM'),
  
  body('horaFin')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de fin debe tener formato HH:MM')
    .custom((value, { req }) => {
      if (value <= req.body.horaInicio) {
        throw new Error('La hora de fin debe ser posterior a la hora de inicio');
      }
      return true;
    }),
  
  body('tipo')
    .isIn(['LABORAL', 'NOLABORAL'])
    .withMessage('El tipo debe ser LABORAL o NOLABORAL'),
  
  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('El motivo no puede exceder 255 caracteres')
    .custom((value, { req }) => {
      if (req.body.tipo === 'NOLABORAL' && (!value || value.trim().length === 0)) {
        throw new Error('Los días no laborables requieren un motivo');
      }
      return true;
    }),
  
  body('odontologoId')
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido')
];

// Validadores para actualizar disponibilidad
export const validarActualizarDisponibilidad = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la disponibilidad debe ser un número entero válido'),
  
  body('fecha')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  
  body('horaInicio')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de inicio debe tener formato HH:MM'),
  
  body('horaFin')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de fin debe tener formato HH:MM'),
  
  body('tipo')
    .optional()
    .isIn(['LABORAL', 'NOLABORAL'])
    .withMessage('El tipo debe ser LABORAL o NOLABORAL'),
  
  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('El motivo no puede exceder 255 caracteres'),
  
  body('odontologoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido')
];

// Validadores para obtener disponibilidades
export const validarObtenerDisponibilidades = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  
  query('perPage')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El número de elementos por página debe estar entre 1 y 100'),
  
  query('fecha')
    .optional()
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  
  query('odontologoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido'),
  
  query('tipo')
    .optional()
    .isIn(['LABORAL', 'NOLABORAL'])
    .withMessage('El tipo debe ser LABORAL o NOLABORAL')
];

// Validadores para generar disponibilidades automáticas
export const validarGenerarDisponibilidadesAutomaticas = [
  body('odontologoId')
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido'),
  
  body('fechaInicio')
    .isISO8601()
    .withMessage('La fecha de inicio debe ser válida'),
  
  body('fechaFin')
    .isISO8601()
    .withMessage('La fecha de fin debe ser válida')
    .custom((value, { req }) => {
      if (value <= req.body.fechaInicio) {
        throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
      }
      return true;
    }),
  
  body('horarioLaboral.horaInicio')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de inicio del horario laboral debe tener formato HH:MM'),
  
  body('horarioLaboral.horaFin')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de fin del horario laboral debe tener formato HH:MM')
    .custom((value, { req }) => {
      if (value <= req.body.horarioLaboral.horaInicio) {
        throw new Error('La hora de fin debe ser posterior a la hora de inicio');
      }
      return true;
    })
];

// Validadores para validar disponibilidad
export const validarValidarDisponibilidad = [
  body('fecha')
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  
  body('horaInicio')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de inicio debe tener formato HH:MM'),
  
  body('horaFin')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora de fin debe tener formato HH:MM')
    .custom((value, { req }) => {
      if (value <= req.body.horaInicio) {
        throw new Error('La hora de fin debe ser posterior a la hora de inicio');
      }
      return true;
    }),
  
  body('odontologoId')
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido'),
  
  body('disponibilidadIdExcluir')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID de la disponibilidad a excluir debe ser un número entero válido')
];

// Validadores para ID de disponibilidad
export const validarIdDisponibilidad = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID de la disponibilidad debe ser un número entero válido')
];

// Validadores para ID de odontólogo
export const validarIdOdontologo = [
  param('odontologoId')
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido')
];
