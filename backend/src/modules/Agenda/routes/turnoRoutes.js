import express from 'express';
import * as turnoController from '../controllers/turnoController.js';
import { validarJWT } from '../../../middlewares/auth.js';
import { validarPermisos } from '../../../middlewares/permisos.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(validarJWT);

// Rutas para gestión de turnos
router.get('/', 
  validarPermisos(['ver_turnos']),
  turnoController.obtenerTurnos
);

router.post('/', 
  validarPermisos(['crear_turno']),
  turnoController.crearTurno
);

router.get('/:id', 
  validarPermisos(['ver_turnos']),
  turnoController.obtenerTurnoPorId
);

router.put('/:id', 
  validarPermisos(['editar_turno']),
  turnoController.actualizarTurno
);

router.delete('/:id', 
  validarPermisos(['eliminar_turno']),
  turnoController.eliminarTurno
);

// Rutas para acciones específicas de turnos
router.post('/:id/cancelar', 
  validarPermisos(['cancelar_turno']),
  turnoController.cancelarTurno
);

router.post('/:id/marcar-asistencia', 
  validarPermisos(['marcar_asistencia']),
  turnoController.marcarAsistencia
);

router.post('/:id/marcar-ausencia', 
  validarPermisos(['marcar_ausencia']),
  turnoController.marcarAusencia
);

router.put('/:id/reprogramar', 
  validarPermisos(['reprogramar_turno']),
  turnoController.reprogramarTurno
);

// Rutas para consultas específicas
router.get('/agenda/:fecha', 
  validarPermisos(['ver_agenda']),
  turnoController.obtenerAgendaPorFecha
);

router.get('/slots-disponibles', 
  validarPermisos(['ver_disponibilidad']),
  turnoController.obtenerSlotsDisponibles
);

export default router;
