// backend/src/modules/Usuarios/repositories/odontologoRepository.js
import { Odontologo, Especialidad, Usuario } from "../models/index.js";
import { Op } from "sequelize";

/**
 * Traer todos los odontólogos con sus usuarios y especialidades
 */
export const findAll = () => {
  return Odontologo.findAll({
    attributes: ["userId", "matricula", "firmaDigital"],
    include: [
      {
        model: Usuario,
        attributes: ["nombre", "apellido", "email"],
      },
      {
        model: Especialidad,
        through: { attributes: [] },
      },
    ],
    order: [["userId", "ASC"]],
  });
};

/**
 * Buscar odontólogo por ID
 */
export const findById = (id, options = {}) =>
  Odontologo.findByPk(id, {
    attributes: ["userId", "matricula", "firmaDigital"],
    include: [
      {
        model: Usuario,
        attributes: ["nombre", "apellido", "email"],
      },
      {
        model: Especialidad,
        through: { attributes: [] },
      },
    ],
    ...options,
  });

/**
 * Buscar odontólogos con filtros y paginación
 */
export const findFiltered = (filtros = {}, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;

  const usuarioWhere = {};
  const especialidadWhere = {};
  const odontologoWhere = {};

  if (filtros.q) {
    usuarioWhere[Op.or] = [
      { nombre: { [Op.like]: `%${filtros.q}%` } },
      { apellido: { [Op.like]: `%${filtros.q}%` } },
      { email: { [Op.like]: `%${filtros.q}%` } },
    ];
  }

  if (filtros.matricula) {
    odontologoWhere.matricula = { [Op.like]: `%${filtros.matricula}%` };
  }

  if (filtros.especialidadId) {
    especialidadWhere.id = filtros.especialidadId;
  }

  if (filtros.activo !== undefined) {
    usuarioWhere.activo = filtros.activo === "true";
  }

  return Odontologo.findAndCountAll({
    where: odontologoWhere,
    attributes: ["userId", "matricula", "firmaDigital"],
    include: [
      {
        model: Usuario,
        attributes: ["nombre", "apellido", "email", "activo"],
        ...(Object.keys(usuarioWhere).length ? { where: usuarioWhere } : {}),
      },
      {
        model: Especialidad,
        ...(Object.keys(especialidadWhere).length
          ? { where: especialidadWhere }
          : {}),
        through: { attributes: [] },
      },
    ],
    offset,
    limit: perPage,
    order: [["userId", "ASC"]],
    distinct: true,
  });
};
