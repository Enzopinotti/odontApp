import express from 'express';
import * as notaController from '../controllers/notaController.js';
import { validarJWT } from '../../../middlewares/auth.js';
import { validarPermisos } from '../../../middlewares/permisos.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(validarJWT);

// Rutas para gestión de notas
router.get('/', 
  validarPermisos(['ver_notas']),
  notaController.obtenerNotas
);

router.post('/', 
  validarPermisos(['crear_nota']),
  notaController.crearNota
);

router.get('/:id', 
  validarPermisos(['ver_notas']),
  notaController.obtenerNotaPorId
);

router.put('/:id', 
  validarPermisos(['editar_nota']),
  notaController.actualizarNota
);

router.delete('/:id', 
  validarPermisos(['eliminar_nota']),
  notaController.eliminarNota
);

// Rutas para consultas específicas
router.get('/turno/:turnoId', 
  validarPermisos(['ver_notas']),
  notaController.obtenerNotasPorTurno
);

router.get('/recientes', 
  validarPermisos(['ver_notas']),
  notaController.obtenerNotasRecientes
);

export default router;
