import { Router } from 'express';
import * as oCtrl from '../controllers/odontogramaController.js'
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import {
  vCrearOdontograma,
  vActualizarDiente,
  vAgregarCaraTratada,
  vAplicarTratamiento,
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

/**
 * @swagger
 * /clinica/odontograma/{pacienteId}:
 *   get:
 *     summary: Obtener odontograma completo del paciente
 *     tags: [Odontograma]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: pacienteId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Odontograma del paciente
 */
router.get(
  '/:pacienteId',
  requirePermiso('odontograma', 'ver'),
  oCtrl.obtenerOdontograma
);

/**
 * @swagger
 * /clinica/odontograma/{pacienteId}:
 *   post:
 *     summary: Crear odontograma para un paciente
 *     tags: [Odontograma]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: pacienteId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Odontograma creado
 */
router.post(
  '/:pacienteId',
  requirePermiso('odontograma', 'editar'),
  vCrearOdontograma,
  oCtrl.crearOdontograma
);

/**
 * @swagger
 * /clinica/odontograma/{odontogramaId}/diente/{numero}:
 *   put:
 *     summary: Actualizar diente dentro del odontograma
 *     tags: [Odontograma]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: odontogramaId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *       - name: numero
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Diente actualizado
 */
router.put(
  '/:odontogramaId/diente/:numero',
  requirePermiso('odontograma', 'editar'),
  vActualizarDiente,
  oCtrl.actualizarDiente
);

/**
 * @swagger
 * /clinica/odontograma/diente/{dienteId}/caras:
 *   post:
 *     summary: Registrar tratamiento en una cara dental
 *     tags: [Odontograma]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: dienteId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Cara tratada registrada
 */
router.post(
  '/diente/:dienteId/caras',
  requirePermiso('odontograma', 'editar'),
  vAgregarCaraTratada,
  oCtrl.agregarCaraTratada
);


router.post(
  '/diente/:dienteId/aplicar-tratamiento',
  requirePermiso('odontograma', 'editar'),
  vAplicarTratamiento,
  oCtrl.aplicarTratamiento
);

export default router;
