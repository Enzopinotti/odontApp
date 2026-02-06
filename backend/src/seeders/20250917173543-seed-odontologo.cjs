'use strict';

const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 1️⃣ Crear usuario con rol Odontólogo
    const [existingUser] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'odontologo@odontapp.com';"
    );

    let userId;
    if (existingUser.length === 0) {
      await queryInterface.bulkInsert('usuarios', [
        {
          nombre: 'Branko',
          apellido: 'Iriart',
          email: 'odontologo@odontapp.com',
          password: await bcrypt.hash('odontologo123', 10),
          telefono: '2215558899',
          activo: true,
          fechaAlta: now,
          RolId: 2, // Odontólogo
          createdAt: now,
          updatedAt: now,
        },
      ]);
      const [newUsers] = await queryInterface.sequelize.query(
        "SELECT id FROM usuarios WHERE email = 'odontologo@odontapp.com';"
      );
      userId = newUsers[0].id;
    } else {
      userId = existingUser[0].id;
    }

    // 2️⃣ Crear odontólogo vinculado al usuario
    const [existingOdonto] = await queryInterface.sequelize.query(
      `SELECT userId FROM odontologos WHERE userId = ${userId};`
    );
    if (existingOdonto.length === 0) {
      await queryInterface.bulkInsert('odontologos', [
        {
          userId: userId,
          matricula: 'MAT-12345',
        },
      ]);
    }

    // 3️⃣ Relacionar odontólogo con especialidad (ejemplo: Ortodoncia con id=2)
    const [existingRel] = await queryInterface.sequelize.query(
      `SELECT odontologoUserId FROM odontologo_especialidad WHERE odontologoUserId = ${userId} AND especialidadId = 2;`
    );
    if (existingRel.length === 0) {
      await queryInterface.bulkInsert('odontologo_especialidad', [
        {
          odontologoUserId: userId,
          especialidadId: 2,
        },
      ]);
    }
  },

  async down(queryInterface) {
    // Borrar relación
    const [users] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'odontologo@odontapp.com';"
    );
    if (users.length) {
      const userId = users[0].id;

      await queryInterface.bulkDelete('odontologo_especialidad', {
        odontologoUserId: userId,
      });
      await queryInterface.bulkDelete('odontologos', { userId });
      await queryInterface.bulkDelete('usuarios', {
        email: 'odontologo@odontapp.com',
      });
    }
  },
};
