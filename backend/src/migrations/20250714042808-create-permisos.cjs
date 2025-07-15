'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('permisos', {
      id      : { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      recurso : { type: S.STRING, allowNull: false },
      accion  : { type: S.STRING, allowNull: false },
    });
    await q.addConstraint('permisos', {
      fields: ['recurso', 'accion'],
      type  : 'unique',
      name  : 'permiso_recurso_accion_uk',
    });
  },
  async down(q) { await q.dropTable('permisos'); },
};
