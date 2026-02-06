import express from 'express';
const router = express.Router();
import * as MedicamentoController from '../controllers/medicamentoController.js';
import * as MedicamentoValidator from '../validators/MedicamentoValidator.js';
import handleValidationErrors from '../validators/handleValidationErrors.js';
// ───────────────────────────────
// 🔍 Búsqueda jerárquica
/**
 * @swagger
 * tags:
 *   name: Medicamentos
 *   description: Gestión y búsqueda jerárquica de medicamentos
 */

router.get('/', MedicamentoController.getMedicamentos)


router.get("/jerarquia", MedicamentoController.getJerarquia);
router.post(
  '/crear',
  MedicamentoValidator.validarCreacion,
  handleValidationErrors,
  MedicamentoController.crearMedicamento
);
/**
 * @swagger
 * /api/medicamentos/{id}:
 *   put:
 *     summary: Actualizar un medicamento existente
 *     tags: [Medicamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombreGenerico:
 *                 type: string
 *               formaFarmaceutica:
 *                 type: string
 *               concentracion:
 *                 type: string
 *               presentacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medicamento actualizado
 *       404:
 *         description: Medicamento no encontrado
 */
// ✏️ Actualizar un medicamento por ID
router.put(
  '/:id',
  MedicamentoValidator.validarCreacion,
  handleValidationErrors,
  MedicamentoController.actualizarMedicamento
);
/**
 * @swagger
 * /api/medicamentos/{id}:
 *   delete:
 *     summary: Eliminar un medicamento por ID
 *     tags: [Medicamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento eliminado correctamente
 *       404:
 *         description: Medicamento no encontrado
 */
// 🗑️ Eliminar un medicamento por ID
router.delete('/:id', MedicamentoController.eliminarMedicamento);

export default router;
