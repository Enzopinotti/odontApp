import { Router } from 'express';
import * as oCtrl from '../controllers/odontogramaController.js'
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import {
  vCrearOdontograma,
  vActualizarDiente,
  vAgregarCaraTratada,
  vAplicarTratamiento,
  vActualizarCaraTratada,
  vEliminarCaraTratada,
} from '../validators/odontogramaValidator.js';
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   - name: Odontograma
 *     description: Odontograma digital e interacciones dentales
 */

/* ---------- OBTENER / CREAR ODONTOGRAMA ---------- */
router.get(
  '/:pacienteId',
  requirePermiso('odontograma', 'ver'),
  oCtrl.obtenerOdontograma
);

router.post(
  '/:pacienteId',
  requirePermiso('odontograma', 'editar'),
  vCrearOdontograma,
  oCtrl.crearOdontograma
);

/* ---------- DIENTE ---------- */
router.put(
  '/:odontogramaId/diente/:numero',
  requirePermiso('odontograma', 'editar'),
  vActualizarDiente,
  oCtrl.actualizarDiente
);

/* ---------- CARAS ---------- */
router.post(
  '/diente/:dienteId/caras',
  requirePermiso('odontograma', 'editar'),
  vAgregarCaraTratada,
  oCtrl.agregarCaraTratada
);

/* ✅ NUEVAS: actualizar y eliminar cara (las que te faltaban) */
router.put(
  '/caras/:caraId',
  requirePermiso('odontograma', 'editar'),
  vActualizarCaraTratada,
  oCtrl.actualizarCaraTratada
);

router.delete(
  '/caras/:caraId',
  requirePermiso('odontograma', 'editar'),
  vEliminarCaraTratada,
  oCtrl.eliminarCaraTratada
);

/* ---------- TRATAMIENTO (catálogo → diente) ---------- */
router.post(
  '/diente/:dienteId/aplicar-tratamiento',
  requirePermiso('odontograma', 'editar'),
  vAplicarTratamiento,
  oCtrl.aplicarTratamiento
);

export default router;
