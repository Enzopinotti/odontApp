export default (sequelize, DataTypes) => {
  const Medicamento = sequelize.define(
    "Medicamento",
    {
      medicamentoId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // Datos del medicamento
      nombreGenerico: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      presentacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      formaFarmaceutica: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      dosis: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "medicamentos",
      timestamps: false,
    }
  );

  Medicamento.associate = (models) => {
    Medicamento.hasMany(models.MedicamentoRecetado, {
      foreignKey: "medicamentoId",
      as: "usosRecetados",
    });
  };

  return Medicamento;
};
