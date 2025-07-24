// odontologo.js
export default (sequelize, DataTypes) =>
  sequelize.define('Odontologo', {
    userId:   { type: DataTypes.INTEGER, primaryKey: true },
    matricula:{ type: DataTypes.STRING, allowNull: false },
    nombre:   { type: DataTypes.STRING, allowNull: false },
    apellido: { type: DataTypes.STRING, allowNull: false },
    firmaDigital: {
      type:DataTypes.STRING,
      allowNull:false
    }
  }, { tableName: 'odontologos', timestamps: false });
