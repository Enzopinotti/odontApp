'use strict';

/**
 * Seeder para agregar permisos adicionales de turnos
 * Agrega: reprogramar, marcar_asistencia, marcar_ausencia, eliminar
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Verificar si los permisos ya existen
    const [existingPermisos] = await queryInterface.sequelize.query(
      `SELECT recurso, accion FROM permisos WHERE recurso = 'turnos' AND accion IN ('reprogramar', 'marcar_asistencia', 'marcar_ausencia', 'eliminar')`
    );

    // 2️⃣ Permisos a agregar
    const nuevosPermisos = [
      { recurso: 'turnos', accion: 'reprogramar' },
      { recurso: 'turnos', accion: 'marcar_asistencia' },
      { recurso: 'turnos', accion: 'marcar_ausencia' },
      { recurso: 'turnos', accion: 'eliminar' },
    ];

    // Filtrar solo los que no existen
    const permisosAInsertar = nuevosPermisos.filter(
      (nuevo) =>
        !existingPermisos.some(
          (existing) =>
            existing.recurso === nuevo.recurso &&
            existing.accion === nuevo.accion
        )
    );

    if (permisosAInsertar.length === 0) {
      console.log('✅ Todos los permisos adicionales de turnos ya existen.');
      return;
    }

    // 3️⃣ Insertar los permisos nuevos
    await queryInterface.bulkInsert('permisos', permisosAInsertar, {});
    console.log(`✅ ${permisosAInsertar.length} permisos de turnos agregados.`);

    // 4️⃣ Obtener IDs de los permisos recién creados
    const [rows] = await queryInterface.sequelize.query(
      `SELECT id, recurso, accion FROM permisos WHERE recurso = 'turnos' AND accion IN ('reprogramar', 'marcar_asistencia', 'marcar_ausencia', 'eliminar')`
    );

    const permId = (accion) => {
      const permiso = rows.find((p) => p.accion === accion);
      return permiso ? permiso.id : null;
    };

    // 5️⃣ Asignar permisos a roles
    const rolPermisos = [];

    // ADMINISTRADOR (id: 1) - Todos los nuevos permisos
    ['reprogramar', 'marcar_asistencia', 'marcar_ausencia', 'eliminar'].forEach((accion) => {
      const id = permId(accion);
      if (id) {
        rolPermisos.push({ RolId: 1, PermisoId: id });
      }
    });

    // ODONTÓLOGO (id: 2) - Todos excepto eliminar
    ['reprogramar', 'marcar_asistencia', 'marcar_ausencia'].forEach((accion) => {
      const id = permId(accion);
      if (id) {
        rolPermisos.push({ RolId: 2, PermisoId: id });
      }
    });

    // ASISTENTE (id: 3) - Solo marcar asistencia y ausencia
    ['marcar_asistencia', 'marcar_ausencia'].forEach((accion) => {
      const id = permId(accion);
      if (id) {
        rolPermisos.push({ RolId: 3, PermisoId: id });
      }
    });

    // RECEPCIONISTA (id: 4) - reprogramar, marcar_asistencia, marcar_ausencia, eliminar
    ['reprogramar', 'marcar_asistencia', 'marcar_ausencia', 'eliminar'].forEach((accion) => {
      const id = permId(accion);
      if (id) {
        rolPermisos.push({ RolId: 4, PermisoId: id });
      }
    });

    // 6️⃣ Insertar relaciones (verificar duplicados primero)
    for (const rp of rolPermisos) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT * FROM rol_permisos WHERE RolId = ${rp.RolId} AND PermisoId = ${rp.PermisoId}`
      );

      if (existing.length === 0) {
        await queryInterface.bulkInsert('rol_permisos', [rp], {});
      }
    }

    console.log(`✅ Relaciones rol-permiso creadas para permisos de turnos.`);
  },

  async down(queryInterface, Sequelize) {
    // Eliminar relaciones rol-permiso
    await queryInterface.sequelize.query(
      `DELETE rp FROM rol_permisos rp
       INNER JOIN permisos p ON rp.PermisoId = p.id
       WHERE p.recurso = 'turnos' AND p.accion IN ('reprogramar', 'marcar_asistencia', 'marcar_ausencia', 'eliminar')`
    );

    // Eliminar permisos
    await queryInterface.bulkDelete('permisos', {
      recurso: 'turnos',
      accion: {
        [Sequelize.Op.in]: ['reprogramar', 'marcar_asistencia', 'marcar_ausencia', 'eliminar'],
      },
    });

    console.log('✅ Permisos adicionales de turnos eliminados.');
  },
};




