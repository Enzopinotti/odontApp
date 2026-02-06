'use strict';
module.exports = {
  async up(q) {
    const now = new Date();
    const [existing] = await q.sequelize.query('SELECT id FROM especialidades');
    const data = [
      { id: 1, nombre: 'Endodoncia', descripcion: 'Tratamiento de conducto', activa: true },
      { id: 2, nombre: 'Ortodoncia', descripcion: 'Corrección dental', activa: true },
      { id: 3, nombre: 'Cirugía', descripcion: 'Cirugía bucal y maxilofacial', activa: true },
    ].filter(e => !existing.some(ex => ex.id === e.id));

    if (data.length > 0) {
      await q.bulkInsert('especialidades', data, {});
    }
  },
  async down(q) {
    await q.bulkDelete('especialidades', null, {});
  },
};
