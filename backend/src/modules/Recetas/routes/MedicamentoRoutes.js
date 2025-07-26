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
/**
 * @swagger
 * /api/medicamentos/nombres-genericos:
 *   get:
 *     summary: Obtener todos los nombres genéricos únicos
 *     tags: [Medicamentos]
 *     responses:
 *       200:
 *         description: Lista de nombres genéricos
 */

router.get('/nombres-genericos', MedicamentoController.getNombresGenericos);
/**
 * @swagger
 * /api/medicamentos/{nombreGenerico}/formas-farmaceuticas:
 *   get:
 *     summary: Obtener formas farmacéuticas para un nombre genérico
 *     tags: [Medicamentos]
 *     parameters:
 *       - in: path
 *         name: nombreGenerico
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre genérico del medicamento
 *     responses:
 *       200:
 *         description: Lista de formas farmacéuticas
 */

router.get('/:nombreGenerico/formas-farmaceuticas', MedicamentoController.getFormasFarmaceuticas);
/**
 * @swagger
 * /api/medicamentos/{nombreGenerico}/{formaFarmaceutica}/concentraciones:
 *   get:
 *     summary: Obtener concentraciones para nombre + forma
 *     tags: [Medicamentos]
 *     parameters:
 *       - in: path
 *         name: nombreGenerico
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: formaFarmaceutica
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de concentraciones
 */

router.get('/:nombreGenerico/:formaFarmaceutica/dosis', MedicamentoController.getDosis);
/**
 * @swagger
 * /api/medicamentos/{nombreGenerico}/{formaFarmaceutica}/{concentracion}/presentaciones:
 *   get:
 *     summary: Obtener presentaciones para nombre + forma + concentración
 *     tags: [Medicamentos]
 *     parameters:
 *       - in: path
 *         name: nombreGenerico
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: formaFarmaceutica
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: concentracion
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de presentaciones
 */
router.get('/:nombreGenerico/:formaFarmaceutica/:dosis/presentaciones', MedicamentoController.getPresentaciones);

// 🔎 Búsqueda final por combinación completa
/**
 * @swagger
 * /api/medicamentos/buscar:
 *   post:
 *     summary: Buscar un medicamento por los 4 campos (nombre, forma, dosis, presentación)
 *     tags: [Medicamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreGenerico
 *               - formaFarmaceutica
 *               - concentracion
 *               - presentacion
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
 *         description: Medicamento encontrado
 *       404:
 *         description: No se encontró el medicamento
 */

router.post(
  '/buscar',
  MedicamentoValidator.validarBusquedaCompleta,
  handleValidationErrors,
  MedicamentoController.getMedicamentoCompleto
);

// ───────────────────────────────
// ➕ Crear nuevo medicamento
/**
 * @swagger
 * /api/medicamentos/crear:
 *   post:
 *     summary: Crear un nuevo medicamento
 *     tags: [Medicamentos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombreGenerico
 *               - formaFarmaceutica
 *               - concentracion
 *               - presentacion
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
 *       201:
 *         description: Medicamento creado
 *       400:
 *         description: Error de validación
 */
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
