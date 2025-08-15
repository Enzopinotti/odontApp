// backend/src/modules/Clinica/models/imagenClinica.js
import { TIPOS_IMAGEN } from './enums/tipoImagen.js';

export default (sequelize, DataTypes) => {
  return sequelize.define('ImagenClinica', {
    url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tipoImagen: {
      type: DataTypes.ENUM(...TIPOS_IMAGEN),
      allowNull: false,
    },
    fechaCarga: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
  }, {
    tableName: 'imagenes_clinicas',
    timestamps: true,
    paranoid: true,
  });
};
