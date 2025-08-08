export default (sequelize, DataTypes) => {
  return sequelize.define(
    "MedicamentoRecetado",
    {
      medicamentoId: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        references: { 
          model: "Medicamentos",
          key: "id",
        }
      },
      recetaId: {
        type: DataTypes.UUID,
        primaryKey: true,
        references:{
          model: "Recetas",
          key: "id",
        },
        allowNull: false,
      }
    
    },{tableName: "medicamentos_recetados", timestamps: true, freezeTableName: true}
  );
  //asociaciones
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
}
