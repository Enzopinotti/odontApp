"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    /* 1️⃣  ROLES ------------------------------------------------ */
    await queryInterface.bulkInsert(
      "roles",
      [
        { id: 1, nombre: "Administrador" },
        { id: 2, nombre: "Odontólogo" },
        { id: 3, nombre: "Asistente" },
        { id: 4, nombre: "Recepcionista" },
      ],
      {}
    );

    /* 2️⃣ PERMISOS --------------------------------------------- */
    const permisos = [
      // usuarios
      { recurso: "usuarios", accion: "crear" },
      { recurso: "usuarios", accion: "listar" },
      { recurso: "usuarios", accion: "editar" },
      { recurso: "usuarios", accion: "eliminar" },
      // roles / permisos
      { recurso: "roles", accion: "listar" },
      { recurso: "roles", accion: "editar" },
      { recurso: "permisos", accion: "listar" },
      // pacientes
      { recurso: "pacientes", accion: "crear" },
      { recurso: "pacientes", accion: "listar" },
      { recurso: "pacientes", accion: "editar" },
      { recurso: "pacientes", accion: "eliminar" },
      // odontograma
      { recurso: "odontograma", accion: "ver" },
      { recurso: "odontograma", accion: "editar" },
      // turnos
      { recurso: "turnos", accion: "crear" },
      { recurso: "turnos", accion: "ver" },
      { recurso: "turnos", accion: "editar" },
      { recurso: "turnos", accion: "cancelar" },
      // tratamientos
      { recurso: "tratamientos", accion: "listar" },
      { recurso: "tratamientos", accion: "crearPersonalizado" },
      // presupuestos
      { recurso: "presupuestos", accion: "generar" },
      { recurso: "presupuestos", accion: "ver" },
      { recurso: "presupuestos", accion: "editar" },
      // notificaciones
      { recurso: "notificaciones", accion: "enviar" },
      { recurso: "notificaciones", accion: "listar" },
      //receta
      { recurso: "recetas", accion: "crear" },
      { recurso: "recetas", accion: "ver" },
      { recurso: "recetas", accion: "listar" },
      // reportes
      { recurso: "reportes", accion: "ver" },
    ];

    await queryInterface.bulkInsert("permisos", permisos, {});

    /* Helper: obtener id de permiso por (recurso, accion) */
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id, recurso, accion FROM permisos"
    );
    const permId = (rec, acc) =>
      rows.find((p) => p.recurso === rec && p.accion === acc).id;

    /* 3️⃣  RELACIONES ROL-PERMISO ------------------------------ */
    const rolPermisos = [];

    // --- ADMIN: todos
    rows.forEach((p) => rolPermisos.push({ RolId: 1, PermisoId: p.id }));

    // --- ODONTÓLOGO ------------------------------------------
    [
      // pacientes
      ["pacientes", "crear"],
      ["pacientes", "listar"],
      ["pacientes", "editar"],
      ["pacientes", "eliminar"],
      // odontograma
      ["odontograma", "ver"],
      ["odontograma", "editar"],
      // turnos
      ["turnos", "crear"],
      ["turnos", "ver"],
      ["turnos", "editar"],
      ["turnos", "cancelar"],
      // tratamientos
      ["tratamientos", "listar"],
      ["tratamientos", "crearPersonalizado"],
      // presupuestos
      ["presupuestos", "generar"],
      ["presupuestos", "ver"],
      ["presupuestos", "editar"],
      // notificaciones
      ["notificaciones", "enviar"],
      ["notificaciones", "listar"],
      // reportes
      ["reportes", "ver"],
           //receta
      { recurso: "recetas", accion: "crear" },
      { recurso: "recetas", accion: "ver" },
      { recurso: "recetas", accion: "listar" },
    ].forEach(([r, a]) =>
      rolPermisos.push({ RolId: 2, PermisoId: permId(r, a) })
    );

    // --- ASISTENTE -------------------------------------------
    [
      ["pacientes", "crear"],
      ["pacientes", "listar"],
      ["pacientes", "editar"],
      // turnos
      ["turnos", "crear"],
      ["turnos", "ver"],
      ["turnos", "editar"],
      ["turnos", "cancelar"],
      // odontograma
      ["odontograma", "ver"],
      // tratamientos
      ["tratamientos", "listar"],
      // presupuestos
      ["presupuestos", "ver"],
      // notificaciones
      ["notificaciones", "listar"],
    ].forEach(([r, a]) =>
      rolPermisos.push({ RolId: 3, PermisoId: permId(r, a) })
    );

    // --- RECEPCIONISTA ---------------------------------------
    [
      ["pacientes", "crear"],
      ["pacientes", "listar"],
      // turnos
      ["turnos", "crear"],
      ["turnos", "ver"],
      ["turnos", "cancelar"],
      // notificaciones
      ["notificaciones", "listar"],
      //recetas
      ['recetas', 'ver'],
    ].forEach(([r, a]) =>
      rolPermisos.push({ RolId: 4, PermisoId: permId(r, a) })
    );

    await queryInterface.bulkInsert("rol_permisos", rolPermisos, {});

    /* 4️⃣  Usuario administrador ----------------------------- */
    await queryInterface.bulkInsert(
      "usuarios",
      [
        {
          nombre: "Admin",
          apellido: "Sistema",
          email: "admin@odontapp.com",
          password: await bcrypt.hash("admin123", 10),
          RolId: 1,
          activo: true,
          telefono: "1123456789",
          fechaAlta: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("usuarios", {
      email: "admin@odontapp.com",
    });
    await queryInterface.bulkDelete("rol_permisos", null);
    await queryInterface.bulkDelete("permisos", null);
    await queryInterface.bulkDelete("roles", null);
  },
};
