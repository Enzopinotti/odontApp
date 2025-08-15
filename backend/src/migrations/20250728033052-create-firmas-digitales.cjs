'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('firmas_digitales', {
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
      fechaHora: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      imagen: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      tipoDocumento: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '1: DNI, 2: Pasaporte, etc.',
      },
      valida: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('firmas_digitales');
  },
};
