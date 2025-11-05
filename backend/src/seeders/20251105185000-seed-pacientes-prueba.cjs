'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Verificar si ya existen pacientes de prueba
    const [pacientesExistentes] = await queryInterface.sequelize.query(
      "SELECT id FROM pacientes WHERE nombre = 'Juan' AND apellido = 'Gómez'"
    );

    if (pacientesExistentes.length > 0) {
      console.log('⚠️  Pacientes de prueba ya existen. Saltando creación.');
      return;
    }

    // Primero crear los pacientes
    const pacientes = [
      {
        nombre: 'Juan',
        apellido: 'Gómez',
        dni: '30123456',
        obraSocial: 'OSDE',
        nroAfiliado: '301234',
        ultimaVisita: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'María',
        apellido: 'Rodríguez',
        dni: '31234567',
        obraSocial: 'Swiss Medical',
        nroAfiliado: '312345',
        ultimaVisita: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Carlos',
        apellido: 'Fernández',
        dni: '32345678',
        obraSocial: null,
        nroAfiliado: null,
        ultimaVisita: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Ana',
        apellido: 'Martínez',
        dni: '33456789',
        obraSocial: 'Galeno',
        nroAfiliado: '334567',
        ultimaVisita: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        nombre: 'Luis',
        apellido: 'López',
        dni: '34567890',
        obraSocial: 'OSDE',
        nroAfiliado: '345678',
        ultimaVisita: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('pacientes', pacientes, {});

    // Obtener los IDs de los pacientes insertados
    const [pacientesInsertados] = await queryInterface.sequelize.query(
      "SELECT id FROM pacientes WHERE dni IN ('30123456', '31234567', '32345678', '33456789', '34567890') ORDER BY id"
    );

    if (pacientesInsertados.length !== 5) {
      console.log('❌ Error al insertar pacientes');
      return;
    }

    // Ahora crear los contactos asociados
    const contactos = [
      {
        pacienteId: pacientesInsertados[0].id,
        email: 'juan.gomez@email.com',
        telefonoMovil: '1145678901',
        telefonoFijo: null,
        preferenciaContacto: 'whatsapp',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pacienteId: pacientesInsertados[1].id,
        email: 'maria.rodriguez@email.com',
        telefonoMovil: '1145678902',
        telefonoFijo: null,
        preferenciaContacto: 'email',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pacienteId: pacientesInsertados[2].id,
        email: 'carlos.fernandez@email.com',
        telefonoMovil: '1145678903',
        telefonoFijo: null,
        preferenciaContacto: 'whatsapp',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pacienteId: pacientesInsertados[3].id,
        email: 'ana.martinez@email.com',
        telefonoMovil: '1145678904',
        telefonoFijo: null,
        preferenciaContacto: 'email',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        pacienteId: pacientesInsertados[4].id,
        email: 'luis.lopez@email.com',
        telefonoMovil: '1145678905',
        telefonoFijo: null,
        preferenciaContacto: 'whatsapp',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('contactos', contactos, {});

    console.log('✅ Pacientes de prueba creados exitosamente');
  },

  async down(queryInterface) {
    // Eliminar contactos primero (por la foreign key)
    await queryInterface.sequelize.query(
      "DELETE FROM contactos WHERE email IN ('juan.gomez@email.com', 'maria.rodriguez@email.com', 'carlos.fernandez@email.com', 'ana.martinez@email.com', 'luis.lopez@email.com')"
    );
    
    // Luego eliminar pacientes de prueba
    await queryInterface.sequelize.query(
      "DELETE FROM pacientes WHERE dni IN ('30123456', '31234567', '32345678', '33456789', '34567890')"
    );
  },
};

