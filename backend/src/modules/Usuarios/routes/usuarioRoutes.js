import { Router } from 'express';
import usuarioController from '../controllers/usuarioController.js';
import {
  validarCrearUsuario,
  validarEditarUsuario,
} from '../validators/usuarioValidator.js';
import * as rolCtrl from '../controllers/rolController.js';
import * as permCtrl from '../controllers/permisoController.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';

import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Gestión de usuarios para administradores
 */

/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Listar todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios
 */
router.get(
  '/',
  requirePermiso('usuarios', 'listar'),
  usuarioController.obtenerUsuarios
);

/* --- Roles y Permisos (Deben ir antes de :id) --- */
router.get('/roles', requirePermiso('roles', 'listar'), rolCtrl.obtenerRoles);
router.get('/permisos', requirePermiso('permisos', 'listar'), permCtrl.obtenerPermisos);
router.get('/roles/:id', requirePermiso('roles', 'listar'), rolCtrl.obtenerRolPorId);
router.put('/roles/:id/permisos', requirePermiso('roles', 'editar'), rolCtrl.actualizarPermisos);

/**
 * @swagger
 * /usuarios/{id}:
 *   get:
...
 *     responses:
 *       200:
 *         description: Datos del usuario
 */
router.get(
  '/:id',
  requirePermiso('usuarios', 'listar'),
  usuarioController.obtenerUsuarioPorId
);


/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, apellido, email, password]
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post(
  '/',
  requirePermiso('usuarios', 'crear'),
  validarCrearUsuario,
  usuarioController.crearUsuario
);

/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Editar un usuario
 *     tags: [Usuarios]
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
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               telefono:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put(
  '/:id',
  requirePermiso('usuarios', 'editar'),
  validarEditarUsuario,
  usuarioController.editarUsuario
);

/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario
 *     tags: [Usuarios]
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
 *         description: Usuario eliminado
 */
router.delete(
  '/:id',
  requirePermiso('usuarios', 'eliminar'),
  usuarioController.eliminarUsuario
);
router.patch(
  '/:id/toggle',
  requirePermiso('usuarios', 'editar'),
  usuarioController.alternarEstado
);

import * as auditCtrl from '../controllers/auditController.js';

router.get('/audit/logs', requirePermiso('configuracion', 'ver'), auditCtrl.obtenerLogs);

export default router;



