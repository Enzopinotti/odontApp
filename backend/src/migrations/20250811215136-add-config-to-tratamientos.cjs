'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tratamientos', 'config', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Metadatos clínicos: alcance, caras por defecto, color, trazo, sigla, preventivo, etc.'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tratamientos', 'config');
  }
};
