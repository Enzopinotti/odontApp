'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Verificar si ya existen turnos de prueba
    const [turnosExistentes] = await queryInterface.sequelize.query(
      "SELECT id FROM turnos WHERE motivo LIKE 'Turno de prueba%'"
    );

    if (turnosExistentes.length > 0) {
      console.log('⚠️  Turnos de prueba ya existen. Saltando creación.');
      return;
    }

    // Obtener pacientes, odontólogos y recepcionistas para asignar a los turnos
    const [pacientes] = await queryInterface.sequelize.query(
      "SELECT id FROM pacientes LIMIT 5"
    );

    const [odontologos] = await queryInterface.sequelize.query(
      "SELECT userId FROM odontologos LIMIT 3"
    );

    const [recepcionistas] = await queryInterface.sequelize.query(
      "SELECT userId FROM recepcionistas LIMIT 1"
    );

    if (pacientes.length === 0 || odontologos.length === 0 || recepcionistas.length === 0) {
      console.log('⚠️  No hay pacientes, odontólogos o recepcionistas disponibles. Crea primero los datos necesarios.');
      return;
    }

    const recepcionistaId = recepcionistas[0].userId;

    const ahora = new Date();
    const hoy = new Date(ahora);
    hoy.setHours(0, 0, 0, 0);

    const turnos = [
      // Turnos para hoy - Pendientes
      {
        fechaHora: new Date(hoy.getTime() + 9 * 60 * 60 * 1000), // 9:00 AM
        duracion: 30,
        motivo: 'Turno de prueba - Consulta General',
        estado: 'PENDIENTE',
        pacienteId: pacientes[0].id,
        odontologoId: odontologos[0].userId,
        recepcionistaId: recepcionistaId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fechaHora: new Date(hoy.getTime() + 10 * 60 * 60 * 1000), // 10:00 AM
        duracion: 45,
        motivo: 'Turno de prueba - Limpieza Dental',
        estado: 'PENDIENTE',
        pacienteId: pacientes[1]?.id || pacientes[0].id,
        odontologoId: odontologos[1]?.userId || odontologos[0].userId,
        recepcionistaId: recepcionistaId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        fechaHora: new Date(hoy.getTime() + 14 * 60 * 60 * 1000), // 2:00 PM
        duracion: 60,
        motivo: 'Turno de prueba - Endodoncia',
        estado: 'PENDIENTE',
        pacienteId: pacientes[2]?.id || pacientes[0].id,
        odontologoId: odontologos[2]?.userId || odontologos[0].userId,
        recepcionistaId: recepcionistaId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Turno para mañana
      {
        fechaHora: new Date(hoy.getTime() + 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000), // Mañana 11:00 AM
        duracion: 30,
        motivo: 'Turno de prueba - Control',
        estado: 'PENDIENTE',
        pacienteId: pacientes[3]?.id || pacientes[0].id,
        odontologoId: odontologos[0].userId,
        recepcionistaId: recepcionistaId,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Turno completado (ayer - ya pasó)
      {
        fechaHora: new Date(hoy.getTime() - 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000), // Ayer 10:00 AM
        duracion: 30,
        motivo: 'Turno de prueba - Consulta completada',
        estado: 'ASISTIO',
        pacienteId: pacientes[4]?.id || pacientes[0].id,
        odontologoId: odontologos[0].userId,
        recepcionistaId: recepcionistaId,
        createdAt: new Date(hoy.getTime() - 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('turnos', turnos, {});

    console.log('✅ Turnos de prueba creados exitosamente');
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      "DELETE FROM turnos WHERE motivo LIKE 'Turno de prueba%'"
    );
  },
};

