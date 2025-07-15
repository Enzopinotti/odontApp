'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('especialidades', {
      id         : { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      nombre     : { type: S.STRING, allowNull: false },
      descripcion: S.STRING,
      activa     : { type: S.BOOLEAN, defaultValue: true },
    });
  },
  async down(q) { await q.dropTable('especialidades'); },
};
