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
import { uploadAvatar } from '../../../utils/upload/multerCloudinary.js';
import * as authSvc from '../services/authService.js';
import * as twoFA from '../controllers/2faController.js';


import passport from '../../../config/passport.js';
import jwt from 'jsonwebtoken';

const router = Router();

const isProd = process.env.NODE_ENV === 'production';

const cookieOpts = {
  httpOnly : true,
  secure   : isProd,                     // 🔒 true en prod, false en local
  sameSite : isProd ? 'none' : 'lax',    // ✅ 'none' en prod para cross-domain, 'lax' en local
  domain   : isProd ? 'odontapp.com' : undefined, // solo setea dominio en prod
  path     : '/',
};

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



// Redirección a Google
router.get('/google', (req, res, next) => {
  const redirectUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
  console.log('🌐 Redirigiendo a Google desde:', redirectUrl);
  next();
}, passport.authenticate('google', { session: false, scope: ['profile', 'email'] }));


// Callback de Google
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.APP_URL}/login?error=google` }),
  async (req, res) => {
    const user = req.user;

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, roleId: user.RolId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXP }
    );

    const refreshToken = jwt.sign(
      { id: user.id, tokenType: 'refresh' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXP }
    );

    res
      .cookie('accessToken',  accessToken,  { ...cookieOpts, maxAge: 1000 * 60 * 15 })
      .cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 1000 * 60 * 60 * 24 * 7 })
      .redirect(`${process.env.FRONTEND_URL}/`); // o devuelve JSON si tu front es SPA
  }
);

/**
 * @swagger
 * /auth/2fa/login:
 *   post:
 *     summary: Login con 2FA usando email y código TOTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, token]
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso con JWT
 */
router.post('/2fa/login', twoFA.login2FA);


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


/**
 * @swagger
 * /auth/avatar:
 *   post:
 *     summary: Subir avatar del usuario
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar actualizado
 */
router.post('/avatar', uploadAvatar.single('avatar'), async (req, res) => {
  const user = await authSvc.updateMe(req.user.id, {
    avatarUrl: req.file.path,
  });
  res.ok(user, 'Avatar actualizado');
});


/**
 * @swagger
 * /auth/2fa/setup:
 *   post:
 *     summary: Generar secreto y QR para configurar 2FA
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: QR y secreto base32
 */
router.post('/2fa/setup', twoFA.setup2FA);

/**
 * @swagger
 * /auth/2fa/verify:
 *   post:
 *     summary: Confirmar código TOTP y activar 2FA
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, secret]
 *             properties:
 *               token:
 *                 type: string
 *               secret:
 *                 type: string
 *     responses:
 *       200:
 *         description: 2FA activado
 */
router.post('/2fa/verify', twoFA.verify2FA);




/**
 * @swagger
 * /auth/2fa:
 *   delete:
 *     summary: Desactivar 2FA para el usuario autenticado
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: 2FA desactivado correctamente
 */
router.delete('/2fa', twoFA.disable2FA);



export default router;
