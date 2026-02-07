'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /* 1. Arreglar tabla factura_items */
    const tableInfoInvoice = await queryInterface.describeTable('factura_items');
    
    // Si no existe treatmentId, la creamos
    if (!tableInfoInvoice.treatmentId) {
        await queryInterface.addColumn('factura_items', 'treatmentId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'tratamientos',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    }

    // Si existe la columna errónea 'tratamientoId', la borramos
    if (tableInfoInvoice.tratamientoId) {
        await queryInterface.removeColumn('factura_items', 'tratamientoId');
    }

    /* 2. Arreglar tabla presupuesto_items */
    const tableInfoBudget = await queryInterface.describeTable('presupuesto_items');

    if (!tableInfoBudget.treatmentId) {
        await queryInterface.addColumn('presupuesto_items', 'treatmentId', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'tratamientos',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE',
        });
    }
    
    if (tableInfoBudget.tratamientoId) {
        await queryInterface.removeColumn('presupuesto_items', 'tratamientoId');
    }
  },

  async down (queryInterface, Sequelize) {
    // Revertir cambios (Borrar la columna nueva)
    const tableInfoInvoice = await queryInterface.describeTable('factura_items');
    if (tableInfoInvoice.treatmentId) {
        await queryInterface.removeColumn('factura_items', 'treatmentId');
    }

    const tableInfoBudget = await queryInterface.describeTable('presupuesto_items');
    if (tableInfoBudget.treatmentId) {
        await queryInterface.removeColumn('presupuesto_items', 'treatmentId');
    }
  }
};