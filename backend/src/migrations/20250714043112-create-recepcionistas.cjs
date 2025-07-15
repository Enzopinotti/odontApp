'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('recepcionistas', {
      userId: { type: S.INTEGER, primaryKey: true, references: { model: 'usuarios', key: 'id' }, onDelete: 'CASCADE' },
    });
  },
  async down(q) { await q.dropTable('recepcionistas'); },
};
