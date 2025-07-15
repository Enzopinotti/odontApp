'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('usuarios', {
      id      : { type: S.INTEGER, autoIncrement: true, primaryKey: true },
      nombre  : { type: S.STRING, allowNull: false },
      apellido: { type: S.STRING, allowNull: false },
      email   : { type: S.STRING, allowNull: false, unique: true },
      password: { type: S.STRING, allowNull: false },
      telefono: S.STRING,
      activo  : { type: S.BOOLEAN, defaultValue: true },
      fechaAlta          : { type: S.DATE, defaultValue: S.fn('NOW') },
      ultimoLogin        : S.DATE,
      passwordChangedAt  : S.DATE,
      RolId   : { type: S.INTEGER, references: { model: 'roles', key: 'id' }, onDelete: 'SET NULL' },
      createdAt: S.DATE,
      updatedAt: S.DATE,
    });
  },
  async down(q) { await q.dropTable('usuarios'); },
};
