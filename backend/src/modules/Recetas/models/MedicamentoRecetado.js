export default (sequelize, DataTypes) => {
  const MedicamentoRecetado = sequelize.define(
    "MedicamentoRecetado",
    {
      medicamentoRecetadoId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      recetaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      medicamentoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Datos dinámicos de la receta
  
      indicaciones: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: "medicamentos_recetados",
      timestamps: false,
    }
  );

  MedicamentoRecetado.associate = (models) => {
    MedicamentoRecetado.belongsTo(models.Medicamento, {
      foreignKey: "medicamentoId",
      as: "medicamento",
    });

    MedicamentoRecetado.belongsTo(models.Receta, {
      foreignKey: "recetaId",
      as: "receta",
    });
  };

  return MedicamentoRecetado;
};
