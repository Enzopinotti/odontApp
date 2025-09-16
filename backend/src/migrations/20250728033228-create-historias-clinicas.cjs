'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('historias_clinicas', {
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
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      motivoConsulta: {
        type: Sequelize.STRING,
      },
      diagnostico: {
        type: Sequelize.STRING,
      },
      evolucion: {
        type: Sequelize.TEXT,
      },
      observaciones: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable('historias_clinicas');
  },
};
