'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('disponibilidades', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      horaInicio: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      horaFin: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM('LABORAL', 'NOLABORAL'),
        allowNull: false,
        defaultValue: 'LABORAL',
      },
      motivo: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      odontologoId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'odontologos',
          key: 'userId'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
    await queryInterface.addIndex('disponibilidades', ['fecha', 'odontologoId'], {
      name: 'idx_disponibilidades_fecha_odontologo'
    });
    
    await queryInterface.addIndex('disponibilidades', ['tipo'], {
      name: 'idx_disponibilidades_tipo'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('disponibilidades');
  }
};
