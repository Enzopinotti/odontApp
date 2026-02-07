export default (sequelize, DataTypes) => {
  const BudgetItem = sequelize.define('BudgetItem', {
    cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },
    precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2) },
    // 👇 DEFINICIÓN EXPLÍCITA DE LA COLUMNA
    treatmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'tratamientos',
          key: 'id'
        }
      }
  }, { tableName: 'presupuesto_items', timestamps: false });

  BudgetItem.associate = (models) => {
    // 👇 USO EXPLÍCITO DE LA FOREIGN KEY
    BudgetItem.belongsTo(models.Tratamiento, { 
        foreignKey: 'treatmentId', 
        as: 'tratamiento' 
    });
    BudgetItem.belongsTo(models.Budget, { foreignKey: 'budgetId' });
  };

  return BudgetItem;
};