// backend/src/modules/Clinica/models/direccion.js
export default (sequelize, DataTypes) => {
  return sequelize.define('Direccion', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    calle: {
      type: DataTypes.STRING,
    },
    numero: {
      type: DataTypes.STRING,
    },
    detalle: {
      type: DataTypes.STRING,
    },
    codigoPostal: {
      type: DataTypes.STRING,
    },
    ciudad: {
      type: DataTypes.STRING,
    },
    provincia: {
      type: DataTypes.STRING,
    },
    pais: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'direcciones',
    timestamps: true,
    paranoid: true,
  });
};
