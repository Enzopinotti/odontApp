'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * 1. TABLA PRESUPUESTOS
     */
    await queryInterface.createTable('presupuestos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fecha: {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.NOW
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0
      },
      observaciones: {
        type: Sequelize.TEXT
      },
      estado: {
        type: Sequelize.ENUM('BORRADOR', 'ACEPTADO', 'RECHAZADO', 'FACTURADO'),
        defaultValue: 'BORRADOR'
      },
      fechaVencimiento: {
        type: Sequelize.DATEONLY
      },
      // Relaciones
      patientId: {
        type: Sequelize.INTEGER,
        references: { model: 'pacientes', key: 'id' }, // Asegúrate que tu tabla se llame 'pacientes'
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      odontologoId: {
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' }, // Asegúrate que tu tabla se llame 'usuarios'
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
      deletedAt: { type: Sequelize.DATE }
    });

    /**
     * 2. TABLA PRESUPUESTO_ITEMS
     */
    await queryInterface.createTable('presupuesto_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cantidad: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      precioUnitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2)
      },
      // FKs
      budgetId: {
        type: Sequelize.INTEGER,
        references: { model: 'presupuestos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      treatmentId: {
        type: Sequelize.INTEGER,
        references: { model: 'tratamientos', key: 'id' }, // Asegúrate que ya exista la tabla 'tratamientos'
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });

    /**
     * 3. TABLA FACTURAS
     */
    await queryInterface.createTable('facturas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      numero: {
        type: Sequelize.STRING
      },
      fechaEmision: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      estado: {
        type: Sequelize.ENUM('PENDIENTE_PAGO', 'PAGADO', 'ANULADO'),
        defaultValue: 'PENDIENTE_PAGO'
      },
      metodoPago: {
        type: Sequelize.STRING
      },
      observaciones: {
        type: Sequelize.TEXT
      },
      fechaPago: {
        type: Sequelize.DATE
      },
      // FKs
      patientId: {
        type: Sequelize.INTEGER,
        references: { model: 'pacientes', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      odontologoId: {
        type: Sequelize.INTEGER,
        references: { model: 'usuarios', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      budgetId: { // Opcional: si viene de un presupuesto
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'presupuestos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
      deletedAt: { type: Sequelize.DATE }
    });

    /**
     * 4. TABLA FACTURA_ITEMS
     */
    await queryInterface.createTable('factura_items', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      cantidad: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      precioUnitario: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2)
      },
      // FKs
      invoiceId: {
        type: Sequelize.INTEGER,
        references: { model: 'facturas', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      treatmentId: {
        type: Sequelize.INTEGER,
        references: { model: 'tratamientos', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // El orden de borrado es importante por las Foreign Keys (primero los hijos, luego los padres)
    await queryInterface.dropTable('factura_items');
    await queryInterface.dropTable('facturas');
    await queryInterface.dropTable('presupuesto_items');
    await queryInterface.dropTable('presupuestos');
  }
};