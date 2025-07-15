// odontologoEspecialidad.js (pivot)
export default (sequelize, DataTypes) =>
  sequelize.define('OdontologoEspecialidad', {}, {
    tableName: 'odontologo_especialidad',
    timestamps: false,
  });
