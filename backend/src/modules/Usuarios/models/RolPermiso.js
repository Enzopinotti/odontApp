// rolPermiso.js (pivot)
export default (sequelize, DataTypes) =>
  sequelize.define('RolPermiso', {}, {
    tableName: 'rol_permisos',
    timestamps: false,
  });
