'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('odontogramas', {
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
      fechaCreacion: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      observaciones: {
        type: Sequelize.TEXT,
      },
      estadoGeneral: {
        type: Sequelize.ENUM('Sano', 'Observacion', 'Tratado'),
        defaultValue: 'Sano',
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
    await queryInterface.dropTable('odontogramas');
  },
};
