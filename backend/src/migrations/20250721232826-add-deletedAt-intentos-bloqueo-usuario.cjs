'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('usuarios', 'intentosFallidos', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('usuarios', 'bloqueadoHasta', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('usuarios', 'bloqueadoHasta');
    await queryInterface.removeColumn('usuarios', 'intentosFallidos');
    await queryInterface.removeColumn('usuarios', 'deletedAt');
  },
};
