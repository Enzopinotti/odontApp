// backend/src/modules/Clinica/models/antecedenteMedico.js
import { TIPOS_ANTECEDENTE } from './enums/tipoAntecedente.js';

export default (sequelize, DataTypes) => {
  return sequelize.define('AntecedenteMedico', {
    tipoAntecedente: {
      type: DataTypes.ENUM(...TIPOS_ANTECEDENTE),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.STRING,
    },
    fechaRegistro: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'antecedentes_medicos',
    timestamps: true,
    paranoid: true,
  });
};
