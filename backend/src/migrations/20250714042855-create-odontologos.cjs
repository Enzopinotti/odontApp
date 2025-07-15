'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('odontologos', {
      userId  : { type: S.INTEGER, primaryKey: true, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
      matricula: { type: S.STRING, allowNull: false },
    });
  },
  async down(q) { await q.dropTable('odontologos'); },
};
