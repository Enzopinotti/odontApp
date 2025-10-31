import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

export const vCrearOdontograma = [
  param('pacienteId').isInt().withMessage('ID de paciente inválido'),
  body('observaciones').optional().isString(),
  validate,
];

export const vActualizarDiente = [
  param('odontogramaId').isInt().withMessage('ID de odontograma inválido'),
  param('numero').notEmpty().withMessage('Número de diente requerido'),
  body('estadoDiente').notEmpty().withMessage('Estado requerido'),
  validate,
];

export const vAgregarCaraTratada = [
  param('dienteId').isInt().withMessage('ID de diente inválido'),
  body('simbolo').notEmpty().withMessage('Símbolo requerido'),
  body('tipoTrazo').notEmpty().withMessage('Tipo de trazo requerido'),
  body('estadoCara').notEmpty().withMessage('Estado de la cara requerido'),
  body('colorEstado').isInt().withMessage('colorEstado debe ser int RGB'),
  validate,
];

/* ✅ NUEVOS: PUT/DELETE para /caras/:caraId */
export const vActualizarCaraTratada = [
  param('caraId').isInt().withMessage('ID de cara inválido'),
  body('simbolo').notEmpty().withMessage('Símbolo requerido'),
  body('tipoTrazo').notEmpty().withMessage('Tipo de trazo requerido'),
  body('estadoCara').notEmpty().withMessage('Estado de la cara requerido'),
  body('colorEstado').isInt().withMessage('colorEstado debe ser int RGB'),
  validate,
];

export const vEliminarCaraTratada = [
  param('caraId').isInt().withMessage('ID de cara inválido'),
  validate,
];

/* --- aplicar tratamiento del catálogo --- */
export const vAplicarTratamiento = [
  param('dienteId').isInt().withMessage('ID de diente inválido'),
  body('tratamientoId').isInt().withMessage('tratamientoId requerido'),
  body('estado').optional().isString(),
  body('color').optional().isString(), // hex
  body('trazo').optional().isIn(['Continuo', 'Punteado']),
  body('caras').optional().isArray(),
  validate,
];
