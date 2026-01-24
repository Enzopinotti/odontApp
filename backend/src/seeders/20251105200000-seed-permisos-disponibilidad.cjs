'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Verificar si ya existen los permisos de disponibilidad
    const [permisosExistentes] = await queryInterface.sequelize.query(
      "SELECT id FROM permisos WHERE recurso = 'disponibilidad'"
    );

    if (permisosExistentes.length > 0) {
      console.log('⚠️  Permisos de disponibilidad ya existen. Saltando creación.');
      return;
    }

    // 1. Crear los permisos de disponibilidad
    const permisosDisponibilidad = [
      { recurso: 'disponibilidad', accion: 'ver' },
      { recurso: 'disponibilidad', accion: 'gestionar' }, // crear, editar, eliminar
    ];

    await queryInterface.bulkInsert('permisos', permisosDisponibilidad, {});

    // 2. Obtener los IDs de los permisos recién creados
    const [permisosInsertados] = await queryInterface.sequelize.query(
      "SELECT id, accion FROM permisos WHERE recurso = 'disponibilidad' ORDER BY accion"
    );

    const permisoVer = permisosInsertados.find(p => p.accion === 'ver')?.id;
    const permisoGestionar = permisosInsertados.find(p => p.accion === 'gestionar')?.id;

    if (!permisoVer || !permisoGestionar) {
      console.log('❌ Error: No se pudieron obtener los IDs de los permisos');
      return;
    }

    // 3. Obtener los IDs de los roles
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, nombre FROM roles WHERE nombre IN ('Administrador', 'Odontólogo', 'Recepcionista')"
    );

    const rolAdmin = roles.find(r => r.nombre === 'Administrador')?.id;
    const rolOdontologo = roles.find(r => r.nombre === 'Odontólogo')?.id;
    const rolRecepcionista = roles.find(r => r.nombre === 'Recepcionista')?.id;

    // 4. Asignar permisos a los roles
    const rolPermisos = [];

    // Admin: todos los permisos
    if (rolAdmin) {
      rolPermisos.push(
        { RolId: rolAdmin, PermisoId: permisoVer },
        { RolId: rolAdmin, PermisoId: permisoGestionar }
      );
    }

    // Odontólogo: ver y gestionar sus propias disponibilidades
    if (rolOdontologo) {
      rolPermisos.push(
        { RolId: rolOdontologo, PermisoId: permisoVer },
        { RolId: rolOdontologo, PermisoId: permisoGestionar }
      );
    }

    // Recepcionista: ver y gestionar disponibilidades de todos los odontólogos
    if (rolRecepcionista) {
      rolPermisos.push(
        { RolId: rolRecepcionista, PermisoId: permisoVer },
        { RolId: rolRecepcionista, PermisoId: permisoGestionar }
      );
    }

    await queryInterface.bulkInsert('rol_permisos', rolPermisos, {});

    console.log('✅ Permisos de disponibilidad creados y asignados exitosamente');
  },

  async down(queryInterface) {
    // Eliminar las relaciones rol-permiso primero
    await queryInterface.sequelize.query(
      "DELETE FROM rol_permisos WHERE PermisoId IN (SELECT id FROM permisos WHERE recurso = 'disponibilidad')"
    );
    
    // Luego eliminar los permisos
    await queryInterface.sequelize.query(
      "DELETE FROM permisos WHERE recurso = 'disponibilidad'"
    );

    console.log('✅ Permisos de disponibilidad eliminados');
  },
};




