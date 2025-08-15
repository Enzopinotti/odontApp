// CRUD del CATÁLOGO de tratamientos (no referencia diente/odontograma)
import { Tratamiento } from '../models/index.js';

export const obtenerTodos = () =>
  Tratamiento.findAll({ order: [['createdAt', 'DESC']] });

export const crear = (data) => Tratamiento.create(data);

export const actualizar = async (id, data) => {
  const inst = await Tratamiento.findByPk(id);
  if (!inst) return null;
  await inst.update(data);
  return inst;
};

export const eliminar = async (id) => {
  const inst = await Tratamiento.findByPk(id);
  if (!inst) return false;
  await inst.destroy();
  return true;
};

export default { obtenerTodos, crear, actualizar, eliminar };
