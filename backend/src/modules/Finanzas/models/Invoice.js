export default (sequelize, DataTypes) => {
  const Invoice = sequelize.define('Invoice', {
    numero: { 
      type: DataTypes.STRING 
    },
    total: { 
      type: DataTypes.DECIMAL(10, 2), 
      allowNull: false 
    },
    estado: { 
      type: DataTypes.ENUM('ENVIADO', 'PENDIENTE_PAGO', 'PAGADO', 'ANULADO'),
      defaultValue: 'ENVIADO'
    },
    patientName: { 
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Nombre del paciente si no está registrado en la base de datos'
    },
    metodoPago: { 
      type: DataTypes.STRING 
    },
    observaciones: { 
      type: DataTypes.TEXT 
    },
    fechaPago: { 
      type: DataTypes.DATE 
    },

    // ✅ CORRECCIÓN CRÍTICA: Definimos explícitamente las Foreign Keys
    // Esto obliga a Sequelize a reconocer y guardar estas columnas
    usuarioId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    odontologoId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    patientId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    budgetId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, { 
    tableName: 'facturas',
    paranoid: true // Soft delete
  });

  Invoice.associate = (models) => {
    // 1. Relación con Paciente
    Invoice.belongsTo(models.Paciente, { 
      foreignKey: 'patientId', 
      as: 'paciente' 
    });

    // 2. Relación con Odontólogo
    Invoice.belongsTo(models.Odontologo, { 
      foreignKey: 'odontologoId', 
      as: 'odontologo' 
    });

    // 3. Relación con Usuario Creador
    Invoice.belongsTo(models.Usuario, { 
      foreignKey: 'usuarioId', 
      as: 'Usuario' // Mantén 'Usuario' con mayúscula si así lo usas en el front
    });

    // 4. Relación con Items
    Invoice.hasMany(models.InvoiceItem, { 
      foreignKey: 'invoiceId', 
      as: 'items' 
    });
    
    // 5. Relación con Presupuesto
    if (models.Budget) {
        Invoice.belongsTo(models.Budget, { 
          foreignKey: 'budgetId', 
          as: 'presupuesto' 
        });
    }
  };

  return Invoice;
};