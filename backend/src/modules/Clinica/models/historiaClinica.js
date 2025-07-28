// backend/src/modules/Clinica/models/historiaClinica.js

export default (sequelize, DataTypes) => {
  return sequelize.define('HistoriaClinica', {
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    motivoConsulta: {
      type: DataTypes.STRING,
    },
    diagnostico: {
      type: DataTypes.STRING,
    },
    evolucion: {
      type: DataTypes.TEXT,
    },
    observaciones: {
      type: DataTypes.TEXT,
    },
  }, {
    tableName: 'historias_clinicas',
    timestamps: true,
    paranoid: true,
  });
};
