import express from 'express';
import * as disponibilidadController from '../controllers/disponibilidadController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(requireAuth);

// ==========================================
// RUTAS ESPECÍFICAS (deben ir ANTES de /:id)
// ==========================================

// Rutas para operaciones especiales
router.post('/generar-automaticas', 
  requirePermiso('disponibilidad', 'gestionar'),
  disponibilidadController.generarDisponibilidadesAutomaticas
);

router.post('/validar', 
  requirePermiso('disponibilidad', 'ver'),
  disponibilidadController.validarDisponibilidad
);

// Rutas para consultas específicas
router.get('/odontologo/:odontologoId', 
  requirePermiso('disponibilidad', 'ver'),
  disponibilidadController.obtenerDisponibilidadesPorOdontologo
);

// ==========================================
// RUTAS GENERALES
// ==========================================

router.get('/', 
  requirePermiso('disponibilidad', 'ver'),
  disponibilidadController.obtenerDisponibilidades
);

router.post('/', 
  requirePermiso('disponibilidad', 'gestionar'),
  disponibilidadController.crearDisponibilidad
);

// ==========================================
// RUTAS CON PARÁMETROS DINÁMICOS (al final)
// ==========================================

router.get('/:id', 
  requirePermiso('disponibilidad', 'ver'),
  disponibilidadController.obtenerDisponibilidadPorId
);

router.put('/:id', 
  requirePermiso('disponibilidad', 'gestionar'),
  disponibilidadController.actualizarDisponibilidad
);

router.delete('/:id', 
  requirePermiso('disponibilidad', 'gestionar'),
  disponibilidadController.eliminarDisponibilidad
);

export default router;
