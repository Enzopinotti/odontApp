'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1️⃣ Definir los permisos para el recurso 'notas'
        const nuevosPermisos = [
            { recurso: 'notas', accion: 'ver' },
            { recurso: 'notas', accion: 'crear' },
            { recurso: 'notas', accion: 'editar' },
            { recurso: 'notas', accion: 'eliminar' },
        ];

        // 2️⃣ Insertar permisos si no existen
        for (const p of nuevosPermisos) {
            const [existing] = await queryInterface.sequelize.query(
                `SELECT id FROM permisos WHERE recurso = '${p.recurso}' AND accion = '${p.accion}'`
            );
            if (existing.length === 0) {
                await queryInterface.bulkInsert('permisos', [p]);
            }
        }

        // 3️⃣ Obtener todos los permisos del recurso 'notas' para asociar
        const [permisos] = await queryInterface.sequelize.query(
            `SELECT id, recurso, accion FROM permisos WHERE recurso = 'notas'`
        );

        const getPermId = (accion) => permisos.find(p => p.accion === accion)?.id;

        // 4️⃣ Definir asociaciones Rol-Permiso
        const asociaciones = [];

        // ADMIN (RolId 1): Todo
        permisos.forEach(p => asociaciones.push({ RolId: 1, PermisoId: p.id }));

        // ODONTOLOGO (RolId 2): ver, crear, editar (las propias)
        ['ver', 'crear', 'editar'].forEach(acc => {
            const id = getPermId(acc);
            if (id) asociaciones.push({ RolId: 2, PermisoId: id });
        });

        // RECEPCIONISTA (RolId 4): ver, crear, editar
        ['ver', 'crear', 'editar'].forEach(acc => {
            const id = getPermId(acc);
            if (id) asociaciones.push({ RolId: 4, PermisoId: id });
        });

        // ASISTENTE (RolId 3): ver, crear
        ['ver', 'crear'].forEach(acc => {
            const id = getPermId(acc);
            if (id) asociaciones.push({ RolId: 3, PermisoId: id });
        });

        // 5️⃣ Insertar asociaciones evitando duplicados
        for (const assoc of asociaciones) {
            const [existing] = await queryInterface.sequelize.query(
                `SELECT * FROM rol_permisos WHERE RolId = ${assoc.RolId} AND PermisoId = ${assoc.PermisoId}`
            );
            if (existing.length === 0) {
                await queryInterface.bulkInsert('rol_permisos', [assoc]);
            }
        }
    },

    async down(queryInterface, Sequelize) {
        // Revertir: Eliminar relaciones y luego los permisos (opcional, usualmente no se hace en producción)
        await queryInterface.sequelize.query(
            `DELETE rp FROM rol_permisos rp 
       INNER JOIN permisos p ON rp.PermisoId = p.id 
       WHERE p.recurso = 'notas'`
        );
        await queryInterface.sequelize.query(`DELETE FROM permisos WHERE recurso = 'notas'`);
    }
};
