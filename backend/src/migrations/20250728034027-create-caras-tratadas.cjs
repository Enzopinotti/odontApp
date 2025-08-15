'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('caras_tratadas', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      dienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dientes',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      tratamientoId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tratamientos',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
      simbolo: {
        type: Sequelize.STRING,
      },
      tipoTrazo: {
        type: Sequelize.ENUM('Continuo', 'Punteado'),
      },
      colorEstado: {
        type: Sequelize.INTEGER,
        comment: 'Código RGB o similar',
      },
      estadoCara: {
        type: Sequelize.ENUM(
          'Sano',
          'Caries',
          'Planificado',
          'En Progreso',
          'Realizado',
          'Restaurado',
          'Sello',
          'En observación',
          'Ausente'
        ),
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
    await queryInterface.dropTable('caras_tratadas');
  },
};
