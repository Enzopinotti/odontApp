import { Odontograma, Diente, CaraTratada } from '../models/index.js';

/* ---------- Obtener todos los odontogramas ---------- */
export const findAll = () =>
  Odontograma.findAll({
    include: [
      {
        model: Diente,
        include: [CaraTratada],
      },
    ],
    order: [['fecha', 'DESC']],
  });

/* ---------- Obtener odontograma por ID ---------- */
export const findById = (id) =>
  Odontograma.findByPk(id, {
    include: [
      {
        model: Diente,
        include: [CaraTratada],
      },
    ],
  });

/* ---------- Obtener por paciente ---------- */
export const findByPacienteId = (pacienteId) =>
  Odontograma.findAll({
    where: { pacienteId },
    include: [
      {
        model: Diente,
        include: [CaraTratada],
      },
    ],
    order: [['fecha', 'DESC']],
  });

/* ---------- Crear odontograma ---------- */
export const create = (data) =>
  Odontograma.create(data);

/* ---------- Actualizar odontograma ---------- */
export const update = (instancia, data) =>
  instancia.update(data);

/* ---------- Eliminar odontograma ---------- */
export const remove = (instancia) =>
  instancia.destroy();

export default {
  findAll,
  findById,
  findByPacienteId,
  create,
  update,
  remove,
};
