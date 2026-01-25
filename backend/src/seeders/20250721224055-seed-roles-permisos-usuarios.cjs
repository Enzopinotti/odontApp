'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    /* 1️⃣  ROLES ------------------------------------------------ */
    const [rolesExistentes] = await queryInterface.sequelize.query('SELECT id, nombre FROM roles');
    const rolesParaInsertar = [
      { id: 1, nombre: 'Administrador' },
      { id: 2, nombre: 'Odontólogo' },
      { id: 3, nombre: 'Asistente' },
      { id: 4, nombre: 'Recepcionista' },
    ].filter(r => !rolesExistentes.some(re => re.id === r.id));

    if (rolesParaInsertar.length > 0) {
      await queryInterface.bulkInsert('roles', rolesParaInsertar, {});
    }

    /* 2️⃣ PERMISOS --------------------------------------------- */
    const [permisosExistentes] = await queryInterface.sequelize.query('SELECT recurso, accion FROM permisos');
    const todosLosPermisos = [
      { recurso: 'usuarios', accion: 'crear' },
      { recurso: 'usuarios', accion: 'ver' },
      { recurso: 'usuarios', accion: 'editar' },
      { recurso: 'usuarios', accion: 'eliminar' },
      { recurso: 'usuarios', accion: 'listar' },
      { recurso: 'pacientes', accion: 'crear' },
      { recurso: 'pacientes', accion: 'ver' },
      { recurso: 'pacientes', accion: 'editar' },
      { recurso: 'pacientes', accion: 'eliminar' },
      { recurso: 'pacientes', accion: 'listar' },
      { recurso: 'agenda', accion: 'ver' },
      { recurso: 'agenda', accion: 'gestionar' },
      { recurso: 'odontograma', accion: 'ver' },
      { recurso: 'odontograma', accion: 'editar' },
      { recurso: 'historia_clinica', accion: 'ver' },
      { recurso: 'historia_clinica', accion: 'crear' },
      { recurso: 'historia_clinica', accion: 'editar' },
      { recurso: 'imagenes', accion: 'ver' },
      { recurso: 'imagenes', accion: 'subir' },
      { recurso: 'tratamientos', accion: 'listar' },
      { recurso: 'tratamientos', accion: 'aplicar' },
      { recurso: 'presupuestos', accion: 'crear' },
      { recurso: 'presupuestos', accion: 'ver' },
      { recurso: 'facturacion', accion: 'gestionar' },
      { recurso: 'inventario', accion: 'ver' },
      { recurso: 'notificaciones', accion: 'listar' },
      { recurso: 'reportes', accion: 'ver' },
      { recurso: 'reportes', accion: 'generar' },
    ];

    const permisosParaInsertar = todosLosPermisos.filter(p =>
      !permisosExistentes.some(pe => pe.recurso === p.recurso && pe.accion === p.accion)
    );

    if (permisosParaInsertar.length > 0) {
      await queryInterface.bulkInsert('permisos', permisosParaInsertar, {});
    }

    /* Helper: obtener IDs actualizados */
    const [rows] = await queryInterface.sequelize.query('SELECT id, recurso, accion FROM permisos');
    const permId = (recurso, accion) => rows.find(r => r.recurso === recurso && r.accion === accion)?.id;

    /* 3️⃣  RELACIONES ROL-PERMISO ------------------------------ */
    const [rpExistentes] = await queryInterface.sequelize.query('SELECT RolId, PermisoId FROM rol_permisos');
    const rolPermisosNuevos = [];

    const safeAdd = (rolId, pId) => {
      if (pId && !rpExistentes.some(x => x.RolId === rolId && x.PermisoId === pId)) {
        rolPermisosNuevos.push({ RolId: rolId, PermisoId: pId });
      }
    };

    // ADMIN: Todos
    rows.forEach(p => safeAdd(1, p.id));

    // ODONTÓLOGO: Clínica y Agenda
    [
      ['pacientes', 'listar'], ['pacientes', 'ver'], ['agenda', 'ver'],
      ['odontograma', 'ver'], ['odontograma', 'editar'],
      ['historia_clinica', 'ver'], ['historia_clinica', 'crear'],
      ['reportes', 'ver'],
    ].forEach(([r, a]) => safeAdd(2, permId(r, a)));

    if (rolPermisosNuevos.length > 0) {
      await queryInterface.bulkInsert('rol_permisos', rolPermisosNuevos, {});
    }

    /* 4️⃣  USUARIO ADMIN -------------------------------------- */
    const [adminExistente] = await queryInterface.sequelize.query("SELECT id FROM usuarios WHERE email = 'admin@odontapp.com'");
    if (adminExistente.length === 0) {
      await queryInterface.bulkInsert('usuarios', [{
        nombre: 'Admin',
        apellido: 'Sistema',
        email: 'admin@odontapp.com',
        password: await bcrypt.hash('admin123', 10),
        RolId: 1,
        activo: true,
        telefono: '1123456789',
        fechaAlta: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('rol_permisos', null, {});
    await queryInterface.bulkDelete('usuarios', null, {});
    await queryInterface.bulkDelete('permisos', null, {});
    await queryInterface.bulkDelete('roles', null, {});
  }
};
