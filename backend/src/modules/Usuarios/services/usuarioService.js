// backend/src/modules/Usuarios/services/usuarioService.js
import * as repo from '../repositories/usuarioRepository.js';
import ApiError from '../../../utils/ApiError.js';

export const getPaginated = async (page, perPage) => {
  const { rows, count } = await repo.findPaginated(page, perPage);
  return { data: rows, total: count };
};

export const getById = async (id) => {
  const usuario = await repo.findById(id);
  if (!usuario) throw new ApiError('Usuario no encontrado', 404);
  return usuario;
};

export const create = async (data) => {
  if (await repo.findByEmail(data.email)) throw new ApiError('Email duplicado', 409);
  return repo.create(data);
};

export const update = async (id, data) => {
  const usuario = await getById(id);
  return repo.update(usuario, data);
};

export const remove = async (id) => {
  const usuario = await getById(id);
  await repo.remove(usuario);
};


