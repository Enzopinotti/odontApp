import { Tratamiento } from '../models/index.js';

/* ---------- Obtener todos los tratamientos ---------- */
export const findAll = () =>
  Tratamiento.findAll({
    order: [['fechaInicio', 'DESC']],
  });

/* ---------- Obtener tratamiento por ID ---------- */
export const findById = (id) =>
  Tratamiento.findByPk(id);

/* ---------- Crear nuevo tratamiento ---------- */
export const create = (data) =>
  Tratamiento.create(data);

/* ---------- Actualizar tratamiento ---------- */
export const update = (instancia, data) =>
  instancia.update(data);

/* ---------- Eliminar tratamiento ---------- */
export const remove = (instancia) =>
  instancia.destroy();

export default {
  findAll,
  findById,
  create,
  update,
  remove,
};
