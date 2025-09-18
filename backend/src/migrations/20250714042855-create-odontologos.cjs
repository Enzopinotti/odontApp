'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('odontologos', {
      userId: {
        type: S.INTEGER,
        primaryKey: true,
        references: { model: 'usuarios', key: 'id' },
        onDelete: 'CASCADE',
      },
      matricula: { type: S.STRING, allowNull: false, unique: true },
      nombre: { type: S.STRING, allowNull: false },
      apellido: { type: S.STRING, allowNull: false },
      firmaDigital: { type: S.STRING, allowNull: false },
      createdAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
      updatedAt: { type: S.DATE, allowNull: false, defaultValue: S.fn('NOW') },
    });
  },
  async down(q) {
    await q.dropTable('odontologos');
  },
};
