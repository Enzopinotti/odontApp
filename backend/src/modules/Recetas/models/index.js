import { Sequelize, DataTypes } from 'sequelize';
import { sequelize } from '../../../../config/db.js';
import applyAssociations from './associations.js';

import recetaModel from './Receta.js';
import medicamentoModel from './Medicamento.js';
import medicamentoRecetadoModel from './MedicamentoRecetado.js';
import pacienteModel from '../../Clinica/models/Paciente.js';
import odontologoModel from '../../Usuarios/models/odontologo.js'; 

// Inicializar modelos
const Receta = recetaModel(sequelize, DataTypes);
const Medicamento = medicamentoModel(sequelize, DataTypes);
const MedicamentoRecetado = medicamentoRecetadoModel(sequelize, DataTypes);
const Paciente = pacienteModel(sequelize, DataTypes);
const Odontologo = odontologoModel(sequelize, DataTypes);

// Asociaciones
applyAssociations(sequelize.models);

// Exportación individual y agrupada
export {
  sequelize,
  Receta,
  Medicamento,
  MedicamentoRecetado,
  Paciente,
  Odontologo,
};
