// backend/src/modules/Clinica/models/diente.js
import { ESTADOS_DIENTE } from './enums/estadoDiente.js';

export default (sequelize, DataTypes) => {
  return sequelize.define('Diente', {
    estadoDiente: {
      type: DataTypes.ENUM(...ESTADOS_DIENTE),
      defaultValue: 'Sano',
    },
    notas: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'dientes',
    timestamps: true,
    paranoid: true,
  });
};
