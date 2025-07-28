import { Router } from 'express';
import * as pacienteCtrl from '../controllers/pacienteController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   - name: Pacientes
 *     description: Gestión clínica de pacientes
 */

/**
 * @swagger
 * /clinica/pacientes:
 *   get:
 *     summary: Listar pacientes
 *     tags: [Pacientes]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
router.get('/', pacienteCtrl.listarPacientes);

/**
 * @swagger
 * /clinica/pacientes/{id}:
 *   get:
 *     summary: Obtener paciente por ID
 *     tags: [Pacientes]
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
 *         description: Detalle del paciente
 */
router.get('/:id', pacienteCtrl.obtenerPacientePorId);

/**
 * @swagger
 * /clinica/pacientes:
 *   post:
 *     summary: Crear paciente con datos personales y contacto
 *     tags: [Pacientes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, dni]
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               dni:
 *                 type: string
 *               contacto:
 *                 type: object
 *               direccion:
 *                 type: object
 *     responses:
 *       201:
 *         description: Paciente creado
 */
router.post('/', pacienteCtrl.crearPaciente);

/**
 * @swagger
 * /clinica/pacientes/{id}:
 *   put:
 *     summary: Editar datos del paciente
 *     tags: [Pacientes]
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
 *         description: Paciente actualizado
 */
router.put('/:id', pacienteCtrl.actualizarPaciente);

/**
 * @swagger
 * /clinica/pacientes/{id}:
 *   delete:
 *     summary: Eliminar paciente (baja lógica)
 *     tags: [Pacientes]
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
 *         description: Paciente eliminado
 */
router.delete('/:id', pacienteCtrl.eliminarPaciente);

export default router;
