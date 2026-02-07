'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Modificamos la columna para AGREGAR 'ENVIADO' al principio y ponerlo como DEFAULT
    await queryInterface.sequelize.query(`
      ALTER TABLE facturas 
      MODIFY COLUMN estado 
      ENUM('ENVIADO', 'PENDIENTE_PAGO', 'PAGADO', 'ANULADO') 
      NOT NULL 
      DEFAULT 'ENVIADO';
    `);
  },

  async down (queryInterface, Sequelize) {
    // REVERSIBLE: Volvemos a la definición anterior (sin 'ENVIADO')
    // Nota: Si hay filas con 'ENVIADO', esto podría fallar o convertir los datos a '' dependiendo de la config de MySQL.
    // Por seguridad, primero actualizamos los 'ENVIADO' a 'PENDIENTE_PAGO' antes de revertir la estructura.
    
    await queryInterface.sequelize.query(`
      UPDATE facturas SET estado = 'PENDIENTE_PAGO' WHERE estado = 'ENVIADO';
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE facturas 
      MODIFY COLUMN estado 
      ENUM('PENDIENTE_PAGO', 'PAGADO', 'ANULADO') 
      NOT NULL 
      DEFAULT 'PENDIENTE_PAGO';
    `);
  }
};