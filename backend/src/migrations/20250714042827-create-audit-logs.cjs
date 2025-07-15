'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('audit_logs', {
      id      : { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      recurso : { type: S.STRING, allowNull: false },
      accion  : { type: S.STRING, allowNull: false },
      ip      : S.STRING,
      UsuarioId: { type: S.INTEGER, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: S.DATE,
    });
  },
  async down(q) { await q.dropTable('audit_logs'); },
};
