import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as userRepo from '../repositories/usuarioRepository.js';
import * as authRepo from '../repositories/authRepository.js';
import { enviarCorreo } from './emailService.js';
import ApiError from '../../../utils/ApiError.js';

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

/* ----------- REGISTRO Y LOGIN ----------- */
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

export const login = async (email, password) => {
  const user = await userRepo.findByEmail(email, { includeRole: true });
  if (!user || !(await user.validarPassword(password)))
    throw new ApiError('Credenciales inválidas', 401);

  return {
    user,
    accessToken: signAccess(user),
    refreshToken: signRefresh(user),
  };
};

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

/* ----------- RECUPERACIÓN ----------- */
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
};

export const resetPassword = async (token, nuevaPassword) => {
  const tokenRow = await authRepo.obtenerResetTokenValido(token);
  if (!tokenRow) throw new ApiError('Token inválido o expirado', 400);

  await tokenRow.Usuario.update({ password: await bcrypt.hash(nuevaPassword, 10) });
  await authRepo.marcarResetTokenUsado(tokenRow);
};

/* ----------- VERIFICACIÓN ----------- */
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
};

export const verifyEmail = async (token) => {
  const tokenRow = await authRepo.obtenerEmailTokenValido(token);
  if (!tokenRow) throw new ApiError('Token inválido o expirado', 400);

  await tokenRow.Usuario.update({ activo: true });
  await authRepo.marcarEmailTokenUsado(tokenRow);
};

export const resendConfirmation = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) throw new ApiError('Usuario no encontrado', 404);

  await sendConfirmation(user);
};
