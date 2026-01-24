// Archivo de asociaciones para el módulo de Agenda
export default (models) => {
  const { Turno, Disponibilidad, Nota, Usuario, Odontologo, Paciente } = models;

  // Asociaciones del modelo Turno
  Turno.belongsTo(Paciente, {
    as: 'Paciente',
    foreignKey: 'pacienteId'
  });

  Turno.belongsTo(Odontologo, {
    as: 'Odontologo',
    foreignKey: 'odontologoId'
  });

  Turno.belongsTo(Usuario, {
    as: 'Recepcionista',
    foreignKey: 'recepcionistaId'
  });

  Turno.hasMany(Nota, {
    as: 'Notas',
    foreignKey: 'turnoId',
    onDelete: 'CASCADE'
  });

  // Asociaciones del modelo Disponibilidad
  Disponibilidad.belongsTo(Odontologo, {
    as: 'Odontologo',
    foreignKey: 'odontologoId'
  });

  // Asociaciones del modelo Nota
  Nota.belongsTo(Turno, {
    as: 'Turno',
    foreignKey: 'turnoId'
  });

  Nota.belongsTo(Usuario, {
    as: 'Usuario',
    foreignKey: 'usuarioId'
  });

  // Asociaciones inversas
  Paciente.hasMany(Turno, {
    as: 'Turnos',
    foreignKey: 'pacienteId'
  });

  Odontologo.hasMany(Turno, {
    as: 'Turnos',
    foreignKey: 'odontologoId'
  });

  Odontologo.hasMany(Disponibilidad, {
    as: 'Disponibilidades',
    foreignKey: 'odontologoId'
  });

  Usuario.hasMany(Turno, {
    as: 'TurnosGestionados',
    foreignKey: 'recepcionistaId'
  });

  Usuario.hasMany(Nota, {
    as: 'Notas',
    foreignKey: 'usuarioId'
  });
};
