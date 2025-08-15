// backend/src/modules/Clinica/models/caraTratada.js
import { TIPOS_TRAZO } from './enums/tipoTrazo.js';
import { ESTADOS_CARA } from './enums/estadoCara.js';

export default (sequelize, DataTypes) => {
  return sequelize.define('CaraTratada', {
    simbolo: {
      type: DataTypes.STRING,
    },
    tipoTrazo: {
      type: DataTypes.ENUM(...TIPOS_TRAZO),
    },
    colorEstado: {
      type: DataTypes.INTEGER, // Hex RGB puede guardarse como entero
    },
    estadoCara: {
      type: DataTypes.ENUM(...ESTADOS_CARA),
      defaultValue: 'Sano',
    },
  }, {
    tableName: 'caras_tratadas',
    timestamps: true,
    paranoid: true,
  });
};
