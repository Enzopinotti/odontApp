import { Router } from 'express';
import * as hcCtrl from '../controllers/historiaClinicaController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import { uploadImagenesClinicas } from '../../../utils/upload/multerCloudinary.js';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   - name: Historia Clínica
 *     description: Consultas, evolución y multimedia del paciente
 */

/**
 * @swagger
 * /clinica/historia/{pacienteId}:
 *   get:
 *     summary: Obtener historia clínica del paciente
 *     tags: [Historia Clínica]
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
 *         description: Entradas clínicas del paciente
 */
router.get('/:pacienteId', hcCtrl.obtenerHistoriaClinica);

/**
 * @swagger
 * /clinica/historia/{pacienteId}:
 *   post:
 *     summary: Registrar nueva consulta en historia clínica
 *     tags: [Historia Clínica]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: pacienteId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fecha:
 *                 type: string
 *                 format: date
 *               motivoConsulta:
 *                 type: string
 *               diagnostico:
 *                 type: string
 *               evolucion:
 *                 type: string
 *               observaciones:
 *                 type: string
 *     responses:
 *       201:
 *         description: Consulta registrada
 */
router.post('/:pacienteId', hcCtrl.registrarEntradaClinica);

/**
 * @swagger
 * /clinica/historia/{historiaClinicaId}/imagenes:
 *   post:
 *     summary: Subir imagen clínica (radiografía, escaneo, foto)
 *     tags: [Historia Clínica]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: historiaClinicaId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [imagen]
 *             properties:
 *               imagen:
 *                 type: string
 *                 format: binary
 *               tipoImagen:
 *                 type: string
 *                 enum: [Radiografia, Foto, Escaneo, Otro]
 *               fechaCarga:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Imagen subida
 */
router.post(
   '/:historiaClinicaId/imagenes',
   uploadImagenesClinicas.single('imagen'),
   hcCtrl.subirImagenClinica
);

export default router;
