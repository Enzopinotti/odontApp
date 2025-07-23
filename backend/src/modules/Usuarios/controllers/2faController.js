import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import ApiError from '../../../utils/ApiError.js';
import { Usuario } from '../models/index.js';

export const setup2FA = async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: 'odontApp',
    issuer: 'odontApp',
  });

  const qr = await qrcode.toDataURL(secret.otpauth_url);

  res.ok({ qr, secret: secret.base32 }, 'Secreto generado');
};

export const verify2FA = async (req, res) => {
  const { token, secret } = req.body;

  const valid = speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
  });

  if (!valid) throw new ApiError('Código inválido', 400);

  const user = await Usuario.findByPk(req.user.id);
  user.twoFactorEnabled = true;
  user.twoFactorSecret = secret;
  await user.save();

  res.ok(null, '2FA activado');
};

export const login2FA = async (req, res) => {
  const { email, token } = req.body;

  const user = await Usuario.findOne({ where: { email } });
  if (!user || !user.twoFactorEnabled || !user.twoFactorSecret)
    throw new ApiError('2FA no configurado para este usuario', 400);

  const valid = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
  });

  if (!valid) throw new ApiError('Código inválido', 401);

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

  res
    .cookie('accessToken', accessToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', domain: process.env.COOKIE_DOMAIN, path: '/' })
    .cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', domain: process.env.COOKIE_DOMAIN, path: '/' })
    .ok({ accessToken, refreshToken }, 'Login con 2FA exitoso');
};

export const disable2FA = async (req, res) => {
  const user = await Usuario.findByPk(req.user.id);

  user.twoFactorEnabled = false;
  user.twoFactorSecret = null;

  await user.save();
  res.ok(null, '2FA desactivado');
};
