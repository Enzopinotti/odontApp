import { Budget, BudgetItem } from '../models/index.js';
import { Tratamiento, Paciente } from '../../Clinica/models/index.js';
import { Usuario } from '../../Usuarios/models/index.js';

export const create = (data, items) => {
  return Budget.create({ ...data, items }, {
    include: [{ model: BudgetItem, as: 'items' }]
  });
};

export const findById = (id) => {
  return Budget.findByPk(id, {
    include: [
      { model: Paciente, as: 'paciente' },
      { model: Usuario, as: 'odontologo', attributes: ['id', 'nombre', 'apellido'] },
      { 
        model: BudgetItem, 
        as: 'items',
        include: [{ model: Tratamiento, as: 'tratamiento' }]
      }
    ]
  });
};

export const findByPatient = (patientId) => {
  return Budget.findAll({
    where: { patientId },
    order: [['createdAt', 'DESC']],
    include: [{ model: BudgetItem, as: 'items' }]
  });
};

export default { create, findById, findByPatient };