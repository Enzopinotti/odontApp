'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('direcciones', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      contactoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'contactos',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      calle: {
        type: Sequelize.STRING,
      },
      numero: {
        type: Sequelize.STRING,
      },
      detalle: {
        type: Sequelize.STRING,
      },
      codigoPostal: {
        type: Sequelize.STRING,
      },
      ciudad: {
        type: Sequelize.STRING,
      },
      provincia: {
        type: Sequelize.STRING,
      },
      pais: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('direcciones');
  },
};
