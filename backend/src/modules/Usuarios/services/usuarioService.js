import * as repo from '../repositories/usuarioRepository.js';
import ApiError from '../../../utils/ApiError.js';

export const getPaginated = async (page, perPage) => {
  const { rows, count } = await repo.findPaginated(page, perPage);
  return { data: rows, total: count };
};

export const getById = async (id) => {
  const usuario = await repo.findById(id);
  if (!usuario) {
    throw new ApiError('Usuario no encontrado', 404, null, 'USUARIO_INEXISTENTE');
  }
  return usuario;
};

export const create = async (data) => {
  if (await repo.findByEmail(data.email)) {
    throw new ApiError('El correo ya está en uso', 409, null, 'EMAIL_DUPLICADO');
  }
  return repo.create(data);
};

export const update = async (id, data) => {
  const usuario = await getById(id); // ya lanza ApiError si no existe
  return repo.update(usuario, data);
};

export const remove = async (id, motivo) => {
  const usuario = await getById(id); // ya lanza ApiError si no existe
  await repo.remove(usuario, motivo);
};

export const toggleActive = async (id) => {
  const usuario = await getById(id);
  return repo.toggleActive(usuario);
};

export const buscarConFiltros = async (filtros, page, perPage) => {
  const { rows, count } = await repo.findFiltered(filtros, page, perPage);
  return { data: rows, total: count };
};