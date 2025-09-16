// backend/src/modules/Clinica/models/odontograma.js
import { ESTADOS_ODONTOGRAMA } from './enums/estadoOdontograma.js';

export default (sequelize, DataTypes) => {
  return sequelize.define('Odontograma', {
    fechaCreacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
    estadoGeneral: {
      type: DataTypes.ENUM(...ESTADOS_ODONTOGRAMA),
      defaultValue: 'Sano',
    },
  }, {
    tableName: 'odontogramas',
    timestamps: true,
    paranoid: true,
  });
};
