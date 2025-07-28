import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import jwt from 'jsonwebtoken';
import ApiError from '../../../utils/ApiError.js';
import { Usuario, Rol } from '../models/index.js';
import { registrarLog } from '../services/auditService.js';

const cookieOpts = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === 'production',
  sameSite : process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  domain   : process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined,
  path     : '/',
};


/* ---------- GENERAR QR Y SECRETO ---------- */
export const setup2FA = async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: 'odontApp',
    issuer: 'odontApp',
  });

  const qr = await qrcode.toDataURL(secret.otpauth_url);
  res.ok({ qr, secret: secret.base32 }, 'Secreto generado');
};

/* ---------- ACTIVAR 2FA ---------- */
export const verify2FA = async (req, res) => {
  const { token, secret } = req.body;

  const valid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
  });

  if (!valid) throw new ApiError('Código inválido', 400, null, '2FA_INVALIDO');

  const user = await Usuario.findByPk(req.user.id);
  user.twoFactorEnabled = true;
  user.twoFactorSecret = secret;
  await user.save();

  await registrarLog(user.id, 'auth', '2fa_activated');
  res.ok(null, '2FA activado');
};

/* ---------- LOGIN CON 2FA ---------- */
export const login2FA = async (req, res) => {
  const { email, token } = req.body;

  const user = await Usuario.findOne({ where: { email } });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
    throw new ApiError('2FA no configurado para este usuario', 400, null, '2FA_NO_CONFIGURADO');
  }
  console.log('Intentando login 2FA con:', token, 'para', user.email);
  const delta = speakeasy.totp.verifyDelta({
    secret  : user.twoFactorSecret,
    encoding: 'base32',
    token,
    window  : 2, // tolerancia de ±60s
  });

  if (delta === null) {
    await registrarLog(user.id, 'auth', '2fa_fail');
    throw new ApiError('Código inválido', 401, null, '2FA_INVALIDO');
  }

  const fullUser = await Usuario.findByPk(user.id, {
    include: [{ model: Rol, as: 'Rol' }],
  });

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, roleId: user.RolId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXP || '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, tokenType: 'refresh' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXP || '7d' }
  );

  await user.update({ ultimoLogin: new Date() });
  await registrarLog(user.id, 'auth', '2fa_success');

  return res
    .cookie('accessToken',  accessToken,  { ...cookieOpts, maxAge: 1000 * 60 * 15 })
    .cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 1000 * 60 * 60 * 24 * 7 })
    .ok({ user: fullUser, accessToken, refreshToken }, 'Login con 2FA exitoso');
};

/* ---------- DESACTIVAR 2FA ---------- */
export const disable2FA = async (req, res) => {
  const user = await Usuario.findByPk(req.user.id);
  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;
  await user.save();

  await registrarLog(user.id, 'auth', '2fa_disabled');
  res.ok(null, '2FA desactivado');
};
