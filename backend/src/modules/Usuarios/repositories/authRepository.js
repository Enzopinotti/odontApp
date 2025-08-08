// backend/src/modules/Usuarios/repositories/authRepository.js
import { PasswordResetToken, EmailVerificationToken } from '../models/index.js';
import { v4 as uuid } from 'uuid';
import { Op } from 'sequelize';

/* ---------- Tokens de recuperación ---------- */

export const crearResetToken = async (UsuarioId) =>
  PasswordResetToken.create({
    UsuarioId,
    token : uuid(),
    expire: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
  });

export const obtenerResetTokenValido = (token) =>
  PasswordResetToken.findOne({
    where: {
      token,
      usado : false,
      expire: { [Op.gt]: new Date() },
    },
    include: 'Usuario',
  });

  export const obtenerEmailToken = (token) =>
  EmailVerificationToken.findOne({
    where: { token },
    include: 'Usuario',
  });

export const marcarResetTokenUsado = (tokenRow) =>
  tokenRow.update({ usado: true });

/* ---------- Tokens de verificación de email ---------- */

export const crearEmailToken = async (UsuarioId) =>
  EmailVerificationToken.create({
    UsuarioId,
    token : uuid(),
    expire: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
  });

export const obtenerEmailTokenValido = (token) =>
  EmailVerificationToken.findOne({
    where: {
      token,
      usado : false,
      expire: { [Op.gt]: new Date() },
    },
    include: 'Usuario',
  });

export const marcarEmailTokenUsado = (tokenRow) =>
  tokenRow.update({ usado: true });
