// backend/src/modules/Usuarios/repositories/usuarioRepository.js
import { Usuario } from '../models/index.js';

export const findPaginated = (page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  return Usuario.findAndCountAll({
    offset,
    limit: perPage,
    order: [['createdAt', 'DESC']],
  });
};

export const findById = (id) => Usuario.findByPk(id);

export const findByEmail = (email) => Usuario.findOne({ where: { email } });

export const create = (data) => Usuario.create(data);

export const update = (instancia, data) => instancia.update(data);

export const remove = (instancia) => instancia.destroy();
export default {
  findPaginated,
  findById,
  findByEmail,
  create,
  update,
  remove,
};