// backend/src/modules/Usuarios/repositories/usuarioRepository.js
import { Usuario, Rol } from '../models/index.js';

export const findPaginated = (page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  return Usuario.findAndCountAll({
    offset,
    limit: perPage,
    order: [['createdAt', 'DESC']],
  });
};

export const findById = (id, options = {}) =>
  Usuario.findByPk(id, options);

export const findByEmail = (email, { includeRole = false } = {}) => {
  const options = {
    where: { email },
    attributes: { include: ['password'] },
    paranoid: false, // por si usás soft deletes
  };

  if (includeRole) {
    options.include = [{ model: Rol, as: 'Rol' }];
  }

  return Usuario.scope(null).findOne(options);
};

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
