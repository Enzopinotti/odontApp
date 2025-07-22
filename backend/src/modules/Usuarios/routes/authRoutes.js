import { Router } from 'express';
import * as c from '../controllers/authController.js';
import {
  vLogin as validarLogin,
  vRegister as validarCrearUsuario,
  vForgot as validarForgotPassword,
  vReset as validarResetPassword,
} from '../validators/authValidator.js';
import { vUpdateMe, vChangePassword } from '../validators/meValidator.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Autenticación y perfil del usuario
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@odontapp.com
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Auth]
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
 *     responses:
 *       201:
 *         description: Usuario registrado
 */

router.post('/login', validarLogin, c.login);
router.post('/register', validarCrearUsuario, c.register);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Sesión cerrada
 */
router.post('/logout', c.logout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Enviar correo de recuperación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Enlace enviado (si existe)
 */
router.post('/forgot-password', validarForgotPassword, c.forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Establecer nueva contraseña
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
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
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 */
router.post('/reset-password/:token', validarResetPassword, c.resetPassword);

/**
 * @swagger
 * /auth/verify-email/{token}:
 *   get:
 *     summary: Verificar correo electrónico
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Correo verificado
 */
router.get('/verify-email/:token', c.verifyEmail);

/**
 * @swagger
 * /auth/resend-confirmation:
 *   post:
 *     summary: Reenviar email de verificación
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Correo reenviado
 */
router.post('/resend-confirmation', validarForgotPassword, c.resendConfirmation);

/* --------- Endpoints de perfil --------- */

router.use(requireAuth);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Ver mi perfil
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario autenticado
 */
router.get('/me', c.getMe);

/**
 * @swagger
 * /auth/me:
 *   put:
 *     summary: Editar datos personales
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
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
router.put('/me', vUpdateMe, c.updateMe);

/**
 * @swagger
 * /auth/me/password:
 *   put:
 *     summary: Cambiar contraseña
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [actual, nueva]
 *             properties:
 *               actual:
 *                 type: string
 *               nueva:
 *                 type: string
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 */
router.put('/me/password', vChangePassword, c.changeMyPassword);

export default router;
