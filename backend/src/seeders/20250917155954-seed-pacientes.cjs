'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const pacientes = [
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '30111222',
        fechaNacimiento: new Date('1985-06-15'),
        sexo: 'Masculino',
        obraSocial: 'OSDE',
        nroAfiliado: 'OS123456',
      },
      {
        nombre: 'María',
        apellido: 'Gómez',
        dni: '29333444',
        fechaNacimiento: new Date('1990-03-22'),
        sexo: 'Femenino',
        obraSocial: 'IOMA',
        nroAfiliado: 'IO654321',
      },
      {
        nombre: 'Carlos',
        apellido: 'Fernández',
        dni: '32444555',
        fechaNacimiento: new Date('1978-11-09'),
        sexo: 'Masculino',
        obraSocial: null,
        nroAfiliado: null,
      },
      {
        nombre: 'Lucía',
        apellido: 'Martínez',
        dni: '31222333',
        fechaNacimiento: new Date('1995-01-05'),
        sexo: 'Femenino',
        obraSocial: 'Swiss Medical',
        nroAfiliado: 'SM998877',
      },
      {
        nombre: 'Andrés',
        apellido: 'Lopez',
        dni: '28555111',
        fechaNacimiento: new Date('1982-09-30'),
        sexo: 'Masculino',
        obraSocial: 'OSDE',
        nroAfiliado: 'OS778899',
      },
      {
        nombre: 'Paula',
        apellido: 'Rodríguez',
        dni: '30999888',
        fechaNacimiento: new Date('1993-12-18'),
        sexo: 'Femenino',
        obraSocial: 'Galeno',
        nroAfiliado: 'GA445566',
      },
      {
        nombre: 'Miguel',
        apellido: 'Torres',
        dni: '27777111',
        fechaNacimiento: new Date('1970-07-11'),
        sexo: 'Masculino',
        obraSocial: null,
        nroAfiliado: null,
      },
      {
        nombre: 'Sofía',
        apellido: 'Ramírez',
        dni: '33000222',
        fechaNacimiento: new Date('2000-04-27'),
        sexo: 'Femenino',
        obraSocial: 'IOMA',
        nroAfiliado: 'IO112233',
      },
      {
        nombre: 'Diego',
        apellido: 'Alvarez',
        dni: '29555444',
        fechaNacimiento: new Date('1987-02-14'),
        sexo: 'Masculino',
        obraSocial: 'PAMI',
        nroAfiliado: 'PA667788',
      },
      {
        nombre: 'Camila',
        apellido: 'Suárez',
        dni: '32222111',
        fechaNacimiento: new Date('1991-08-03'),
        sexo: 'Femenino',
        obraSocial: 'OSDE',
        nroAfiliado: 'OS445522',
      }
    ];

    const now = new Date();
    const [existing] = await queryInterface.sequelize.query('SELECT dni FROM pacientes');

    const withTimestamps = pacientes
      .filter(p => !existing.some(ex => ex.dni === p.dni))
      .map(p => ({
        ...p,
        createdAt: now,
        updatedAt: now
      }));

    if (withTimestamps.length > 0) {
      await queryInterface.bulkInsert('pacientes', withTimestamps, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('pacientes', null, {});
  }
};
