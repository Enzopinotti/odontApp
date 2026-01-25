'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /* 1️⃣  ROLES ------------------------------------------------ */
    // Verificar qué roles existen ya
    const [rolesExistentes] = await queryInterface.sequelize.query(
      'SELECT id, nombre FROM roles'
    );

    const rolesParaInsertar = [
      { id: 1, nombre: 'Administrador' },
      { id: 2, nombre: 'Odontólogo' },
      { id: 3, nombre: 'Asistente' },
      { id: 4, nombre: 'Recepcionista' },
    ].filter(r => !rolesExistentes.some(re => re.id === r.id || re.nombre === r.nombre));

    if (rolesParaInsertar.length > 0) {
      await queryInterface.bulkInsert('roles', rolesParaInsertar, {});
    }

    /* 2️⃣ PERMISOS --------------------------------------------- */
    const [permisosExistentes] = await queryInterface.sequelize.query(
      'SELECT recurso, accion FROM permisos'
    );

    const permisos = [
      // usuarios
      { recurso: 'usuarios', accion: 'crear' },
      { recurso: 'usuarios', accion: 'listar' },
      { recurso: 'usuarios', accion: 'editar' },
      { recurso: 'usuarios', accion: 'eliminar' },
      // roles / permisos
      { recurso: 'roles', accion: 'listar' },
      { recurso: 'roles', accion: 'editar' },
      { recurso: 'permisos', accion: 'listar' },
      // pacientes
      { recurso: 'pacientes', accion: 'crear' },
      { recurso: 'pacientes', accion: 'listar' },
      { recurso: 'pacientes', accion: 'editar' },
      { recurso: 'pacientes', accion: 'eliminar' },
      // odontograma
      { recurso: 'odontograma', accion: 'ver' },
      { recurso: 'odontograma', accion: 'editar' },
      // historia clínica
      { recurso: 'historia_clinica', accion: 'ver' },
      { recurso: 'historia_clinica', accion: 'crear' },
      { recurso: 'historia_clinica', accion: 'editar' },
      { recurso: 'historia_clinica', accion: 'eliminar' },
      // imágenes
      { recurso: 'imagenes', accion: 'ver' },
      { recurso: 'imagenes', accion: 'subir' },
      { recurso: 'imagenes', accion: 'editar' },
      { recurso: 'imagenes', accion: 'eliminar' },
      // turnos
      { recurso: 'turnos', accion: 'crear' },
      { recurso: 'turnos', accion: 'ver' },
      { recurso: 'turnos', accion: 'editar' },
      { recurso: 'turnos', accion: 'cancelar' },
      // tratamientos
      { recurso: 'tratamientos', accion: 'listar' },
      { recurso: 'tratamientos', accion: 'crearPersonalizado' },
      { recurso: 'tratamientos', accion: 'editar' },
      { recurso: 'tratamientos', accion: 'aplicar' },
      // presupuestos
      { recurso: 'presupuestos', accion: 'generar' },
      { recurso: 'presupuestos', accion: 'ver' },
      { recurso: 'presupuestos', accion: 'editar' },
      { recurso: 'presupuestos', accion: 'eliminar' },
      // notificaciones
      { recurso: 'notificaciones', accion: 'enviar' },
      { recurso: 'notificaciones', accion: 'listar' },
      // reportes
      { recurso: 'reportes', accion: 'ver' },
      { recurso: 'reportes', accion: 'generar' },
    ];

    const permisosNuevos = permisos.filter(p =>
      !permisosExistentes.some(pe => pe.recurso === p.recurso && pe.accion === p.accion)
    );

    if (permisosNuevos.length > 0) {
      await queryInterface.bulkInsert('permisos', permisosNuevos, {});
    }

    /* Helper: obtener todos los permisos actualizados */
    const [rows] = await queryInterface.sequelize.query(
      'SELECT id, recurso, accion FROM permisos'
    );

    const permId = (rec, acc) => {
      const permiso = rows.find((p) => p.recurso === rec && p.accion === acc);
      if (!permiso) {
        throw new Error(`Permiso no encontrado: recurso='${rec}', accion='${acc}'`);
      }
      return permiso.id;
    };

    /* 3️⃣  RELACIONES ROL-PERMISO ------------------------------ */
    const [rolPermisosExistentes] = await queryInterface.sequelize.query(
      'SELECT RolId, PermisoId FROM rol_permisos'
    );

    const rolPermisosNuevos = [];

    const addRolPermiso = (rolId, permIdValue) => {
      if (!rolPermisosExistentes.some(rp => rp.RolId === rolId && rp.PermisoId === permIdValue)) {
        rolPermisosNuevos.push({ RolId: rolId, PermisoId: permIdValue });
      }
    };

    // --- ADMIN: todos los permisos
    rows.forEach((p) => addRolPermiso(1, p.id));

    // --- ODONTÓLOGO ------------------------------------------
    [
      ['usuarios', 'listar'],
      ['pacientes', 'crear'],
      ['pacientes', 'listar'],
      ['pacientes', 'editar'],
      ['pacientes', 'eliminar'],
      ['odontograma', 'ver'],
      ['odontograma', 'editar'],
      ['historia_clinica', 'ver'],
      ['historia_clinica', 'crear'],
      ['historia_clinica', 'editar'],
      ['historia_clinica', 'eliminar'],
      ['imagenes', 'ver'],
      ['imagenes', 'subir'],
      ['imagenes', 'editar'],
      ['imagenes', 'eliminar'],
      ['turnos', 'crear'],
      ['turnos', 'ver'],
      ['turnos', 'editar'],
      ['turnos', 'cancelar'],
      ['tratamientos', 'listar'],
      ['tratamientos', 'crearPersonalizado'],
      ['tratamientos', 'editar'],
      ['tratamientos', 'aplicar'],
      ['presupuestos', 'generar'],
      ['presupuestos', 'ver'],
      ['presupuestos', 'editar'],
      ['presupuestos', 'eliminar'],
      ['notificaciones', 'enviar'],
      ['notificaciones', 'listar'],
      ['reportes', 'ver'],
      ['reportes', 'generar'],
    ].forEach(([r, a]) => addRolPermiso(2, permId(r, a)));

    // --- ASISTENTE -------------------------------------------
    [
      ['pacientes', 'crear'],
      ['pacientes', 'listar'],
      ['pacientes', 'editar'],
      ['odontograma', 'ver'],
      ['historia_clinica', 'ver'],
      ['historia_clinica', 'crear'],
      ['historia_clinica', 'editar'],
      ['imagenes', 'ver'],
      ['imagenes', 'subir'],
      ['imagenes', 'editar'],
      ['turnos', 'crear'],
      ['turnos', 'ver'],
      ['turnos', 'editar'],
      ['turnos', 'cancelar'],
      ['tratamientos', 'listar'],
      ['tratamientos', 'aplicar'],
      ['presupuestos', 'ver'],
      ['notificaciones', 'listar'],
    ].forEach(([r, a]) => addRolPermiso(3, permId(r, a)));

    // --- RECEPCIONISTA ---------------------------------------
    [
      ['pacientes', 'crear'],
      ['pacientes', 'listar'],
      ['historia_clinica', 'ver'],
      ['imagenes', 'ver'],
      ['turnos', 'crear'],
      ['turnos', 'ver'],
      ['turnos', 'cancelar'],
      ['tratamientos', 'listar'],
      ['presupuestos', 'ver'],
      ['notificaciones', 'listar'],
    ].forEach(([r, a]) => addRolPermiso(4, permId(r, a)));

    if (rolPermisosNuevos.length > 0) {
      await queryInterface.bulkInsert('rol_permisos', rolPermisosNuevos, {});
    }

    /* 4️⃣  Usuario administrador ----------------------------- */
    const [adminExistente] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'admin@odontapp.com'"
    );

    if (adminExistente.length === 0) {
      await queryInterface.bulkInsert(
        'usuarios',
        [
          {
            nombre: 'Admin',
            apellido: 'Sistema',
            email: 'admin@odontapp.com',
            password: await bcrypt.hash('admin123', 10),
            RolId: 1,
            activo: true,
            telefono: '1123456789',
            fechaAlta: new Date(),
          },
        ],
        {}
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@odontapp.com' });
    await queryInterface.bulkDelete('rol_permisos', null);
    await queryInterface.bulkDelete('permisos', null);
    await queryInterface.bulkDelete('roles', null);
  },
};
