import * as usuarioService from '../services/usuarioService.js';

/* GET /api/usuarios */
export const obtenerUsuarios = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 20;
  const { data, total } = await usuarioService.getPaginated(page, perPage);
  return res.paginated(data, { page, perPage, total }, 'Usuarios listados');
};

/* POST /api/usuarios */
export const crearUsuario = async (req, res) => {
  const usuario = await usuarioService.create(req.body);
  return res.created(usuario, 'Usuario creado');
};

/* GET /api/usuarios/:id */
export const obtenerUsuarioPorId = async (req, res) => {
  const usuario = await usuarioService.getById(req.params.id);
  return res.ok(usuario);
};

/* PUT /api/usuarios/:id */
export const editarUsuario = async (req, res) => {
  const usuario = await usuarioService.update(req.params.id, req.body);
  return res.ok(usuario, 'Usuario actualizado');
};

/* DELETE /api/usuarios/:id */
export const eliminarUsuario = async (req, res) => {
  await usuarioService.remove(req.params.id);
  return res.ok(null, 'Usuario eliminado');
};

/* POST /api/usuarios/login */
export const login = async (req, res) => {
  const token = await usuarioService.login(req.body);
  return res.ok({ token }, 'Login exitoso');
};

/* POST /api/usuarios/forgot-password */
export const forgotPassword = (_req, res) =>
  res.ok(null, 'Endpoint pendiente');

/* POST /api/usuarios/reset-password/:token */
export const resetPassword = (_req, res) =>
  res.ok(null, 'Endpoint pendiente');

export default {
  obtenerUsuarios,
  crearUsuario,
  obtenerUsuarioPorId,
  editarUsuario,
  eliminarUsuario,
  login,
  forgotPassword,
  resetPassword,
};
