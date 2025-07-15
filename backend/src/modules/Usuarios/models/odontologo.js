// odontologo.js
export default (sequelize, DataTypes) =>
  sequelize.define('Odontologo', {
    userId:   { type: DataTypes.INTEGER, primaryKey: true },
    matricula:{ type: DataTypes.STRING, allowNull: false },
  }, { tableName: 'odontologos', timestamps: false });
