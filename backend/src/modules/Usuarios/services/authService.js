import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as userRepo from '../repositories/usuarioRepository.js';
import * as authRepo from '../repositories/authRepository.js';
import { enviarCorreo } from '../../../services/emailService.js';
import ApiError from '../../../utils/ApiError.js';
import { registrarLog } from './auditService.js';
import { Permiso, Rol, Usuario } from '../models/index.js';
import cloudinary from '../../../utils/upload/cloudinary.js';

const {
  JWT_SECRET,
  JWT_EXP = '15m',
  JWT_REFRESH_EXP = '7d',
  APP_URL = process.env.FRONTEND_URL || 'http://localhost:3000',
} = process.env;

const passwordIsStrong = (pwd) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(pwd);

const signAccess = (u) =>
  jwt.sign(
    { id: u.id, email: u.email, roleId: u.RolId },
    JWT_SECRET,
    { expiresIn: JWT_EXP }
  );

const signRefresh = (u) =>
  jwt.sign({ id: u.id, tokenType: 'refresh' }, JWT_SECRET, { expiresIn: JWT_REFRESH_EXP });

/* ----------- REGISTRO ----------- */
export const register = async (data) => {
  if (await userRepo.findByEmail(data.email)) {
    throw new ApiError('El correo ya está en uso', 409, null, 'EMAIL_DUPLICADO');
  }

  const user = await userRepo.create({ ...data, RolId: 4 });
  await sendConfirmation(user);

  return { user };
};

/* ----------- LOGIN ----------- */
export const login = async (email, password) => {
  const user = await userRepo.findByEmail(email, { includeRole: true });
  if (!user) {
    throw new ApiError('Credenciales inválidas', 401, null, 'LOGIN_INVALIDO');
  }
  if (user.proveedor === 'google') {
    throw new ApiError(
      'Usá Google para iniciar sesión',
      403,
      null,
      'LOGIN_CON_GOOGLE'
    );
  }
  if (!user.activo) {
    throw new ApiError('Debes verificar tu cuenta', 403, null, 'EMAIL_NO_VERIFICADO');
  }

  if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
    const minutosRestantes = Math.ceil((user.bloqueadoHasta - new Date()) / 60000);
    throw new ApiError(
      'Cuenta bloqueada temporalmente',
      429,
      { retryAfterMinutes: minutosRestantes },
      'USUARIO_BLOQUEADO'
    );
  }

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
    throw new ApiError('Credenciales inválidas', 401, null, 'LOGIN_INVALIDO');
  }

  await user.update({
    intentosFallidos: 0,
    bloqueadoHasta: null,
    ultimoLogin: new Date(),
  });
  await registrarLog(user.id, 'auth', 'login_success');

  if (user.twoFactorEnabled) {
    return {
      user,
      require2FA: true,
    };
  }

  return {
    user,
    accessToken: signAccess(user),
    refreshToken: signRefresh(user),
  };
};

/* ----------- REFRESH TOKEN ----------- */
export const refresh = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    if (decoded.tokenType !== 'refresh') throw new Error();

    const user = await userRepo.findById(decoded.id, { includeRole: true });
    return signAccess(user);
  } catch {
    throw new ApiError('Refresh token inválido', 403, null, 'REFRESH_INVALIDO');
  }
};

/* ----------- RECUPERAR CONTRASEÑA ----------- */
export const forgotPassword = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) return;

  if (user.proveedor === 'google') {
    throw new ApiError(
      'Usaste Google para registrarte. Iniciá sesión con ese método.',
      400,
      null,
      'CUENTA_CON_GOOGLE'
    );
  }

  const tokenRow = await authRepo.crearResetToken(user.id);
  const link = `${APP_URL}/reset-password/${tokenRow.token}`;

  await enviarCorreo({
    to: user.email,
    subject: 'Recuperar contraseña – OdontApp',
    template: 'resetPassword',
    vars: { name: user.nombre, link },
  });

  await registrarLog(user.id, 'auth', 'forgot_password');
};


export const resetPassword = async (token, nuevaPassword) => {
  const tokenRow = await authRepo.obtenerResetTokenValido(token);
  if (!tokenRow) {
    throw new ApiError('Token inválido o expirado', 400, null, 'TOKEN_INVALIDO');
  }

  // Recuperar usuario con password incluido (sin defaultScope)
  const user = await Usuario.scope(null).findByPk(tokenRow.Usuario.id);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, null, 'USUARIO_INEXISTENTE');
  }

  // Validar si es igual a la anterior
  const yaUsada = await bcrypt.compare(nuevaPassword, user.password);
  if (yaUsada) {
    throw new ApiError(
      'Elegí una contraseña distinta a la anterior',
      400,
      null,
      'PASSWORD_REPETIDA'
    );
  }

  // Validar fuerza
  const reglas = [
    /.{8,}/,
    /[A-Z]/,
    /[a-z]/,
    /\d/,
    /[!@#$%^&*]/,
  ];
  const esFuerte = reglas.every((rx) => rx.test(nuevaPassword));
  if (!esFuerte) {
    throw new ApiError(
      'La contraseña no cumple los requisitos mínimos',
      400,
      null,
      'PASSWORD_DEBIL'
    );
  }

  // Actualizar forzando cambio y asegurando hook
  user.set('password', nuevaPassword);
  user.changed('password', true); // 🛠️ fuerza Sequelize a considerar como cambiado
  await user.save();              // 🧠 aplica el hook `beforeUpdate`

  await authRepo.marcarResetTokenUsado(tokenRow);
  await registrarLog(user.id, 'auth', 'password_reset');
};


/* ========= (C)  changePassword – para /me/password ========= */
export const changePassword = async (userId, actual, nueva) => {
  const user = await userRepo.findById(userId);
  if (!user) throw new ApiError('Usuario inexistente', 404, null, 'USUARIO_INEXISTENTE');

  const ok = await bcrypt.compare(actual, user.password);
  if (!ok)   throw new ApiError('Contraseña actual incorrecta', 401, null, 'PWD_ACTUAL_INCORRECTA');

  if (!passwordIsStrong(nueva))
    throw new ApiError('Contraseña débil', 400, null, 'PASSWORD_DEBIL');

  const esIgual = await bcrypt.compare(nueva, user.password);
  if (esIgual)
    throw new ApiError('La nueva contraseña debe ser diferente', 400, null, 'PASSWORD_REPETIDA');

  await user.update({ password: await bcrypt.hash(nueva, 10), passwordChangedAt: new Date() });
  await registrarLog(user.id, 'auth', 'password_change');
};

/* ----------- VERIFICAR EMAIL ----------- */
export const sendConfirmation = async (user) => {
  const tokenRow = await authRepo.crearEmailToken(user.id);
  const link = `${APP_URL}/verify-email/${tokenRow.token}`;

  await enviarCorreo({
    to: user.email,
    subject: 'Confirma tu correo – OdontApp',
    template: 'confirmEmail',
    vars: {
      name: user.nombre,
      link,
    },
  });

  await registrarLog(user.id, 'auth', 'email_confirmation_sent');
};

export const verifyEmail = async (token) => {
  const tokenRow = await authRepo.obtenerEmailToken(token);
  if (!tokenRow) {
    throw new ApiError('Token inválido', 400, null, 'TOKEN_INEXISTENTE');
  }

  console.log('🔍 tokenRow:', {
    usado: tokenRow.usado,
    expire: tokenRow.expire,
    activo: tokenRow.Usuario.activo,
  });

  // ✅ Token ya usado pero usuario ya activo → responder OK silenciosamente
  if (tokenRow.usado) {
    if (tokenRow.Usuario.activo) {
      return; // <-- no tirar error
    } else {
      throw new ApiError('Este enlace ya fue utilizado', 400, null, 'TOKEN_YA_USADO');
    }
  }

  if (tokenRow.expire < new Date()) {
    throw new ApiError('El enlace ha expirado', 400, null, 'TOKEN_EXPIRADO');
  }

  await tokenRow.Usuario.update({ activo: true });
  await authRepo.marcarEmailTokenUsado(tokenRow);
  await registrarLog(tokenRow.Usuario.id, 'auth', 'email_verified');
};


export const resendConfirmation = async (email) => {
  const user = await userRepo.findByEmail(email);
  if (!user) {
    throw new ApiError('Usuario no encontrado', 404, null, 'USUARIO_INEXISTENTE');
  }

  if (user.activo) {
    throw new ApiError('Este correo ya fue verificado', 400, null, 'YA_VERIFICADO');
  }

  await sendConfirmation(user);
  await registrarLog(user.id, 'auth', 'resend_email_confirmation');
};


/* ----------- PERFIL ----------- */
export const getMe = async (id) => {
  const usuario = await Usuario.findByPk(id, {
    include: [
      {
        model: Rol,
        as: 'Rol',
        include: [
          {
            model: Permiso,
            through: { attributes: [] }, // Oculta tabla pivote
          },
        ],
      },
    ],
  });

  if (!usuario) return null;

  const data = usuario.toJSON();

  // 🔹 Flatten: Rol.Permisos -> permisos[]
  data.permisos =
    data.Rol?.Permisos?.map((p) => ({
      id: p.id,
      recurso: p.recurso,
      accion: p.accion,
    })) || [];

  // Eliminamos Permisos para no duplicar
  if (data.Rol?.Permisos) delete data.Rol.Permisos;

  return data;
};

export const updateMe = async (userId, data) => {
  const usuario = await Usuario.findByPk(userId);
  if (!usuario) {
    throw new ApiError('Usuario no encontrado', 404, null, 'USUARIO_INEXISTENTE');
  }

  if (data.avatarUrl && usuario.avatarUrl) {
    try {
      const parts = usuario.avatarUrl.split('/');
      const publicId = parts.slice(-2).join('/').split('.')[0];
      await cloudinary.uploader.destroy(publicId);
    } catch (e) {
      console.warn('⚠️ No se pudo eliminar el avatar anterior:', e.message);
    }
  }

  await usuario.update(data);
  return usuario;
};
