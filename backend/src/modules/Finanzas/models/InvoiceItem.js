export default (sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define('InvoiceItem', {
    cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },
    precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2) }
  }, { tableName: 'factura_items', timestamps: false });

  InvoiceItem.associate = (models) => {
    InvoiceItem.belongsTo(models.Tratamiento, { as: 'tratamiento' });  
    InvoiceItem.belongsTo(models.Invoice, { foreignKey: 'invoiceId' });
  };

  return InvoiceItem;
};