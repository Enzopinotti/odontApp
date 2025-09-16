import { Router } from 'express';
import * as tCtrl from '../controllers/tratamientoController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';
import {
  vCrearTratamiento,
  vActualizarTratamiento,
} from '../validators/tratamientoValidator.js';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   - name: Tratamientos
 *     description: Gestión de tratamientos comunes y personalizados
 */

/**
 * @swagger
 * /clinica/tratamientos:
 *   get:
 *     summary: Listar tratamientos disponibles
 *     tags: [Tratamientos]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de tratamientos
 */
router.get(
  '/',
  requirePermiso('tratamientos', 'listar'),
  tCtrl.listarTratamientos
);

/**
 * @swagger
 * /clinica/tratamientos:
 *   post:
 *     summary: Crear tratamiento personalizado
 *     tags: [Tratamientos]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, precio]
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precio:
 *                 type: number
 *               duracionMin:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Tratamiento creado
 */
router.post(
  '/',
  requirePermiso('tratamientos', 'crearPersonalizado'),
  vCrearTratamiento,
  tCtrl.crearTratamiento
);

/**
 * @swagger
 * /clinica/tratamientos/{id}:
 *   put:
 *     summary: Editar tratamiento existente
 *     tags: [Tratamientos]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
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
 *       200:
 *         description: Tratamiento actualizado
 */
router.put(
  '/:id',
  requirePermiso('tratamientos', 'crearPersonalizado'),
  vActualizarTratamiento,
  tCtrl.actualizarTratamiento
);

/**
 * @swagger
 * /clinica/tratamientos/{id}:
 *   delete:
 *     summary: Eliminar tratamiento
 *     tags: [Tratamientos]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tratamiento eliminado
 */
router.delete(
  '/:id',
  requirePermiso('tratamientos', 'crearPersonalizado'),
  tCtrl.eliminarTratamiento
);

/**
 * @swagger
 * /clinica/tratamientos/paciente/{pacienteId}/historial:
 *   get:
 *     summary: Ver historial de tratamientos de un paciente
 *     tags: [Tratamientos]
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
 *         description: Lista de tratamientos históricos
 */
router.get(
  '/paciente/:pacienteId/historial',
  requirePermiso('tratamientos', 'listar'),
  tCtrl.historialTratamientos
);

export default router;
