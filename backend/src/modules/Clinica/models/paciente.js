// backend/src/modules/Clinica/models/paciente.js
export default (sequelize, DataTypes) => {
  return sequelize.define('Paciente', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dni: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    obraSocial: {
      type: DataTypes.STRING,
    },
    nroAfiliado: {
      type: DataTypes.STRING,
    },
  }, {
    tableName: 'pacientes',
    timestamps: true,
    paranoid: true,
  });
};
