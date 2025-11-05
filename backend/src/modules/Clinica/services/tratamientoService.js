// backend/src/modules/Clinica/services/tratamientoService.js
import { Tratamiento } from '../models/index.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- Obtener todos los tratamientos ---------- */
export const obtenerTodos = () =>
  Tratamiento.findAll({ order: [['createdAt', 'DESC']] });

/* ---------- Crear tratamiento ---------- */
export const crear = async (data) => {
  return Tratamiento.create(data);
};

/* ---------- Actualizar tratamiento ---------- */
export const actualizar = async (id, data) => {
  const inst = await Tratamiento.findByPk(id);
  if (!inst) throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');
  await inst.update(data);
  return inst;
};

/* ---------- Eliminar tratamiento ---------- */
export const eliminar = async (id) => {
  const inst = await Tratamiento.findByPk(id);
  if (!inst) throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');
  await inst.destroy();
  return true;
};

export default { obtenerTodos, crear, actualizar, eliminar };
