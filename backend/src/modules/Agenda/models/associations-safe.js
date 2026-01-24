// Asociaciones seguras para el módulo de Agenda - solo modelos locales
export default (models) => {
  const { Turno, Disponibilidad, Nota } = models;

  // Solo asociaciones internas del módulo Agenda
  if (Turno && Nota) {
    Turno.hasMany(Nota, {
      as: 'Notas',
      foreignKey: 'turnoId',
      onDelete: 'CASCADE'
    });

    Nota.belongsTo(Turno, {
      as: 'Turno',
      foreignKey: 'turnoId'
    });
  }

  // Las asociaciones con otros módulos se manejan en el index principal de la aplicación
  console.log('✅ Asociaciones internas del módulo Agenda aplicadas correctamente');
};




