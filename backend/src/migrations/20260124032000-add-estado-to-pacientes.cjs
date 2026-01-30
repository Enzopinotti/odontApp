'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('pacientes', 'estado', {
            type: Sequelize.ENUM('ACTIVO', 'EN_TRATAMIENTO', 'INACTIVO', 'DEUDOR'),
            allowNull: false,
            defaultValue: 'ACTIVO',
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('pacientes', 'estado');
        // Nota: El tipo ENUM puede persistir en la DB dependiendo del dialecto (MySQL).
    },
};
