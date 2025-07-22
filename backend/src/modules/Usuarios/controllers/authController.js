import * as authSvc from '../services/authService.js';
import ApiError from '../../../utils/ApiError.js';

import { sanitizeUser } from '../../../utils/sanitizeUser.js';

const cookieOpts = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === 'production',
  sameSite : 'strict',
  domain   : process.env.COOKIE_DOMAIN,
  path     : '/',
};

/* ---------- REGISTER ---------- */
export const register = async (req, res) => {
  const { user, accessToken, refreshToken } = await authSvc.register(req.body);

  res
    .cookie('accessToken',  accessToken,  { ...cookieOpts, maxAge: 1000 * 60 * 15 })
    .cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 1000 * 60 * 60 * 24 * 7 })
    .created(user, 'Usuario registrado');
};

/* ---------- LOGIN ---------- */
export const login = async (req, res) => {
  const { user, accessToken, refreshToken } = await authSvc.login(
    req.body.email,
    req.body.password
  );

  res
    .cookie('accessToken',  accessToken,  { ...cookieOpts, maxAge: 1000 * 60 * 15 })
    .cookie('refreshToken', refreshToken, { ...cookieOpts, maxAge: 1000 * 60 * 60 * 24 * 7 })
    .ok({ user, accessToken, refreshToken }, 'Login exitoso'); 
};
/* ---------- REFRESH ---------- */
export const refreshToken = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw new ApiError('Falta refresh token', 401);

  const newAccess = await authSvc.refresh(refreshToken);
  res.cookie('accessToken', newAccess, { ...cookieOpts, maxAge: 1000 * 60 * 15 }).ok();
};

/* ---------- LOGOUT ---------- */
export const logout = (req, res) => {
  res
    .clearCookie('accessToken', cookieOpts)
    .clearCookie('refreshToken', cookieOpts)
    .ok(null, 'Sesión cerrada');
};

/* ---------- RECUPERACIÓN ---------- */
export const forgotPassword = async (req, res) => {
  await authSvc.forgotPassword(req.body.email);
  res.ok(null, 'Si el email existe, se envió un enlace de recuperación.');
};

export const resetPassword = async (req, res) => {
  await authSvc.resetPassword(req.params.token, req.body.password);
  res.ok(null, 'Contraseña actualizada');
};

/* ---------- VERIFICACIÓN ---------- */
export const verifyEmail = async (req, res) => {
  await authSvc.verifyEmail(req.params.token);
  res.ok(null, 'Correo verificado');
};

export const resendConfirmation = async (req, res) => {
  await authSvc.resendConfirmation(req.body.email);
  res.ok(null, 'Correo reenviado');
};


/* ---------- ME ---------- */
export const getMe = async (req, res) => {
  const me = await authSvc.getMe(req.user.id);
  res.ok(sanitizeUser(me));
};

export const updateMe = async (req, res) => {
  const me = await authSvc.updateMe(req.user.id, req.body);
  res.ok(sanitizeUser(me), 'Perfil actualizado');
};

export const changeMyPassword = async (req, res) => {
  await authSvc.changePassword(
    req.user.id,
    req.body.actual,
    req.body.nueva
  );
  res.ok(null, 'Contraseña cambiada');
};
