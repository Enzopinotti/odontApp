'use strict';
module.exports = {
  async up(q) {
    const now = new Date();
    await q.bulkInsert('especialidades', [
      { id: 1, nombre: 'Endodoncia', descripcion: 'Tratamiento de conducto', activa: true},
      { id: 2, nombre: 'Ortodoncia', descripcion: 'Corrección dental', activa: true },
      { id: 3, nombre: 'Cirugía', descripcion: 'Cirugía bucal y maxilofacial', activa: true },
    ]);
  },
  async down(q) {
    await q.bulkDelete('especialidades', null, {});
  },
};
