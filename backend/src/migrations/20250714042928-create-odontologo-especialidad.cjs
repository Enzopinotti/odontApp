'use strict';
module.exports = {
  async up(q, S) {
    await q.createTable('odontologo_especialidad', {
      OdontologoUserId: { type: S.INTEGER, references: { model: 'odontologos',    key: 'userId' }, onDelete: 'CASCADE' },
      EspecialidadId  : { type: S.INTEGER, references: { model: 'especialidades', key: 'id'     }, onDelete: 'CASCADE' },
    });
    await q.addConstraint('odontologo_especialidad', {
      fields: ['OdontologoUserId', 'EspecialidadId'],
      type  : 'primary key',
      name  : 'odontologo_especialidad_pk',
    });
  },
  async down(q) { await q.dropTable('odontologo_especialidad'); },
};
