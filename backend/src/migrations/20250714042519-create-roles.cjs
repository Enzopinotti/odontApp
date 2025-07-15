'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles', {
      id      : { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      nombre  : { type: Sequelize.STRING, allowNull: false, unique: true },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('roles');
  },
};
