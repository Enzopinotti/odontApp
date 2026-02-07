'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('recetas', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false,
            },
            fecha: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.NOW,
            },
            indicaciones: {
                type: Sequelize.TEXT,
                allowNull: true,
            },
            diagnostico: {
                type: Sequelize.TEXT,
                allowNull: false,
            },
            pacienteId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'pacientes',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            odontologoId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'odontologos',
                    key: 'userId',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            firmaOdontologo: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('recetas');
    },
};
