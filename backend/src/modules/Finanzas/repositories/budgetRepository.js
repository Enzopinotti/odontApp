import { Budget, BudgetItem } from '../models/index.js';
import { Tratamiento, Paciente } from '../../Clinica/models/index.js';
// Importamos Odontologo
import { Usuario, Odontologo } from '../../Usuarios/models/index.js';

export const create = (data, items) => {
  return Budget.create({ 
      ...data, 
      items 
  }, {
    include: [{ model: BudgetItem, as: 'items' }]
  });
};

export const findById = (id) => {
  return Budget.findByPk(id, {
    include: [
      { 
        model: Paciente, 
        as: 'Paciente' // Ajustar Alias según associations.js
      },
      { 
        // 🔄 CAMBIO CLAVE: Estructura anidada
        model: Odontologo, 
        as: 'Odontologo', 
        include: [{
            model: Usuario,
            as: 'Usuario',
            attributes: ['id', 'nombre', 'apellido']
        }]
      },
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
    include: [
        { model: BudgetItem, as: 'items' },
        // Opcional: Si quieres mostrar quién hizo cada presupuesto en la lista
        { 
            model: Odontologo, 
            as: 'Odontologo',
            include: [{ model: Usuario, as: 'Usuario', attributes: ['apellido'] }]
        }
    ]
  });
};

export default { create, findById, findByPatient };