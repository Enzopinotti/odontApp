'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /* 1️⃣  ROLES ------------------------------------------------ */
    await queryInterface.bulkInsert(
      'roles',
      [
        { id: 1, nombre: 'Administrador' },
        { id: 2, nombre: 'Odontólogo' },
        { id: 3, nombre: 'Asistente' },
        { id: 4, nombre: 'Recepcionista' },
      ],
      {}
    );

    /* 2️⃣ PERMISOS --------------------------------------------- */
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

    await queryInterface.bulkInsert('permisos', permisos, {});

    /* Helper: obtener id de permiso por (recurso, accion) */
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
    const rolPermisos = [];

    // --- ADMIN: todos los permisos
    rows.forEach((p) => rolPermisos.push({ RolId: 1, PermisoId: p.id }));

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
    ].forEach(([r, a]) => rolPermisos.push({ RolId: 2, PermisoId: permId(r, a) }));

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
    ].forEach(([r, a]) => rolPermisos.push({ RolId: 3, PermisoId: permId(r, a) }));

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
    ].forEach(([r, a]) => rolPermisos.push({ RolId: 4, PermisoId: permId(r, a) }));

    await queryInterface.bulkInsert('rol_permisos', rolPermisos, {});

    /* 4️⃣  Usuario administrador ----------------------------- */
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
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('usuarios', { email: 'admin@odontapp.com' });
    await queryInterface.bulkDelete('rol_permisos', null);
    await queryInterface.bulkDelete('permisos', null);
    await queryInterface.bulkDelete('roles', null);
  },
};
