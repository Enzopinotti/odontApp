'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        // Verificar estados ya existentes
        const [existentes] = await queryInterface.sequelize.query(
            "SELECT nombre FROM estados_pacientes"
        );
        const nombresExistentes = existentes.map(e => e.nombre);

        const estados = [
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
        ];

        const estadosParaInsertar = estados.filter(e => !nombresExistentes.includes(e.nombre));

        if (estadosParaInsertar.length > 0) {
            await queryInterface.bulkInsert('estados_pacientes', estadosParaInsertar, {});
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('estados_pacientes', null, {});
    },
};
