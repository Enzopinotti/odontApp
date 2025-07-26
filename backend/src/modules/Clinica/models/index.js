import { sequelize } from '../../../../config/db.js';
import { DataTypes } from 'sequelize';

import pacienteModel from './Paciente.js';
const Paciente = pacienteModel(sequelize, DataTypes);
export { Paciente };
