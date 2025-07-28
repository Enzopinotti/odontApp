'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('antecedentes_medicos', {
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
      tipoAntecedente: {
        type: Sequelize.ENUM(
          'Alergia',
          'Medicamento',
          'Enfermedad_Cronica',
          'Cirugia',
          'Otro'
        ),
        allowNull: false,
      },
      descripcion: {
        type: Sequelize.STRING,
      },
      fechaRegistro: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      activo: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable('antecedentes_medicos');
  },
};
