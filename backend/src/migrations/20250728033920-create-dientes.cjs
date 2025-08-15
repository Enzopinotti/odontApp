'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dientes', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      odontogramaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'odontogramas',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      estadoDiente: {
        type: Sequelize.ENUM('Sano', 'Caries', 'Tratado', 'Ausente'),
        defaultValue: 'Sano',
      },
      notas: {
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
    await queryInterface.dropTable('dientes');
  },
};
