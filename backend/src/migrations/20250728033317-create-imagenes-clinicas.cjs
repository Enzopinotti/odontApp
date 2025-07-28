'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('imagenes_clinicas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      historiaClinicaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'historias_clinicas',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      url: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      tipoImagen: {
        type: Sequelize.ENUM('Radiografia', 'Foto', 'Escaneo', 'Otro'),
        allowNull: false,
      },
      fechaCarga: {
        type: Sequelize.DATEONLY,
        allowNull: false,
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
    await queryInterface.dropTable('imagenes_clinicas');
  },
};
