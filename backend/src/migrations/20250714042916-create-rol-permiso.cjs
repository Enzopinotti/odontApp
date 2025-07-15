'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('rol_permisos', {
      RolId    : { type: S.INTEGER, references: { model: 'roles',    key: 'id' }, onDelete: 'CASCADE' },
      PermisoId: { type: S.INTEGER, references: { model: 'permisos', key: 'id' }, onDelete: 'CASCADE' },
    });
    await q.addConstraint('rol_permisos', {
      fields: ['RolId', 'PermisoId'],
      type  : 'primary key',
      name  : 'rol_permiso_pk',
    });
  },
  async down(q) { await q.dropTable('rol_permisos'); },
};
