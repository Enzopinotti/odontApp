export default (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    numero: { type: DataTypes.STRING },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    estado: { 
      type: DataTypes.ENUM('PENDIENTE_PAGO', 'PAGADO', 'ANULADO'),
      defaultValue: 'PENDIENTE_PAGO'
    },
    metodoPago: { type: DataTypes.STRING },
    observaciones: { type: DataTypes.TEXT },
    fechaPago: { type: DataTypes.DATE }
  }, { 
    tableName: 'facturas',
    paranoid: true 
  });

  Invoice.associate = (models) => {
    // 👇 Verificar nombres aquí también
    Invoice.belongsTo(models.Paciente, { foreignKey: 'patientId', as: 'paciente' });
    Invoice.belongsTo(models.Usuario, { foreignKey: 'odontologoId', as: 'odontologo' });
    Invoice.hasMany(models.InvoiceItem, { foreignKey: 'invoiceId', as: 'items' });
    
    // Opcional: Relación con Presupuesto
    if (models.Budget) {
        Invoice.belongsTo(models.Budget, { foreignKey: 'budgetId', as: 'presupuesto' });
    }
  };

  return Invoice;
};