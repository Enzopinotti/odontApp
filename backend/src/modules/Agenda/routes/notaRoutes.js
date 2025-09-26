import express from 'express';
import * as notaController from '../controllers/notaController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(requireAuth);

// Rutas para gestión de notas
router.get('/', 
  requirePermiso('notas', 'ver'),
  notaController.obtenerNotas
);

router.post('/', 
  requirePermiso('notas', 'crear'),
  notaController.crearNota
);

router.get('/:id', 
  requirePermiso('notas', 'ver'),
  notaController.obtenerNotaPorId
);

router.put('/:id', 
  requirePermiso('notas', 'editar'),
  notaController.actualizarNota
);

router.delete('/:id', 
  requirePermiso('notas', 'eliminar'),
  notaController.eliminarNota
);

// Rutas para consultas específicas
router.get('/turno/:turnoId', 
  requirePermiso('notas', 'ver'),
  notaController.obtenerNotasPorTurno
);

router.get('/recientes', 
  requirePermiso('notas', 'ver'),
  notaController.obtenerNotasRecientes
);

export default router;
