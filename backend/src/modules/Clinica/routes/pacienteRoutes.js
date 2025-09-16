<<<<<<< HEAD
import { Router } from "express";
import {
  vCrearPaciente,
  vActualizarPaciente,
} from "../validators/PacienteValidator.js";
import * as PacienteController from "../controllers/PacienteController.js";

const router = Router();
/**
 * @swagger
 * tags:
 *   name: Pacientes
 *   description: Endpoints para gestionar pacientes
=======
import { Router } from 'express';
import * as pacienteCtrl from '../controllers/pacienteController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import { vCrearPaciente, vActualizarPaciente } from '../validators/pacienteValidator.js';
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   - name: Pacientes
 *     description: Gestión clínica de pacientes
>>>>>>> origin
 */

/**
 * @swagger
<<<<<<< HEAD
 * /api/pacientes:
 *   get:
 *     summary: Listar todos los pacientes
 *     tags: [Pacientes]
=======
 * /clinica/pacientes:
 *   get:
 *     summary: Listar pacientes
 *     tags: [Pacientes]
 *     security:
 *       - cookieAuth: []
>>>>>>> origin
 *     responses:
 *       200:
 *         description: Lista de pacientes
 */
<<<<<<< HEAD
//listar pacientes
router.get("/", PacienteController.listarPacientes);


/**
 * @swagger
 * /api/pacientes:
 *   post:
 *     summary: Crear un nuevo paciente
 *     tags: [Pacientes]
=======
router.get(
  '/',
  requirePermiso('pacientes', 'listar'),
  pacienteCtrl.listarPacientes
);

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
router.get(
  '/:id',
  requirePermiso('pacientes', 'listar'),
  pacienteCtrl.obtenerPacientePorId
);

/**
 * @swagger
 * /clinica/pacientes:
 *   post:
 *     summary: Crear paciente con datos personales y contacto
 *     tags: [Pacientes]
 *     security:
 *       - cookieAuth: []
>>>>>>> origin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
<<<<<<< HEAD
 *             required:
 *               - nombre
 *               - apellido
 *               - dni
 *               - email
=======
 *             required: [nombre, apellido, dni]
>>>>>>> origin
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               dni:
 *                 type: string
<<<<<<< HEAD
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paciente creado correctamente
 *       400:
 *         description: Error de validación
 */
//crear paciente
router.post("/", vCrearPaciente, PacienteController.crearPaciente);
/**
 * @swagger
 * /api/pacientes/{id}:
 *   get:
 *     summary: Obtener un paciente por ID
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del paciente
 *     responses:
 *       200:
 *         description: Datos del paciente
 *       404:
 *         description: Paciente no encontrado
 */
//obtener paciente por ID
router.get("/:id", PacienteController.getPaciente);
/**
 * @swagger
 * /api/pacientes/{id}:
 *   put:
 *     summary: Actualizar un paciente por ID
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
=======
 *               contacto:
 *                 type: object
 *               direccion:
 *                 type: object
 *     responses:
 *       201:
 *         description: Paciente creado
 */
router.post(
  '/',
  requirePermiso('pacientes', 'crear'),
  vCrearPaciente,
  pacienteCtrl.crearPaciente
);

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
>>>>>>> origin
 *       content:
 *         application/json:
 *           schema:
 *             type: object
<<<<<<< HEAD
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Paciente actualizado correctamente
 *       404:
 *         description: Paciente no encontrado
 *       400:
 *         description: Error de validación
 */

//actualizar paciente
router.put("/:id", vActualizarPaciente, PacienteController.actualizarPaciente);

/**
 * @swagger
 * /api/pacientes/{id}:
 *   delete:
 *     summary: Eliminar un paciente por ID
 *     tags: [Pacientes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paciente eliminado
 *       404:
 *         description: Paciente no encontrado
 */

//eliminar paciente
router.delete("/:id", PacienteController.eliminarPaciente);
/**
 * @swagger
 * /api/pacientes/buscar:
 *   get:
 *     summary: Buscar pacientes por nombre, apellido o DNI
 *     tags: [Pacientes]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Texto a buscar (nombre, apellido o DNI)
 *     responses:
 *       200:
 *         description: Lista de pacientes coincidentes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   nombre:
 *                     type: string
 *                   apellido:
 *                     type: string
 *                   dni:
 *                     type: string
 *       400:
 *         description: Falta parámetro de búsqueda
 *       500:
 *         description: Error interno del servidor
 */
router.get("/buscar", PacienteController.buscarPacientes);
=======
 *     responses:
 *       200:
 *         description: Paciente actualizado
 */
router.put(
  '/:id',
  requirePermiso('pacientes', 'editar'),
  vActualizarPaciente,
  pacienteCtrl.actualizarPaciente
);

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
router.delete(
  '/:id',
  requirePermiso('pacientes', 'eliminar'),
  pacienteCtrl.eliminarPaciente
);

>>>>>>> origin
export default router;
