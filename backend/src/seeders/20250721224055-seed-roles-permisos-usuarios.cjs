"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    /* 1️⃣  ROLES ------------------------------------------------ */
    const [rolesExistentes] = await queryInterface.sequelize.query('SELECT id, nombre FROM roles');
    const rolesParaInsertar = [
      { id: 1, nombre: 'Administrador' },
      { id: 2, nombre: 'Odontólogo' },
      { id: 3, nombre: 'Asistente' },
      { id: 4, nombre: 'Recepcionista' },
      { id: 5, nombre: 'Paciente' },
    ].filter(r => !rolesExistentes.some(re => re.id === r.id));

    if (rolesParaInsertar.length > 0) {
      await queryInterface.bulkInsert('roles', rolesParaInsertar.map(r => ({ ...r, createdAt: now, updatedAt: now })), {});
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
      { recurso: 'notificaciones', accion: 'listar' },
      { recurso: 'notificaciones', accion: 'enviar' },
      { recurso: 'reportes', accion: 'ver' },
      { recurso: 'reportes', accion: 'generar' },
      { recurso: 'turnos', accion: 'ver' },
      { recurso: 'turnos', accion: 'crear' },
      { recurso: 'turnos', accion: 'editar' },
      { recurso: 'turnos', accion: 'cancelar' },
      { recurso: 'turnos', accion: 'reprogramar' },
      // Nuevos permisos de Recetas y Odontólogos
      { recurso: 'recetas', accion: 'crear' },
      { recurso: 'recetas', accion: 'ver' },
      { recurso: 'recetas', accion: 'listar' },
      { recurso: 'odontologos', accion: 'crear' },
      { recurso: 'odontologos', accion: 'ver' },
      { recurso: 'odontologos', accion: 'listar' },
    ];

    const permisosParaInsertar = todosLosPermisos.filter(p =>
      !permisosExistentes.some(pe => pe.recurso === p.recurso && pe.accion === p.accion)
    );

    if (permisosParaInsertar.length > 0) {
      await queryInterface.bulkInsert('permisos', permisosParaInsertar, {});
    }

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

    // ODONTÓLOGO
    [
      ['pacientes', 'listar'], ['pacientes', 'ver'], ['pacientes', 'crear'], ['pacientes', 'editar'],
      ['agenda', 'ver'], ['odontograma', 'ver'], ['odontograma', 'editar'],
      ['historia_clinica', 'ver'], ['historia_clinica', 'crear'],
      ['turnos', 'ver'], ['turnos', 'crear'], ['turnos', 'editar'], ['turnos', 'cancelar'],
      ['recetas', 'crear'], ['recetas', 'ver'], ['recetas', 'listar'],
      ['odontologos', 'ver'], ['odontologos', 'listar'],
    ].forEach(([r, a]) => safeAdd(2, permId(r, a)));

    // RECEPCIONISTA
    [
      ['pacientes', 'listar'], ['pacientes', 'ver'], ['pacientes', 'crear'],
      ['turnos', 'ver'], ['turnos', 'crear'], ['turnos', 'cancelar'],
      ['agenda', 'ver'], ['recetas', 'ver'],
    ].forEach(([r, a]) => safeAdd(4, permId(r, a)));

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
        fechaAlta: now,
        createdAt: now,
        updatedAt: now
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
