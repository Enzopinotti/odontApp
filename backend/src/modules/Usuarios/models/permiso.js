// permiso.js
export default (sequelize, DataTypes) =>
  sequelize.define('Permiso', {
    recurso: { type: DataTypes.STRING, allowNull: false },
    accion:  { type: DataTypes.STRING, allowNull: false },
  }, {
    tableName: 'permisos',
    timestamps: false,
    indexes: [{ unique: true, fields: ['recurso', 'accion'] }],
  });
