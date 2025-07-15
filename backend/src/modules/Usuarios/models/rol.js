// rol.js
export default (sequelize, DataTypes) =>
  sequelize.define('Rol', {
    nombre: { type: DataTypes.STRING, unique: true, allowNull: false },
  }, { tableName: 'roles', timestamps: false });
