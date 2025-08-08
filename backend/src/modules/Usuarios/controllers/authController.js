import * as authSvc from '../services/authService.js';
import ApiError from '../../../utils/ApiError.js';
import { sanitizeUser } from '../../../utils/sanitizeUser.js';

const isProd = process.env.NODE_ENV === 'production';

const cookieOpts = {
  httpOnly : true,
  secure   : isProd,                     // 🔒 true en prod, false en local
  sameSite : isProd ? 'none' : 'lax',    // ✅ 'none' en prod para cross-domain, 'lax' en local
  domain   : isProd ? 'odontapp.com' : undefined, // solo setea dominio en prod
  path     : '/',
};

/* ---------- REGISTER ---------- */
export const register = async (req, res) => {
  // el servicio ya no entrega tokens
  const { user } = await authSvc.register(req.body);

  // sólo status 201 + payload
  return res.created(
    user,
    'Usuario registrado. Verificá tu correo para activar la cuenta.'
  );
};

/* ---------- LOGIN ---------- */
export const login = async (req, res) => {
  const result = await authSvc.login(req.body.email, req.body.password);

  if (result.require2FA) {
    return res.ok({ require2FA: true }, '2FA requerido');
  }

  const { user, accessToken, refreshToken } = result;

  return res
    .cookie('accessToken',  accessToken,  { ...cookieOpts, maxAge: 1000 * 60 * 15 })
    .cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 1000 * 60 * 60 * 24 * 7 })
    .ok({ user, accessToken, refreshToken }, 'Login exitoso');
};

/* ---------- REFRESH ---------- */
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new ApiError('Falta refresh token', 401);

  const newAccess = await authSvc.refresh(refreshToken);

  return res
    .cookie('accessToken', newAccess, { ...cookieOpts, maxAge: 1000 * 60 * 15 })
    .ok(null, 'Token renovado');
};

/* ---------- LOGOUT ---------- */
export const logout = (req, res) => {
  return res
    .clearCookie('accessToken', cookieOpts)
    .clearCookie('refreshToken', cookieOpts)
    .ok(null, 'Sesión cerrada');
};

/* ---------- RECUPERACIÓN ---------- */
export const forgotPassword = async (req, res) => {
  await authSvc.forgotPassword(req.body.email);
  return res.ok(null, 'Si el email existe, te enviamos un enlace de recuperación.');
};

export const resetPassword = async (req, res) => {
  await authSvc.resetPassword(req.params.token, req.body.password);
  return res.ok(null, 'Contraseña actualizada');
};

/* ---------- VERIFICACIÓN ---------- */
export const verifyEmail = async (req, res) => {
  await authSvc.verifyEmail(req.params.token);
  return res.ok(null, 'Correo verificado');
};

export const resendConfirmation = async (req, res) => {
  await authSvc.resendConfirmation(req.body.email);
  return res.ok(null, 'Correo reenviado');
};

/* ---------- ME ---------- */
export const getMe = async (req, res) => {
  const me = await authSvc.getMe(req.user.id);
  return res.ok(sanitizeUser(me));
};

export const updateMe = async (req, res) => {
  const me = await authSvc.updateMe(req.user.id, req.body);
  return res.ok(sanitizeUser(me), 'Perfil actualizado');
};


/* ---------- ME / CAMBIAR PWD ---------- */
export const changeMyPassword = async (req, res) => {
  await authSvc.changePassword(req.user.id, req.body.actual, req.body.nueva);
  return res.ok(null, 'Contraseña cambiada');
};
