'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.bulkUpdate(
        'usuarios',
        { activo: false },
        { activo: null }, 
        { transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    // No revertimos el cambio para evitar inconsistencias
  },
};
