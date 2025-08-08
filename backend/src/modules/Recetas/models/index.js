import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';
import { applyAssociations } from './associations.js';

import recetaModel from './Receta.js';
import medicamentoModel from './Medicamento.js';
import medicamentoRecetadoModel from './MedicamentoRecetado.js';

import { Paciente } from '../../Clinica/models/index.js';
import { Odontologo } from '../../Usuarios/models/index.js';

// Inicializar modelos propios del módulo Recetas
const Receta = recetaModel(sequelize, DataTypes);
const Medicamento = medicamentoModel(sequelize, DataTypes);
const MedicamentoRecetado = medicamentoRecetadoModel(sequelize, DataTypes);

// Aplicar asociaciones
applyAssociations({ Receta, Medicamento, MedicamentoRecetado, Paciente, Odontologo });

// Exportar
export {
  Receta,
  Medicamento,
  MedicamentoRecetado,
  Paciente,
  Odontologo,
};
