import { Nota, Turno, Usuario } from '../models/index.js';
import { Op } from 'sequelize';

export const findPaginated = (page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  return Nota.findAndCountAll({
    offset,
    limit: perPage,
    include: [
      { model: Turno, as: 'Turno' },
      { model: Usuario, as: 'Usuario' }
    ],
    order: [['createdAt', 'DESC']],
  });
};

export const findById = (id, options = {}) => {
  const defaultOptions = {
    include: [
      { model: Turno, as: 'Turno' },
      { model: Usuario, as: 'Usuario' }
    ]
  };
  
  return Nota.findByPk(id, { ...defaultOptions, ...options });
};

export const create = (data) => Nota.create(data);

export const update = (instancia, data) => instancia.update(data);

export const remove = (instancia) => instancia.destroy();

export const findFiltered = (filtros = {}, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  const where = {};

  // Filtro por turno
  if (filtros.turnoId) {
    where.turnoId = filtros.turnoId;
  }

  // Filtro por usuario
  if (filtros.usuarioId) {
    where.usuarioId = filtros.usuarioId;
  }

  // Filtro por descripción
  if (filtros.descripcion) {
    where.descripcion = { [Op.like]: `%${filtros.descripcion}%` };
  }

  // Filtro por fecha de creación
  if (filtros.fechaInicio && filtros.fechaFin) {
    where.createdAt = {
      [Op.between]: [new Date(filtros.fechaInicio), new Date(filtros.fechaFin)]
    };
  }

  return Nota.findAndCountAll({
    where,
    offset,
    limit: perPage,
    include: [
      { model: Turno, as: 'Turno' },
      { model: Usuario, as: 'Usuario' }
    ],
    order: [['createdAt', 'DESC']],
  });
};

export const obtenerNotasPorTurno = (turnoId) => {
  return Nota.findAll({
    where: { turnoId },
    include: [
      { model: Usuario, as: 'Usuario' }
    ],
    order: [['createdAt', 'DESC']]
  });
};

export const obtenerNotasRecientes = (limite = 10) => {
  return Nota.findAll({
    include: [
      { model: Usuario, as: 'Usuario' },
      { model: Turno, as: 'Turno' }
    ],
    order: [['createdAt', 'DESC']],
    limit: limite
  });
};

export const obtenerNotasPorUsuario = (usuarioId, limite = 20) => {
  return Nota.findAll({
    where: { usuarioId },
    include: [
      { model: Turno, as: 'Turno' }
    ],
    order: [['createdAt', 'DESC']],
    limit: limite
  });
};
