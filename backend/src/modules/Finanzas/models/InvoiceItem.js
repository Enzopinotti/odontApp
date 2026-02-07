export default (sequelize, DataTypes) => {
  const InvoiceItem = sequelize.define('InvoiceItem', {
    cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },
    precioUnitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2) },
    // 👇 DEFINICIÓN EXPLÍCITA DE LA COLUMNA
    treatmentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tratamientos', // Nombre de la tabla en la BD
        key: 'id'
      }
    }
  }, { tableName: 'factura_items', timestamps: false });

  InvoiceItem.associate = (models) => {
    // 👇 USO EXPLÍCITO DE LA FOREIGN KEY
    InvoiceItem.belongsTo(models.Tratamiento, { 
        foreignKey: 'treatmentId', 
        as: 'tratamiento' 
    });  
    InvoiceItem.belongsTo(models.Invoice, { foreignKey: 'invoiceId' });
  };

  return InvoiceItem;
};