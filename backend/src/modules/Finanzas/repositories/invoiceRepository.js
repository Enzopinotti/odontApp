import { Invoice, InvoiceItem } from '../models/index.js';
import { Op } from 'sequelize';

// 👇 IMPORTACIONES EXTERNAS CORREGIDAS
import { Usuario } from '../../Usuarios/models/index.js'; 
import { Tratamiento, Paciente } from '../../Clinica/models/index.js';

export const create = async (data, items) => {
  return Invoice.create({
    ...data,
    items
  }, {
    include: [{ model: InvoiceItem, as: 'items' }]
  });
};

export const findById = (id) => {
  return Invoice.findByPk(id, {
    include: [
      { 
        model: Paciente, 
        as: 'paciente',
        attributes: ['id', 'nombre', 'apellido', 'dni'] // Traemos datos útiles
      },
      { 
        model: Usuario, 
        as: 'odontologo',
        attributes: ['id', 'nombre', 'apellido']
      },
      { 
        model: InvoiceItem, 
        as: 'items',
        include: [{ 
          model: Tratamiento, 
          as: 'tratamiento',
          attributes: ['nombre', 'precio'] 
        }]
      }
    ]
  });
};

export const findPaginated = (filtros = {}, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  const where = {};

  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.patientId) where.patientId = filtros.patientId;
  if (filtros.odontologoId) where.odontologoId = filtros.odontologoId;

  return Invoice.findAndCountAll({
    where,
    offset,
    limit: perPage,
    order: [['createdAt', 'DESC']],
    include: [
      { model: Paciente, as: 'paciente', attributes: ['id', 'nombre', 'apellido', 'dni'] },
      { model: Usuario, as: 'odontologo', attributes: ['id', 'nombre', 'apellido'] }
    ]
  });
};

export const update = (instancia, data) => instancia.update(data);

export default { create, findById, findPaginated, update };