/**
 * Inicializa los modelos del módulo Agenda y aplica sus asociaciones.
 * Se exporta cada modelo individualmente para ser reutilizado en controladores/servicios.
 */
import { DataTypes } from 'sequelize';
import { sequelize } from '../../../config/db.js';
import applyAssociations from './associations.js';
import applyAssociationsSafe from './associations-safe.js';

/* ------- Definiciones de modelos ------- */
import turnoModel from './turno.js';
import disponibilidadModel from './disponibilidad.js';
import notaModel from './nota.js';

/* ------- Inicialización ------- */
const Turno = turnoModel(sequelize, DataTypes);
const Disponibilidad = disponibilidadModel(sequelize, DataTypes);
const Nota = notaModel(sequelize, DataTypes);

/* ------- Asociaciones ------- */
try {
  // Intentar asociaciones completas primero
  applyAssociations(sequelize.models);
} catch (error) {
  console.log('⚠️  Usando asociaciones seguras para tests:', error.message);
  // Si falla, usar asociaciones seguras (solo modelos locales)
  applyAssociationsSafe({ Turno, Disponibilidad, Nota });
}

/* ------- Exports ------- */
export {
  sequelize,
  Turno,
  Disponibilidad,
  Nota,
};
