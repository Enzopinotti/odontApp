import { Router } from 'express';
import * as c from '../controllers/authController.js';
import {
  vLogin as validarLogin,
  vRegister as validarCrearUsuario,
  vForgot as validarForgotPassword,
  vReset as validarResetPassword,
} from '../validators/authValidator.js';

const router = Router();

// Auth básica
router.post('/login', validarLogin, c.login);
router.post('/register', validarCrearUsuario, c.register);
router.post('/logout', c.logout);

// Recuperación y confirmación
router.post('/forgot-password', validarForgotPassword, c.forgotPassword);
router.post('/reset-password/:token', validarResetPassword, c.resetPassword);
router.get('/verify-email/:token', c.verifyEmail);
router.post('/resend-confirmation', validarForgotPassword, c.resendConfirmation);

export default router;
