import express from 'express';
import * as turnoController from '../controllers/turnoController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(requireAuth);

// ==========================================
// RUTAS ESPECÍFICAS (deben ir ANTES de /:id)
// ==========================================

// Rutas para consultas específicas
router.get('/agenda/:fecha', 
  requirePermiso('turnos', 'ver'),
  turnoController.obtenerAgendaPorFecha
);

router.get('/slots-disponibles', 
  requirePermiso('turnos', 'ver'),
  turnoController.obtenerSlotsDisponibles
);

// CU-AG01.1: Ruta para obtener turnos pendientes concluidos
router.get('/pendientes-concluidos', 
  requirePermiso('turnos', 'ver'),
  turnoController.obtenerTurnosPendientesConcluidos
);

// CU-AG01.2: Rutas adicionales para crear turnos
router.get('/buscar-pacientes', 
  requirePermiso('turnos', 'crear'),
  turnoController.buscarPacientes
);

router.get('/odontologos', 
  requirePermiso('turnos', 'crear'),
  turnoController.obtenerOdontologosPorEspecialidad
);

router.get('/tratamientos', 
  requirePermiso('turnos', 'crear'),
  turnoController.obtenerTratamientos
);

// RN-AG06: Ruta para procesar ausencias automáticas
router.post('/procesar-ausencias-automaticas', 
  requirePermiso('turnos', 'marcar_ausencia'),
  turnoController.procesarAusenciasAutomaticas
);

router.post('/crear-paciente-rapido', 
  requirePermiso('turnos', 'crear'),
  turnoController.crearPacienteRapido
);

// ==========================================
// RUTAS GENERALES (deben ir antes que /:id)
// ==========================================

router.get('/', 
  requirePermiso('turnos', 'ver'),
  turnoController.obtenerTurnos
);

router.post('/', 
  requirePermiso('turnos', 'crear'),
  turnoController.crearTurno
);

// ==========================================
// RUTAS CON PARÁMETROS DINÁMICOS (al final)
// ==========================================

// CU-AG01.4 Flujo Alternativo 4a: Cancelación múltiple (debe ir antes de /:id)
router.post('/cancelar-multiple', 
  requirePermiso('turnos', 'cancelar'),
  turnoController.cancelarTurnosMultiple
);

// Rutas para acciones específicas de turnos con :id
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

// Rutas CRUD con :id (DEBEN IR AL FINAL)
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

export default router;
