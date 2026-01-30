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

    // Primero crear los 10 pacientes de prueba (estado usa DEFAULT de la tabla si existe la columna)
    const pacientes = [
      { nombre: 'Juan', apellido: 'Gómez', dni: '30123456', obraSocial: 'OSDE', nroAfiliado: '301234', ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'María', apellido: 'Rodríguez', dni: '31234567', obraSocial: 'Swiss Medical', nroAfiliado: '312345', ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Carlos', apellido: 'Fernández', dni: '32345678', obraSocial: null, nroAfiliado: null, ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Ana', apellido: 'Martínez', dni: '33456789', obraSocial: 'Galeno', nroAfiliado: '334567', ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Luis', apellido: 'López', dni: '34567890', obraSocial: 'OSDE', nroAfiliado: '345678', ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Laura', apellido: 'Sánchez', dni: '35678901', obraSocial: 'Swiss Medical', nroAfiliado: '356789', ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Pedro', apellido: 'Díaz', dni: '36789012', obraSocial: null, nroAfiliado: null, ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Sofía', apellido: 'Torres', dni: '37890123', obraSocial: 'OSDE', nroAfiliado: '378901', ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Diego', apellido: 'Ramírez', dni: '38901234', obraSocial: 'Galeno', nroAfiliado: '389012', ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
      { nombre: 'Valentina', apellido: 'Flores', dni: '39012345', obraSocial: 'OSDE', nroAfiliado: '390123', ultimaVisita: null, createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('pacientes', pacientes, {});

    const dnis = pacientes.map(p => `'${p.dni}'`).join(', ');
    const [pacientesInsertados] = await queryInterface.sequelize.query(
      `SELECT id FROM pacientes WHERE dni IN (${dnis}) ORDER BY id`
    );

    if (pacientesInsertados.length !== 10) {
      console.log('❌ Error al insertar pacientes');
      return;
    }

    // Contactos asociados a los 10 pacientes
    const contactos = [
      { pacienteId: pacientesInsertados[0].id, email: 'juan.gomez@email.com', telefonoMovil: '1145678901', telefonoFijo: null, preferenciaContacto: 'whatsapp', createdAt: new Date(), updatedAt: new Date() },
      { pacienteId: pacientesInsertados[1].id, email: 'maria.rodriguez@email.com', telefonoMovil: '1145678902', telefonoFijo: null, preferenciaContacto: 'email', createdAt: new Date(), updatedAt: new Date() },
      { pacienteId: pacientesInsertados[2].id, email: 'carlos.fernandez@email.com', telefonoMovil: '1145678903', telefonoFijo: null, preferenciaContacto: 'whatsapp', createdAt: new Date(), updatedAt: new Date() },
      { pacienteId: pacientesInsertados[3].id, email: 'ana.martinez@email.com', telefonoMovil: '1145678904', telefonoFijo: null, preferenciaContacto: 'email', createdAt: new Date(), updatedAt: new Date() },
      { pacienteId: pacientesInsertados[4].id, email: 'luis.lopez@email.com', telefonoMovil: '1145678905', telefonoFijo: null, preferenciaContacto: 'whatsapp', createdAt: new Date(), updatedAt: new Date() },
      { pacienteId: pacientesInsertados[5].id, email: 'laura.sanchez@email.com', telefonoMovil: '1145678906', telefonoFijo: null, preferenciaContacto: 'email', createdAt: new Date(), updatedAt: new Date() },
      { pacienteId: pacientesInsertados[6].id, email: 'pedro.diaz@email.com', telefonoMovil: '1145678907', telefonoFijo: null, preferenciaContacto: 'whatsapp', createdAt: new Date(), updatedAt: new Date() },
      { pacienteId: pacientesInsertados[7].id, email: 'sofia.torres@email.com', telefonoMovil: '1145678908', telefonoFijo: null, preferenciaContacto: 'whatsapp', createdAt: new Date(), updatedAt: new Date() },
      { pacienteId: pacientesInsertados[8].id, email: 'diego.ramirez@email.com', telefonoMovil: '1145678909', telefonoFijo: null, preferenciaContacto: 'email', createdAt: new Date(), updatedAt: new Date() },
      { pacienteId: pacientesInsertados[9].id, email: 'valentina.flores@email.com', telefonoMovil: '1145678910', telefonoFijo: null, preferenciaContacto: 'whatsapp', createdAt: new Date(), updatedAt: new Date() },
    ];

    await queryInterface.bulkInsert('contactos', contactos, {});

    console.log('✅ Pacientes de prueba creados exitosamente');
  },

  async down(queryInterface) {
    const emails = [
      'juan.gomez@email.com', 'maria.rodriguez@email.com', 'carlos.fernandez@email.com',
      'ana.martinez@email.com', 'luis.lopez@email.com', 'laura.sanchez@email.com',
      'pedro.diaz@email.com', 'sofia.torres@email.com', 'diego.ramirez@email.com',
      'valentina.flores@email.com',
    ];
    const dnis = [
      '30123456', '31234567', '32345678', '33456789', '34567890',
      '35678901', '36789012', '37890123', '38901234', '39012345',
    ];
    await queryInterface.sequelize.query(
      `DELETE FROM contactos WHERE email IN (${emails.map(e => `'${e}'`).join(', ')})`
    );
    await queryInterface.sequelize.query(
      `DELETE FROM pacientes WHERE dni IN (${dnis.map(d => `'${d}'`).join(', ')})`
    );
  },
};

