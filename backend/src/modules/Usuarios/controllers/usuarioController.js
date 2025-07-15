// backend/src/modules/Usuarios/controllers/usuarioController.js
import * as usuarioService from '../services/usuarioService.js';

/* GET /api/usuarios */
export const obtenerUsuarios = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const { data, total } = await usuarioService.getPaginated(page, perPage);

    return res.paginated(data, { page, perPage, total }, 'Usuarios listados');
  } catch (e) {
    return res.fail(e, e.status || 500);
  }
};

/* POST /api/usuarios */
export const crearUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.create(req.body);
    return res.created(usuario, 'Usuario creado');
  } catch (e) {
    return res.fail(e, e.status || 400);
  }
};

/* GET /api/usuarios/:id */
export const obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await usuarioService.getById(req.params.id);
    return res.ok(usuario);
  } catch (e) {
    return res.fail(e, e.status || 404);
  }
};

/* PUT /api/usuarios/:id */
export const editarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.update(req.params.id, req.body);
    return res.ok(usuario, 'Usuario actualizado');
  } catch (e) {
    return res.fail(e, e.status || 400);
  }
};

/* DELETE /api/usuarios/:id */
export const eliminarUsuario = async (req, res) => {
  try {
    await usuarioService.remove(req.params.id);
    return res.ok(null, 'Usuario eliminado');
  } catch (e) {
    return res.fail(e, e.status || 404);
  }
};

/* POST /api/usuarios/login */
export const login = async (req, res) => {
  try {
    const token = await usuarioService.login(req.body);
    return res.ok({ token }, 'Login exitoso');
  } catch (e) {
    return res.fail(e, e.status || 401);
  }
};

/* POST /api/usuarios/forgot-password */
export const forgotPassword = (req, res) => res.ok(null, 'Endpoint pendiente');

/* POST /api/usuarios/reset-password/:token */
export const resetPassword = (req, res) => res.ok(null, 'Endpoint pendiente');

export default {
    obtenerUsuarios,
    crearUsuario,
    obtenerUsuarioPorId,
    editarUsuario,
    eliminarUsuario,
    login,
    forgotPassword,
    resetPassword
};