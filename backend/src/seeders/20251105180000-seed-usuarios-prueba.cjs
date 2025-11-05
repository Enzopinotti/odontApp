'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Verificar si ya existen usuarios de prueba
    const [usuariosExistentes] = await queryInterface.sequelize.query(
      "SELECT email FROM usuarios WHERE email LIKE 'odontologo%@odontapp.com' OR email LIKE 'recepcionista%@odontapp.com'"
    );
    
    if (usuariosExistentes.length > 0) {
      console.log('⚠️  Usuarios de prueba ya existen. Saltando creación.');
      return;
    }

    // Obtener IDs de roles
    const [roles] = await queryInterface.sequelize.query(
      "SELECT id, nombre FROM roles WHERE nombre IN ('Odontólogo', 'Recepcionista')"
    );
    
    const rolOdontologo = roles.find(r => r.nombre === 'Odontólogo')?.id;
    const rolRecepcionista = roles.find(r => r.nombre === 'Recepcionista')?.id;

    if (!rolOdontologo || !rolRecepcionista) {
      throw new Error('Roles no encontrados. Ejecuta primero el seeder de roles.');
    }

    /* 👨‍⚕️ ODONTÓLOGOS DE PRUEBA ------------------------- */
    const odontologos = [
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'odontologo1@odontapp.com',
        password: await bcrypt.hash('odontologo123', 10),
        RolId: rolOdontologo,
        activo: true,
        telefono: '1123456789',
        fechaAlta: new Date(),
      },
      {
        nombre: 'María',
        apellido: 'García',
        email: 'odontologo2@odontapp.com',
        password: await bcrypt.hash('odontologo123', 10),
        RolId: rolOdontologo,
        activo: true,
        telefono: '1123456790',
        fechaAlta: new Date(),
      },
      {
        nombre: 'Carlos',
        apellido: 'López',
        email: 'odontologo3@odontapp.com',
        password: await bcrypt.hash('odontologo123', 10),
        RolId: rolOdontologo,
        activo: true,
        telefono: '1123456791',
        fechaAlta: new Date(),
      },
    ];

    // Insertar usuarios odontólogos
    await queryInterface.bulkInsert('usuarios', odontologos, {});

    // Obtener IDs de los odontólogos insertados
    const [odontologosInsertados] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email IN ('odontologo1@odontapp.com', 'odontologo2@odontapp.com', 'odontologo3@odontapp.com') ORDER BY id"
    );

    // Crear registros en tabla odontologos
    const odontologosRegistros = odontologosInsertados.map((row, index) => ({
      userId: row.id,
      matricula: `MAT-${String(row.id).padStart(4, '0')}`,
    }));

    await queryInterface.bulkInsert('odontologos', odontologosRegistros, {});

    /* 👩‍💼 RECEPCIONISTAS DE PRUEBA ------------------------ */
    const recepcionistas = [
      {
        nombre: 'Sofía',
        apellido: 'Borda',
        email: 'recepcionista1@odontapp.com',
        password: await bcrypt.hash('recepcionista123', 10),
        RolId: rolRecepcionista,
        activo: true,
        telefono: '1123456792',
        fechaAlta: new Date(),
      },
      {
        nombre: 'Ana',
        apellido: 'Martínez',
        email: 'recepcionista2@odontapp.com',
        password: await bcrypt.hash('recepcionista123', 10),
        RolId: rolRecepcionista,
        activo: true,
        telefono: '1123456793',
        fechaAlta: new Date(),
      },
      {
        nombre: 'Laura',
        apellido: 'Fernández',
        email: 'recepcionista3@odontapp.com',
        password: await bcrypt.hash('recepcionista123', 10),
        RolId: rolRecepcionista,
        activo: true,
        telefono: '1123456794',
        fechaAlta: new Date(),
      },
    ];

    // Insertar usuarios recepcionistas
    await queryInterface.bulkInsert('usuarios', recepcionistas, {});

    // Obtener IDs de los recepcionistas insertados
    const [recepcionistasInsertados] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email IN ('recepcionista1@odontapp.com', 'recepcionista2@odontapp.com', 'recepcionista3@odontapp.com') ORDER BY id"
    );

    // Crear registros en tabla recepcionistas
    const recepcionistasRegistros = recepcionistasInsertados.map((row) => ({
      userId: row.id,
    }));

    await queryInterface.bulkInsert('recepcionistas', recepcionistasRegistros, {});

    console.log('✅ Usuarios de prueba creados exitosamente');
  },

  async down(queryInterface) {
    const { Op } = require('sequelize');
    
    // Eliminar recepcionistas
    await queryInterface.sequelize.query(
      "DELETE FROM recepcionistas WHERE userId IN (SELECT id FROM usuarios WHERE email LIKE 'recepcionista%@odontapp.com')"
    );
    await queryInterface.sequelize.query(
      "DELETE FROM odontologos WHERE userId IN (SELECT id FROM usuarios WHERE email LIKE 'odontologo%@odontapp.com')"
    );
    
    // Eliminar usuarios (excepto admin)
    await queryInterface.bulkDelete('usuarios', {
      email: {
        [Op.like]: '%@odontapp.com'
      }
    }, {
      where: {
        email: {
          [Op.ne]: 'admin@odontapp.com'
        }
      }
    });
  },
};

