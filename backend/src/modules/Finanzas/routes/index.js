import { Router } from 'express';
import * as ctrl from '../controllers/financeController.js';
import * as valid from '../validators/financeValidator.js';

// 👇 1. IMPORTA EL AUTH MIDDLEWARE
import { requireAuth } from '../../../middlewares/authMiddleware.js'; 
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';

const router = Router();

// 👇 2. ACTIVA LA PROTECCIÓN PARA TODAS LAS RUTAS DE ESTE ARCHIVO
// Esto asegura que req.user exista antes de preguntar por permisos
router.use(requireAuth); 

/* --- Facturación --- */
router.post('/facturas', 
  requirePermiso('facturacion', 'crear'), 
  valid.validarFactura, 
  ctrl.crearOrdenCobro // Asegurate que el nombre del controlador coincida
);

router.get('/facturas', 
  requirePermiso('facturacion', 'listar'), 
  ctrl.listarFacturas
);

router.put('/facturas/:id/pagar', 
  requirePermiso('facturacion', 'cobrar'), 
  // valid.validarPago, 
  ctrl.gestionarPago
);

/* --- Presupuestos --- */
router.post('/presupuestos', 
  requirePermiso('presupuestos', 'crear'), 
  // valid.validarPresupuesto, 
  ctrl.crearPresupuesto
);

export default router;