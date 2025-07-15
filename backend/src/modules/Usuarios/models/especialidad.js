// especialidad.js
export default (sequelize, DataTypes) =>
  sequelize.define('Especialidad', {
    nombre:      { type: DataTypes.STRING, allowNull: false },
    descripcion: DataTypes.STRING,
    activa:      { type: DataTypes.BOOLEAN, defaultValue: true },
  }, { tableName: 'especialidades', timestamps: false });
