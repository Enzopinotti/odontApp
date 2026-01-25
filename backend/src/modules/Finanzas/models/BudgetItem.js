export default (sequelize, DataTypes) => {
  const BudgetItem = sequelize.define('BudgetItem', {
    cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },
    precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false }, // Precio congelado al momento de presupuestar
    subtotal: { type: DataTypes.DECIMAL(10, 2) }
  }, { tableName: 'presupuesto_items', timestamps: false });

BudgetItem.associate = (models) => {
  BudgetItem.belongsTo(models.Tratamiento, { as: 'tratamiento' });
  BudgetItem.belongsTo(models.Budget, { foreignKey: 'budgetId' });
};

  return BudgetItem;
};