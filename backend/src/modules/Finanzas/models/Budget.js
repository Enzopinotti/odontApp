export default (sequelize, DataTypes) => {
  const Budget = sequelize.define('Budget', {
    total: { 
      type: DataTypes.DECIMAL(10, 2), 
      defaultValue: 0 
    },
    fecha: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW
    },
    observaciones: { 
      type: DataTypes.TEXT 
    },
    estado: {
      type: DataTypes.ENUM('BORRADOR', 'ACEPTADO', 'RECHAZADO', 'FACTURADO'),
      defaultValue: 'BORRADOR'
    }
  }, { 
    tableName: 'presupuestos',
    paranoid: true 
  });

  Budget.associate = (models) => {
    // 👇 AQUÍ ESTABA EL ERROR: Usar los nombres exactos del index.js
    
    // Relación con Paciente (models.Paciente)
    Budget.belongsTo(models.Paciente, { 
      foreignKey: 'patientId',
      as: 'paciente' 
    });

    // Relación con Odontólogo (models.Usuario)
    Budget.belongsTo(models.Usuario, { 
      foreignKey: 'odontologoId',
      as: 'odontologo' 
    });

    // Relación con Items
    Budget.hasMany(models.BudgetItem, { 
      foreignKey: 'budgetId',
      as: 'items' 
    });
  };

  return Budget;
};