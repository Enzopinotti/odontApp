// backend/src/modules/Clinica/models/contacto.js
import { PREFERENCIAS_CONTACTO } from './enums/preferenciaContacto.js';

export default (sequelize, DataTypes) => {
  return sequelize.define('Contacto', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      validate: { isEmail: true },
    },
    telefonoMovil: {
      type: DataTypes.STRING,
    },
    telefonoFijo: {
      type: DataTypes.STRING,
    },
    preferenciaContacto: {
      type: DataTypes.ENUM(...PREFERENCIAS_CONTACTO),
      defaultValue: 'email',
    },
  }, {
    tableName: 'contactos',
    timestamps: true,
    paranoid: true,
  });
};
