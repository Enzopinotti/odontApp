'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('facturas', 'patientName', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Nombre del paciente eventual (si no está registrado)'
    });
    
    // Permitir que patientId sea NULL (para pacientes manuales)
    await queryInterface.changeColumn('facturas', 'patientId', {
      type: Sequelize.INTEGER,
      allowNull: true, 
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('facturas', 'patientName');
    // Nota: Revertir allowNull a false puede fallar si ya hay datos nulos
  }
};