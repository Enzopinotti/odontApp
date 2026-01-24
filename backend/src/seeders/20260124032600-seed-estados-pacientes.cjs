'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('estados_pacientes', [
            {
                nombre: 'ACTIVO',
                color: '#22c55e', // Verde
                orden: 1,
                descripcion: 'Paciente en curso normal',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                nombre: 'EN_TRATAMIENTO',
                color: '#3b82f6', // Azul
                orden: 2,
                descripcion: 'Paciente con tratamientos activos',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                nombre: 'DEUDOR',
                color: '#f59e0b', // Ámbar/Naranja
                orden: 3,
                descripcion: 'Paciente con saldo pendiente',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                nombre: 'INACTIVO',
                color: '#9ca3af', // Gris
                orden: 4,
                descripcion: 'Paciente que no asiste hace tiempo',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                nombre: 'URGENCIA',
                color: '#ef4444', // Rojo
                orden: 0,
                descripcion: 'Paciente requiere atención inmediata',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('estados_pacientes', null, {});
    },
};
