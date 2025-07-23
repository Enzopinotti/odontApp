import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as userRepo from '../repositories/usuarioRepository.js';
import * as authRepo from '../repositories/authRepository.js';
import { enviarCorreo } from '../../../services/emailService.js';
import ApiError from '../../../utils/ApiError.js';
import { registrarLog } from '../services/auditService.js';
import { Rol, Usuario } from '../models/index.js';
import cloudinary from '../../../utils/upload/cloudinary.js';


const {
  JWT_SECRET,
  JWT_EXP = '15m',
  JWT_REFRESH_EXP = '7d',
  APP_URL = 'http://localhost:3000',
} = process.env;

const signAccess = (u) =>
  jwt.sign(
    {
      id: u.id,
      email: u.email,
      roleId: u.RolId,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXP }
  );

const signRefresh = (u) =>
  jwt.sign({ id: u.id, tokenType: 'refresh' }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXP });

/* ----------- REGISTRO ----------- */
export const register = async (data) => {
  if (await userRepo.findByEmail(data.email))
    throw new ApiError('Email duplicado', 409);

  const user = await userRepo.create({ ...data, RolId: 4 });
  await sendConfirmation(user);

  return {
    user,
    accessToken: signAccess(user),
    refreshToken: signRefresh(user),
  };
};

/* ----------- LOGIN ----------- */
export const login = async (email, password) => {
  const user = await userRepo.findByEmail(email, { includeRole: true });
  if (!user) throw new ApiError('Credenciales inválidas', 401);

  if (!user.activo) throw new ApiError('Debes verificar tu cuenta', 403);

  if (user.bloqueadoHasta && user.bloqueadoHasta > new Date())
    throw new ApiError('Cuenta bloqueada, intenta más tarde', 429);

  const pwdOK = await user.validarPassword(password);
  if (!pwdOK) {
    await user.update({
      intentosFallidos: user.intentosFallidos + 1,
      bloqueadoHasta:
        user.intentosFallidos + 1 >= 3
          ? new Date(Date.now() + 10 * 60 * 1000)
          : null,
    });
    await registrarLog(user.id, 'auth', 'login_fail');
    throw new ApiError('Credenciales inválidas', 401);
  }

  await user.update({
    intentosFallidos: 0,
    bloqueadoHasta: null,
    ultimoLogin: new Date(),
  });
  await registrarLog(user.id, 'auth', 'login_success');

  return {
    user,
    accessToken: signAccess(user),
    refreshToken: signRefresh(user),
  };
};

/* ----------- REFRESH ----------- */
export const refresh = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.tokenType !== 'refresh') throw new Error();

    const user = await userRepo.findById(decoded.id, { includeRole: true });
    return signAccess(user);
  } catch {
    throw new ApiError('Refresh token inválido', 403);
  }
};

/* ----------- RECUPERAR CONTRASEÑA ----------- */
export const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) return;

  const tokenRow = await authRepo.crearResetToken(user.id);
  const link = `${APP_URL}/reset-password/${tokenRow.token}`;

  await enviarCorreo({
    to: user.email,
    subject: 'Recuperar contraseña – odontApp',
    html: `<p>Hola ${user.nombre},</p>
           <p>Haz clic en el siguiente enlace para restablecer tu contraseña (válido 1 hora):</p>
           <a href="${link}">${link}</a>`,
  });

  await registrarLog(user.id, 'auth', 'forgot_password');
};

export const resetPassword = async (token, nuevaPassword) => {
  const tokenRow = await authRepo.obtenerResetTokenValido(token);
  if (!tokenRow) throw new ApiError('Token inválido o expirado', 400);

  await tokenRow.Usuario.update({ password: await bcrypt.hash(nuevaPassword, 10) });
  await authRepo.marcarResetTokenUsado(tokenRow);
  await registrarLog(tokenRow.Usuario.id, 'auth', 'password_reset');
};

/* ----------- CONFIRMAR EMAIL ----------- */
export const sendConfirmation = async (user) => {
  const tokenRow = await authRepo.crearEmailToken(user.id);
  const link = `${APP_URL}/verify-email/${tokenRow.token}`;

  await enviarCorreo({
    to: user.email,
    subject: 'Confirma tu correo – odontApp',
    html: `<p>Bienvenido ${user.nombre},</p>
           <p>Haz clic para verificar tu cuenta:</p>
           <a href="${link}">${link}</a>`,
  });

  await registrarLog(user.id, 'auth', 'email_confirmation_sent');
};

export const verifyEmail = async (token) => {
  const tokenRow = await authRepo.obtenerEmailTokenValido(token);
  if (!tokenRow) throw new ApiError('Token inválido o expirado', 400);

  await tokenRow.Usuario.update({ activo: true });
  await authRepo.marcarEmailTokenUsado(tokenRow);
  await registrarLog(tokenRow.Usuario.id, 'auth', 'email_verified');
};

export const resendConfirmation = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError('Usuario no encontrado', 404);

  await sendConfirmation(user);
  await registrarLog(user.id, 'auth', 'resend_email_confirmation');
};

/* ----------- GET ME ----------- */
export const getMe = async (id) => {
  return Usuario.findByPk(id, {
    include: [{ model: Rol, as: 'Rol' }],
  });
};

export const updateMe = async (userId, data) => {
  const usuario = await Usuario.findByPk(userId);
  if (!usuario) throw new ApiError('Usuario no encontrado', 404);

  // 🔁 Si viene avatar nuevo y ya hay uno viejo, lo eliminamos de Cloudinary
  if (data.avatarUrl && usuario.avatarUrl) {
    try {
      const parts = usuario.avatarUrl.split('/');
      const publicId = parts.slice(-2).join('/').split('.')[0]; // odontapp/avatars/xxxxx
      await cloudinary.uploader.destroy(publicId);
    } catch (e) {
      console.warn('⚠️ No se pudo eliminar el avatar anterior:', e.message);
    }
  }

  await usuario.update(data);
  return usuario;
};