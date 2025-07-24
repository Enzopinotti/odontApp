export default (sequelize, DataTypes) => {
  const MedicamentoRecetado = sequelize.define(
    "MedicamentoRecetado",
    {
      medicamentoRecetadoId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      // Clave externa de la receta
      recetaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Datos del medicamento
      nombreGenerico: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      nombreComercial: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      presentacion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cantidadUnidades: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      dosis: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      frecuencia: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duracionTratamiento: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "medicamentos_recetados",
      timestamps: false,
    }
  );
  MedicamentoRecetado.associate = (models) => {
    MedicamentoRecetado.belongsTo(models.Receta, {
      foreignKey: "recetaId",
      as: "receta",
    });
  };

  return MedicamentoRecetado;
};
