import { Router } from 'express';

// ✅ IMPORTANTE: Usamos '../' para salir a buscar controllers
import * as ctrl from '../controllers/financeController.js';

// ✅ IMPORTANTE: Subimos 3 niveles para llegar a middlewares
import { requireAuth } from '../../../middlewares/authMiddleware.js'; 
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js'; 

const router = Router();

router.use(requireAuth); 

// --- RUTAS ---

// Crear (POST)
router.post('/facturas', 
  requirePermiso('facturas', 'crear'), 
  ctrl.crearOrdenCobro
);

// Listar (GET)
router.get('/facturas', 
  requirePermiso('facturas', 'listar'), 
  ctrl.listarFacturas
);

// Cobrar (PUT)
router.put('/facturas/:id/pagar', 
  requirePermiso('facturas', 'editar'), 
  ctrl.gestionarPago
);

// Presupuestos (POST)
router.post('/presupuestos', 
  requirePermiso('presupuestos', 'crear'), 
  ctrl.crearPresupuesto
);

export default router;