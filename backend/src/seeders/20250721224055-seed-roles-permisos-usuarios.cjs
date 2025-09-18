"use strict";

const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();

    console.log("🚀 Insertando roles...");
    await queryInterface.bulkInsert(
      "roles",
      [
        { id: 1, nombre: "Administrador", createdAt: now, updatedAt: now },
        { id: 2, nombre: "Odontólogo", createdAt: now, updatedAt: now },
        { id: 3, nombre: "Asistente", createdAt: now, updatedAt: now },
        { id: 4, nombre: "Recepcionista", createdAt: now, updatedAt: now },
      ],
      {}
    );

    console.log("🚀 Insertando permisos...");
    const permisos = [
      { recurso: "usuarios", accion: "crear" },
      { recurso: "usuarios", accion: "listar" },
      { recurso: "usuarios", accion: "editar" },
      { recurso: "usuarios", accion: "eliminar" },
      { recurso: "roles", accion: "listar" },
      { recurso: "roles", accion: "editar" },
      { recurso: "permisos", accion: "listar" },
      { recurso: "pacientes", accion: "crear" },
      { recurso: "pacientes", accion: "listar" },
      { recurso: "pacientes", accion: "editar" },
      { recurso: "pacientes", accion: "eliminar" },
      { recurso: "odontograma", accion: "ver" },
      { recurso: "odontograma", accion: "editar" },
      { recurso: "turnos", accion: "crear" },
      { recurso: "turnos", accion: "ver" },
      { recurso: "turnos", accion: "editar" },
      { recurso: "turnos", accion: "cancelar" },
      { recurso: "tratamientos", accion: "listar" },
      { recurso: "tratamientos", accion: "crearPersonalizado" },
      { recurso: "presupuestos", accion: "generar" },
      { recurso: "presupuestos", accion: "ver" },
      { recurso: "presupuestos", accion: "editar" },
      { recurso: "notificaciones", accion: "enviar" },
      { recurso: "notificaciones", accion: "listar" },
      { recurso: "recetas", accion: "crear" },
      { recurso: "recetas", accion: "ver" },
      { recurso: "recetas", accion: "listar" },
      { recurso: "reportes", accion: "ver" },
       { recurso: "odontologos", accion: "crear" },
      { recurso: "odontologos", accion: "ver" },
      { recurso: "odontologos", accion: "listar" },
    ]
    await queryInterface.bulkInsert("permisos", permisos, {});

    console.log("📄 Obteniendo permisos desde la DB...");
    const [rows] = await queryInterface.sequelize.query(
      "SELECT id, recurso, accion FROM permisos"
    );

    const permId = (recurso, accion) => {
      const permiso = rows.find((p) => p.recurso === recurso && p.accion === accion);
      if (!permiso) {
        throw new Error(`❌ Permiso no encontrado: ${recurso}.${accion}`);
      }
      return permiso.id;
    };

    const rolPermisos = [];

    console.log("🔗 Asignando todos los permisos al Administrador...");
    rows.forEach((p) =>
      rolPermisos.push({
        RolId: 1,
        PermisoId: p.id,
      })
    );

    const asignarPermisos = (rolId, lista) => {
      lista.forEach(([recurso, accion]) => {
        rolPermisos.push({
          RolId: rolId,
          PermisoId: permId(recurso, accion),
        });
      });
    };

    console.log("🔗 Asignando permisos a Odontólogo...");
    asignarPermisos(2, [
      ["pacientes", "crear"],
      ["pacientes", "listar"],
      ["pacientes", "editar"],
      ["pacientes", "eliminar"],
      ["odontograma", "ver"],
      ["odontograma", "editar"],
      ["turnos", "crear"],
      ["turnos", "ver"],
      ["turnos", "editar"],
      ["turnos", "cancelar"],
      ["tratamientos", "listar"],
      ["tratamientos", "crearPersonalizado"],
      ["presupuestos", "generar"],
      ["presupuestos", "ver"],
      ["presupuestos", "editar"],
      ["notificaciones", "enviar"],
      ["notificaciones", "listar"],
      ["reportes", "ver"],
      ["recetas", "crear"],
      ["recetas", "ver"],
      ["recetas", "listar"],
      ["odontologos", "listar"],
      ["odontologos", "ver"],
    ]);

    console.log("🔗 Asignando permisos a Asistente...");
    asignarPermisos(3, [
      ["pacientes", "crear"],
      ["pacientes", "listar"],
      ["pacientes", "editar"],
      ["turnos", "crear"],
      ["turnos", "ver"],
      ["turnos", "editar"],
      ["turnos", "cancelar"],
      ["odontograma", "ver"],
      ["tratamientos", "listar"],
      ["presupuestos", "ver"],
      ["notificaciones", "listar"],
      ["odontologos", "listar"],
      ["odontologos", "ver"],
    ]);

    console.log("🔗 Asignando permisos a Recepcionista...");
    asignarPermisos(4, [
      ["pacientes", "crear"],
      ["pacientes", "listar"],
      ["turnos", "crear"],
      ["turnos", "ver"],
      ["turnos", "cancelar"],
      ["notificaciones", "listar"],
      ["recetas", "ver"],
    ]);

    console.log("💾 Insertando relaciones rol_permisos...");
    await queryInterface.bulkInsert("rol_permisos", rolPermisos, {});

    console.log("👤 Insertando usuario administrador...");
    await queryInterface.bulkInsert("usuarios", [
      {
        nombre: "Admin",
        apellido: "Sistema",
        email: "admin@odontapp.com",
        password: await bcrypt.hash("admin123", 10),
        RolId: 1,
        activo: true,
        telefono: "1123456789",
        fechaAlta: now,
        createdAt: now,
        updatedAt: now,
      },
    ]);
  },

  async down(queryInterface) {
    console.log("🔁 Revirtiendo seed...");
    await queryInterface.bulkDelete("usuarios", {
      email: "admin@odontapp.com",
    });
    await queryInterface.bulkDelete("rol_permisos", null);
    await queryInterface.bulkDelete("permisos", null);
    await queryInterface.bulkDelete("roles", null);
  },
};
