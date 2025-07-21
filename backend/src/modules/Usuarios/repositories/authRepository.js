import { PasswordResetToken, EmailVerificationToken } from '../models/index.js';
import { v4 as uuid } from 'uuid';
import { Op } from 'sequelize';

export const crearResetToken = async (UsuarioId) =>
  PasswordResetToken.create({
    UsuarioId,
    token: uuid(),
    expire: new Date(Date.now() + 60 * 60 * 1000), // 1 hora
  });

export const obtenerResetTokenValido = (token) =>
  PasswordResetToken.findOne({
    where: {
      token,
      usado: false,
      expire: { [Op.gt]: new Date() },
    },
    include: 'Usuario',
  });

export const marcarResetTokenUsado = (tokenRow) => tokenRow.update({ usado: true });

export const crearEmailToken = async (UsuarioId) =>
  EmailVerificationToken.create({
    UsuarioId,
    token: uuid(),
    expire: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

export const obtenerEmailTokenValido = (token) =>
  EmailVerificationToken.findOne({
    where: {
      token,
      usado: false,
      expire: { [Op.gt]: new Date() },
    },
    include: 'Usuario',
  });

export const marcarEmailTokenUsado = (tokenRow) => tokenRow.update({ usado: true });
