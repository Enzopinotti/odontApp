import { Router} from 'express';
import * as medicamentoRecetadoController from '../controllers/MedicamentoRecetadoController.js';

const router = Router({mergeParams: true});
/**
 * @swagger
 * tags:
 *   name: Medicamentos Recetados
 *   description: Items dentro de una receta

 * @swagger
 * /api/recetas/{recetaId}/medicamentos-recetados:
 *   get:
 *     summary: Listar medicamentos recetados en una receta
 *     tags: [Medicamentos Recetados]
 *     parameters:
 *       - in: path
 *         name: recetaId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la receta
 *     responses:
 *       200:
 *         description: Lista de medicamentos recetados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   medicamentoId:
 *                     type: string
 *                   dosis:
 *                     type: string
 *                   formaFarmaceutica:
 *                     type: string
 *                   presentacion:
 *                     type: string
 *       404:
 *         description: Receta no encontrada
 *       500:
 *         description: Error en el servidor
 */

router.get('/', medicamentoRecetadoController.listarItems);

export default router;