import {
  Paciente,
  Contacto,
  Direccion,
  FirmaDigital,
  AntecedenteMedico,
} from '../models/index.js';
import { Op } from 'sequelize';

/* ---------- Obtener paciente por ID ---------- */
export const findById = (id) =>
  Paciente.findByPk(id, {
    include: [
      {
        model: Contacto,
        include: [Direccion],
      },
      FirmaDigital,
      AntecedenteMedico,
    ],
  });

/* ---------- Obtener todos los pacientes paginados ---------- */
export const findPaginated = (page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  return Paciente.findAndCountAll({
    offset,
    limit: perPage,
    order: [['createdAt', 'DESC']],
    include: [Contacto],
  });
};

/* ---------- Buscar pacientes por nombre, apellido o DNI ---------- */
export const search = (query, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;

  return Paciente.findAndCountAll({
    where: {
      [Op.or]: [
        { nombre:    { [Op.like]: `%${query}%` } },
        { apellido:  { [Op.like]: `%${query}%` } },
        { dni:       { [Op.like]: `%${query}%` } },
      ],
    },
    offset,
    limit: perPage,
    order: [['apellido', 'ASC']],
    include: [Contacto],
  });
};

/* ---------- Crear paciente con contacto y dirección ---------- */
export const create = async (data) => {
  const paciente = await Paciente.create(data, {
    include: [
      {
        model: Contacto,
        include: [Direccion],
      },
    ],
  });
  return paciente;
};

/* ---------- Actualizar datos del paciente ---------- */
export const update = async (paciente, data) => {
  await paciente.update(data);

  if (data.Contacto) {
    await paciente.Contacto.update(data.Contacto);
    if (data.Contacto.Direccion && paciente.Contacto.Direccion) {
      await paciente.Contacto.Direccion.update(data.Contacto.Direccion);
    }
  }

  return paciente;
};

/* ---------- Eliminar paciente (baja lógica) ---------- */
export const remove = async (paciente) => {
  await paciente.destroy(); // paranoid: true
};

export default {
  findById,
  findPaginated,
  search,
  create,
  update,
  remove,
};
