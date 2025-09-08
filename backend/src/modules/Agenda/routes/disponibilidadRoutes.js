import express from 'express';
import * as disponibilidadController from '../controllers/disponibilidadController.js';
import { validarJWT } from '../../../middlewares/auth.js';
import { validarPermisos } from '../../../middlewares/permisos.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(validarJWT);

// Rutas para gestión de disponibilidades
router.get('/', 
  validarPermisos(['ver_disponibilidad']),
  disponibilidadController.obtenerDisponibilidades
);

router.post('/', 
  validarPermisos(['gestionar_disponibilidad']),
  disponibilidadController.crearDisponibilidad
);

router.get('/:id', 
  validarPermisos(['ver_disponibilidad']),
  disponibilidadController.obtenerDisponibilidadPorId
);

router.put('/:id', 
  validarPermisos(['gestionar_disponibilidad']),
  disponibilidadController.actualizarDisponibilidad
);

router.delete('/:id', 
  validarPermisos(['gestionar_disponibilidad']),
  disponibilidadController.eliminarDisponibilidad
);

// Rutas para consultas específicas
router.get('/odontologo/:odontologoId', 
  validarPermisos(['ver_disponibilidad']),
  disponibilidadController.obtenerDisponibilidadesPorOdontologo
);

// Rutas para operaciones especiales
router.post('/generar-automaticas', 
  validarPermisos(['gestionar_disponibilidad']),
  disponibilidadController.generarDisponibilidadesAutomaticas
);

router.post('/validar', 
  validarPermisos(['ver_disponibilidad']),
  disponibilidadController.validarDisponibilidad
);

export default router;
