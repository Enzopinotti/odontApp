// backend/src/modules/Finanzas/validators/financeValidator.js
import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

/* 📜 Validar creación de Presupuesto */
export const validarPresupuesto = [
  body('patientId').isInt().withMessage('El ID del paciente es obligatorio'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un tratamiento'),
  body('items.*.treatmentId').isInt().withMessage('ID de tratamiento inválido'),
  body('items.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
  body('observaciones').optional().isString(),
  validate,
];

/* 🧾 Validar creación de Factura (Orden de Cobro) */
export const validarFactura = [
  body('patientId').isInt().withMessage('El ID del paciente es obligatorio'),
  // Puede venir items directos O un budgetId
  body('budgetId').optional().isInt().withMessage('ID de presupuesto inválido'),
  body('items').optional().isArray(),
  body('observaciones').optional().isString(),
  validate,
];

/* 💰 Validar el Pago (Recepción) */
export const validarPago = [
  param('id').isInt().withMessage('ID de factura inválido'),
  body('metodoPago')
    .notEmpty()
    .isIn(['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'OBRA_SOCIAL'])
    .withMessage('Método de pago inválido'),
  validate,
];