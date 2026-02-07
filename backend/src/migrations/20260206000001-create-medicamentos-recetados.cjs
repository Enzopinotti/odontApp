'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('medicamentos_recetados', {
            medicamentoId: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'medicamentos',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
            },
            recetaId: {
                type: Sequelize.UUID,
                primaryKey: true,
                allowNull: false,
                references: {
                    model: 'recetas',
                    key: 'id',
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
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
        await queryInterface.dropTable('medicamentos_recetados');
    },
};
