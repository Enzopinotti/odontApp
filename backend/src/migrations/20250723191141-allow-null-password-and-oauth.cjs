'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('usuarios', 'proveedor', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('usuarios', 'oauthId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('usuarios', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.removeColumn('usuarios', 'proveedor');
    await queryInterface.removeColumn('usuarios', 'oauthId');
  },
};
