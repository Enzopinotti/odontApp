// auditLog.js
export default (sequelize, DataTypes) =>
  sequelize.define('AuditLog', {
    recurso: { type: DataTypes.STRING, allowNull: false },
    accion:  { type: DataTypes.STRING, allowNull: false },
    ip:      DataTypes.STRING,
  }, { tableName: 'audit_logs', updatedAt: false });
