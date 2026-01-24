'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('turnos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      fechaHora: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      duracion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      motivo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      estado: {
        type: Sequelize.ENUM('PENDIENTE', 'ASISTIO', 'AUSENTE', 'CANCELADO'),
        allowNull: false,
        defaultValue: 'PENDIENTE',
      },
      pacienteId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'pacientes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      odontologoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'odontologos',
          key: 'userId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      recepcionistaId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    // Crear índices
    await queryInterface.addIndex('turnos', ['fechaHora', 'odontologoId'], {
      name: 'idx_turnos_fecha_odontologo'
    });
    
    await queryInterface.addIndex('turnos', ['estado'], {
      name: 'idx_turnos_estado'
    });
    
    await queryInterface.addIndex('turnos', ['pacienteId'], {
      name: 'idx_turnos_paciente'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('turnos');
  }
};
