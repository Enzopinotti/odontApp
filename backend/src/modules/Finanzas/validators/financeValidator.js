import { body, param } from 'express-validator';
import validate from '../../../utils/validateRequest.js';

/* 📜 Validar creación de Presupuesto */
export const validarPresupuesto = [
  body('patientId').isInt().withMessage('El ID del paciente es obligatorio'),
  body('items').isArray({ min: 1 }).withMessage('Debe incluir al menos un tratamiento'),
  body('items.*.treatmentId').isInt().withMessage('ID de tratamiento inválido'),
  body('items.*.cantidad').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
  body('observaciones').optional({ nullable: true }).isString(),
  validate,
];

/* 🧾 Validar creación de Factura (Orden de Cobro) */
export const validarFactura = [
  // 1. patientId es opcional y puede ser null (si es manual)
  body('patientId')
    .optional({ nullable: true })
    .isInt().withMessage('El ID del paciente debe ser numérico'),

  // 2. patientName es opcional y puede ser null (si es registrado)
  // ⚠️ EL ERROR 422 SE ARREGLA AQUÍ CON { nullable: true }
  body('patientName')
    .optional({ nullable: true }) 
    .isString().withMessage('El nombre del paciente debe ser texto'),

  // 3. Validación lógica: Debe tener ID o Nombre
  body().custom((value) => {
    const hasId = value.patientId && Number(value.patientId) > 0;
    const hasName = value.patientName && typeof value.patientName === 'string' && value.patientName.trim().length > 0;

    if (!hasId && !hasName) {
      throw new Error('Debe indicar un paciente registrado o escribir un nombre manual');
    }
    return true;
  }),

  // Validaciones de items y presupuesto
  body('budgetId').optional({ nullable: true }).isInt().withMessage('ID de presupuesto inválido'),
  body('items').optional().isArray(),
  
  // Validar estado
  body('estado')
    .optional()
    .isIn(['ENVIADO', 'PENDIENTE_PAGO', 'PAGADO', 'ANULADO'])
    .withMessage('Estado inválido'),

  // Observaciones aceptan null
  body('observaciones').optional({ nullable: true }).isString(),
  
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