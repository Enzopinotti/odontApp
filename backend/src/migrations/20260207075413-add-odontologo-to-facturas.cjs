'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregamos la columna 'usuarioId' para auditoría (quién creó la orden)
    await queryInterface.addColumn('facturas', 'usuarioId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'usuarios', // Asegúrate que tu tabla se llame 'usuarios'
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', 
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('facturas', 'usuarioId');
  }
};