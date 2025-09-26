import express from 'express';
import * as turnoController from '../controllers/turnoController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(requireAuth);

// Rutas para gestión de turnos
router.get('/', 
  requirePermiso('turnos', 'ver'),
  turnoController.obtenerTurnos
);

router.post('/', 
  requirePermiso('turnos', 'crear'),
  turnoController.crearTurno
);

router.get('/:id', 
  requirePermiso('turnos', 'ver'),
  turnoController.obtenerTurnoPorId
);

router.put('/:id', 
  requirePermiso('turnos', 'editar'),
  turnoController.actualizarTurno
);

router.delete('/:id', 
  requirePermiso('turnos', 'eliminar'),
  turnoController.eliminarTurno
);

// Rutas para acciones específicas de turnos
router.post('/:id/cancelar', 
  requirePermiso('turnos', 'cancelar'),
  turnoController.cancelarTurno
);

router.post('/:id/marcar-asistencia', 
  requirePermiso('turnos', 'marcar_asistencia'),
  turnoController.marcarAsistencia
);

router.post('/:id/marcar-ausencia', 
  requirePermiso('turnos', 'marcar_ausencia'),
  turnoController.marcarAusencia
);

router.put('/:id/reprogramar', 
  requirePermiso('turnos', 'reprogramar'),
  turnoController.reprogramarTurno
);

// Rutas para consultas específicas
router.get('/agenda/:fecha', 
  requirePermiso('agenda', 'ver'),
  turnoController.obtenerAgendaPorFecha
);

router.get('/slots-disponibles', 
  requirePermiso('disponibilidad', 'ver'),
  turnoController.obtenerSlotsDisponibles
);

// CU-AG01.1: Ruta para obtener turnos pendientes concluidos
router.get('/pendientes-concluidos', 
  requirePermiso('turnos', 'ver'),
  turnoController.obtenerTurnosPendientesConcluidos
);

// RN-AG06: Ruta para procesar ausencias automáticas
router.post('/procesar-ausencias-automaticas', 
  requirePermiso('turnos', 'marcar_ausencia'),
  turnoController.procesarAusenciasAutomaticas
);

// CU-AG01.2: Rutas adicionales para crear turnos
router.get('/buscar-pacientes', 
  requirePermiso('turnos', 'crear'),
  turnoController.buscarPacientes
);

router.post('/crear-paciente-rapido', 
  requirePermiso('turnos', 'crear'),
  turnoController.crearPacienteRapido
);

router.get('/odontologos', 
  requirePermiso('turnos', 'crear'),
  turnoController.obtenerOdontologosPorEspecialidad
);

router.get('/tratamientos', 
  requirePermiso('turnos', 'crear'),
  turnoController.obtenerTratamientos
);

export default router;
