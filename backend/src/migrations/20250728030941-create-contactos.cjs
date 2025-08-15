'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contactos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      pacienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pacientes',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      email: {
        type: Sequelize.STRING,
        validate: { isEmail: true },
      },
      telefonoMovil: {
        type: Sequelize.STRING,
      },
      telefonoFijo: {
        type: Sequelize.STRING,
      },
      preferenciaContacto: {
        type: Sequelize.ENUM('whatsapp', 'email'),
        defaultValue: 'email',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW'),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contactos');
  },
};
