import { body, param, query } from 'express-validator';

// Validadores para crear turno
export const validarCrearTurno = [
  body('fechaHora')
    .isISO8601()
    .withMessage('La fecha y hora debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      if (fecha <= new Date()) {
        throw new Error('La fecha del turno debe ser futura');
      }
      return true;
    }),
  
  body('duracion')
    .isIn([30, 60])
    .withMessage('La duración solo puede ser de 30 o 60 minutos'),
  
  body('motivo')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('El motivo debe tener entre 1 y 255 caracteres'),
  
  body('pacienteId')
    .isInt({ min: 1 })
    .withMessage('El ID del paciente debe ser un número entero válido'),
  
  body('odontologoId')
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido')
];

// Validadores para actualizar turno
export const validarActualizarTurno = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero válido'),
  
  body('fechaHora')
    .optional()
    .isISO8601()
    .withMessage('La fecha y hora debe ser válida')
    .custom((value) => {
      if (value) {
        const fecha = new Date(value);
        if (fecha <= new Date()) {
          throw new Error('La fecha del turno debe ser futura');
        }
      }
      return true;
    }),
  
  body('duracion')
    .optional()
    .isIn([30, 60])
    .withMessage('La duración solo puede ser de 30 o 60 minutos'),
  
  body('motivo')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('El motivo debe tener entre 1 y 255 caracteres'),
  
  body('pacienteId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del paciente debe ser un número entero válido'),
  
  body('odontologoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido')
];

// Validadores para cancelar turno
export const validarCancelarTurno = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero válido'),
  
  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('El motivo no puede exceder 255 caracteres')
];

// Validadores para marcar asistencia
export const validarMarcarAsistencia = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero válido'),
  
  body('nota')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('La nota no puede exceder 1000 caracteres')
];

// Validadores para marcar ausencia
export const validarMarcarAusencia = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero válido'),
  
  body('motivo')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('El motivo no puede exceder 255 caracteres')
];

// Validadores para reprogramar turno
export const validarReprogramarTurno = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero válido'),
  
  body('nuevaFechaHora')
    .isISO8601()
    .withMessage('La nueva fecha y hora debe ser válida')
    .custom((value) => {
      const fecha = new Date(value);
      if (fecha <= new Date()) {
        throw new Error('La nueva fecha del turno debe ser futura');
      }
      return true;
    })
];

// Validadores para obtener turnos
export const validarObtenerTurnos = [
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
  
  query('estado')
    .optional()
    .isIn(['PENDIENTE', 'ASISTIO', 'AUSENTE', 'CANCELADO'])
    .withMessage('El estado debe ser uno de: PENDIENTE, ASISTIO, AUSENTE, CANCELADO'),
  
  query('pacienteId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del paciente debe ser un número entero válido')
];

// Validadores para obtener agenda por fecha
export const validarObtenerAgendaPorFecha = [
  param('fecha')
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  
  query('odontologoId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido')
];

// Validadores para obtener slots disponibles
export const validarObtenerSlotsDisponibles = [
  query('fecha')
    .isISO8601()
    .withMessage('La fecha debe ser válida'),
  
  query('odontologoId')
    .isInt({ min: 1 })
    .withMessage('El ID del odontólogo debe ser un número entero válido'),
  
  query('duracion')
    .optional()
    .isIn([30, 60])
    .withMessage('La duración solo puede ser de 30 o 60 minutos')
];

// Validadores para ID de turno
export const validarIdTurno = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('El ID del turno debe ser un número entero válido')
];
