'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface) {
        // Verificar si ya hay disponibilidades (para no duplicar)
        const [dispsExistentes] = await queryInterface.sequelize.query(
            "SELECT id FROM disponibilidades LIMIT 1"
        );

        if (dispsExistentes.length > 0) {
            console.log('⚠️  Ya existen disponibilidades en la base de datos. Saltando seeder de prueba.');
            return;
        }

        // Obtener los IDs de los odontólogos existentes
        const [odontologos] = await queryInterface.sequelize.query(
            "SELECT userId FROM odontologos"
        );

        if (odontologos.length === 0) {
            console.log('⚠️  No hay odontólogos para asignar disponibilidades. Ejecuta primero el seeder de usuarios.');
            return;
        }

        const ahora = new Date();
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        const disponibilidades = [];

        // Generar disponibilidades para los próximos 30 días para cada odontólogo
        for (const odonto of odontologos) {
            for (let i = 0; i < 30; i++) {
                const fecha = new Date(hoy);
                fecha.setDate(hoy.getDate() + i);

                // No generar para fines de semana
                const diaSemana = fecha.getDay();
                if (diaSemana === 0 || diaSemana === 6) continue;

                // Formatear fecha como YYYY-MM-DD
                const fechaStr = fecha.toISOString().split('T')[0];

                // Bloque de mañana: 08:00 a 12:00
                disponibilidades.push({
                    fecha: fechaStr,
                    horaInicio: '08:00:00',
                    horaFin: '12:00:00',
                    tipo: 'LABORAL',
                    motivo: 'Horario mañana (PRUEBA)',
                    odontologoId: odonto.userId,
                    createdAt: ahora,
                    updatedAt: ahora
                });

                // Bloque de tarde: 14:00 a 18:00
                disponibilidades.push({
                    fecha: fechaStr,
                    horaInicio: '14:00:00',
                    horaFin: '18:00:00',
                    tipo: 'LABORAL',
                    motivo: 'Horario tarde (PRUEBA)',
                    odontologoId: odonto.userId,
                    createdAt: ahora,
                    updatedAt: ahora
                });
            }
        }

        if (disponibilidades.length > 0) {
            await queryInterface.bulkInsert('disponibilidades', disponibilidades, {});
            console.log(`✅ Creadas ${disponibilidades.length} disponibilidades de prueba.`);
        }
    },

    async down(queryInterface) {
        await queryInterface.sequelize.query("DELETE FROM disponibilidades WHERE motivo LIKE '%(PRUEBA)%'");
    }
};
