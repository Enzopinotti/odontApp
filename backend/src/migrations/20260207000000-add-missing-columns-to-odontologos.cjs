'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        const tableDescription = await queryInterface.describeTable('odontologos');

        // Añadir 'nombre' si no existe
        if (!tableDescription.nombre) {
            await queryInterface.addColumn('odontologos', 'nombre', {
                type: Sequelize.STRING,
                allowNull: true, // Permitir null temporalmente para datos existentes
            });
        }

        // Añadir 'apellido' si no existe
        if (!tableDescription.apellido) {
            await queryInterface.addColumn('odontologos', 'apellido', {
                type: Sequelize.STRING,
                allowNull: true, // Permitir null temporalmente para datos existentes
            });
        }

        // Añadir 'firmaDigital' si no existe
        if (!tableDescription.firmaDigital) {
            await queryInterface.addColumn('odontologos', 'firmaDigital', {
                type: Sequelize.STRING,
                allowNull: true,
            });
        }

        // Añadir 'createdAt' si no existe
        if (!tableDescription.createdAt) {
            await queryInterface.addColumn('odontologos', 'createdAt', {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.fn('NOW'),
            });
        }

        // Añadir 'updatedAt' si no existe
        if (!tableDescription.updatedAt) {
            await queryInterface.addColumn('odontologos', 'updatedAt', {
                type: Sequelize.DATE,
                allowNull: true,
                defaultValue: Sequelize.fn('NOW'),
            });
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('odontologos', 'nombre');
        await queryInterface.removeColumn('odontologos', 'apellido');
        await queryInterface.removeColumn('odontologos', 'firmaDigital');
        await queryInterface.removeColumn('odontologos', 'createdAt');
        await queryInterface.removeColumn('odontologos', 'updatedAt');
    },
};
