'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('medicamentos', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      nombreGenerico: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      formaFarmaceutica: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      dosis: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      presentacion: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('medicamentos');
  },
};
