'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Crear tabla estados_pacientes
        await queryInterface.createTable('estados_pacientes', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            nombre: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
            },
            color: {
                type: Sequelize.STRING,
                defaultValue: '#3b82f6',
            },
            orden: {
                type: Sequelize.INTEGER,
                defaultValue: 0,
            },
            descripcion: {
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
        });

        // 2. Limpiar columna 'estado' ENUM si existe (de la migración anterior fallida/abortada)
        try {
            await queryInterface.removeColumn('pacientes', 'estado');
        } catch (e) {
            console.log('Columna estado no existía o ya fue borrada.');
        }

        // 3. Agregar columna estadoId a pacientes
        await queryInterface.addColumn('pacientes', 'estadoId', {
            type: Sequelize.INTEGER,
            references: {
                model: 'estados_pacientes',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
            allowNull: true,
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('pacientes', 'estadoId');
        await queryInterface.dropTable('estados_pacientes');
    },
};
