import { Router } from 'express'; // ✅
import medicamentoRecetadosRoutes from './MedicamentoRecetadoRoutes.js';
const router = Router(); // ✅

//controladores 
import {
    listarRecetas,
    crearReceta,
    getReceta,
    eliminarReceta,
    actualizarReceta
}from '../controllers/recetaController.js'
/**
 * @swagger
 * tags:
 *   name: Recetas
 *   description: Gestión de recetas odontológicas
 */

/**
 * @swagger
 * /api/recetas:
 *   get:
 *     summary: Listar todas las recetas
 *     tags: [Recetas]
 *     responses:
 *       200:
 *         description: Lista de recetas
 */
// GET /recetas para listar recetas
router.get('/',listarRecetas);
/**
 * @swagger
 * /api/recetas:
 *   post:
 *     summary: Crear una nueva receta
 *     tags: [Recetas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pacienteId
 *               - odontologoId
 *               - medicamentos
 *             properties:
 *               pacienteId:
 *                 type: string
 *               odontologoId:
 *                 type: string
 *               observaciones:
 *                 type: string
 *               medicamentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicamentoId:
 *                       type: string
 *                     dosis:
 *                       type: string
 *                     presentacion:
 *                       type: string
 *                     formaFarmaceutica:
 *                       type: string
 *     responses:
 *       201:
 *         description: Receta creada correctamente
 *       400:
 *         description: Error de validación
 */
// POST /recetas para crear una nueva receta
router.post('/', crearReceta);
/**
 * @swagger
 * /api/recetas/{id}:
 *   get:
 *     summary: Obtener una receta por ID
 *     tags: [Recetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la receta
 *     responses:
 *       200:
 *         description: Datos de la receta
 *       404:
 *         description: Receta no encontrada
 */

// GET /recetas/:id para obtener una receta específica
router.get('/:id', getReceta);

/**
 * @swagger
 * /api/recetas/{id}:
 *   delete:
 *     summary: Eliminar una receta
 *     tags: [Recetas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Receta eliminada
 *       404:
 *         description: Receta no encontrada
 */

//DELETE /recetas/:id para eliminar una receta
router.delete('/:id', eliminarReceta);
/**
 * @swagger
 * /api/recetas/{id}:
 *   put:
 *     summary: Actualizar una receta existente
 *     tags: [Recetas]
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
 *               observaciones:
 *                 type: string
 *               medicamentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicamentoId:
 *                       type: string
 *                     dosis:
 *                       type: string
 *                     presentacion:
 *                       type: string
 *                     formaFarmaceutica:
 *                       type: string
 *     responses:
 *       200:
 *         description: Receta actualizada
 *       404:
 *         description: Receta no encontrada
 */

// PUT /recetas/:id para actualizar una receta
router.put('/:id', actualizarReceta);


//GET /recetas/:id/pdf para generar receta en PDF
//router.get('/:id/pdf', generarRecetaPDF);
//POST /recetas/:id/enviar para enviar receta mail o whatsapp
//router.post('/:id/enviar', enviarReceta);


router.use('/:id/medicamentoRecetados', medicamentoRecetadosRoutes);
export default router;
