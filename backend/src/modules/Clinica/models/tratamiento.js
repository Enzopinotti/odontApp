// backend/src/modules/Clinica/models/tratamiento.js

export default (sequelize, DataTypes) => {
  return sequelize.define('Tratamiento', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    precio: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    duracionMin: {
      type: DataTypes.INTEGER,
      comment: 'Duración en minutos',
    },
  }, {
    tableName: 'tratamientos',
    timestamps: true,
    paranoid: true,
  });
};
