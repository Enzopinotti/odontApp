/**
 * Inicializa los modelos del módulo Agenda y aplica sus asociaciones.
 * Se exporta cada modelo individualmente para ser reutilizado en controladores/servicios.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';
import applyAssociations from './associations.js';

/* ------- Definiciones de modelos ------- */
import turnoModel from './turno.js';
import disponibilidadModel from './disponibilidad.js';
import notaModel from './nota.js';

/* ------- Inicialización ------- */
const Turno = turnoModel(sequelize, DataTypes);
const Disponibilidad = disponibilidadModel(sequelize, DataTypes);
const Nota = notaModel(sequelize, DataTypes);

/* ------- Asociaciones ------- */
applyAssociations(sequelize.models);

/* ------- Exports ------- */
export {
  sequelize,
  Turno,
  Disponibilidad,
  Nota,
};
