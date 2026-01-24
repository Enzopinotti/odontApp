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
    ultimaVisita: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    estadoId: {
      type: DataTypes.INTEGER,
      allowNull: true, // Permitir null temporalmente para migración, luego se puede poner false
    },
  }, {
    tableName: 'pacientes',
    timestamps: true,
    paranoid: true,
  });
};
