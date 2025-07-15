'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('email_verification_tokens', {
      id     : { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      token  : { type: S.STRING, allowNull: false },
      expire : { type: S.DATE,   allowNull: false },
      usado  : { type: S.BOOLEAN, defaultValue: false },
      UsuarioId: { type: S.INTEGER, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
      createdAt: S.DATE,
      updatedAt: S.DATE,
    });
  },
  async down(q) { await q.dropTable('email_verification_tokens'); },
};
