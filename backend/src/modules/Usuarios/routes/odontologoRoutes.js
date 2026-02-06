// backend/src/modules/Clinica/routes/odontologoRoutes.js
import { Router } from 'express';
import * as odontologoController from '../controllers/odontologoController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';
import odontologo from '../models/odontologo.js';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /clinica/odontologos:
 *   get:
 *     summary: Buscar odontólogos por filtros
 *     tags: [Odontólogos]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Nombre, apellido o email
 *       - in: query
 *         name: matricula
 *         schema: { type: string }
 *       - in: query
 *         name: especialidad
 *         schema: { type: string }
 *       - in: query
 *         name: activo
 *         schema: { type: boolean }
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: perPage
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lista de odontólogos
 */
router.get(
  '/',
  requirePermiso('odontologos', 'listar'),
  odontologoController.listarOdontologos
);

router.get(
  '/:id',
  requirePermiso('odontologos', 'listar'),
  odontologoController.obtenerOdontologoPorId
);
export default router;
