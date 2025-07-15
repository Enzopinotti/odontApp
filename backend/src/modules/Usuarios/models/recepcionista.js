// recepcionista.js
export default (sequelize, DataTypes) =>
  sequelize.define('Recepcionista', {
    userId: { type: DataTypes.INTEGER, primaryKey: true },
  }, { tableName: 'recepcionistas', timestamps: false });
