/*  Aplica TODAS las relaciones del módulo Clínica.
    Se importa en index.js luego de inicializar todos los modelos. */
export default (models) => {
  const {
    Paciente,
    Contacto,
    Direccion,
    FirmaDigital,
    HistoriaClinica,
    ImagenClinica,
    Odontograma,
    Diente,
    CaraTratada,
    Tratamiento,
    AntecedenteMedico,
    EstadoPaciente,
  } = models;

  /* ---------- Paciente y su Estado ---------- */
  EstadoPaciente.hasMany(Paciente, { foreignKey: 'estadoId' });
  Paciente.belongsTo(EstadoPaciente, { foreignKey: 'estadoId', as: 'Estado' });

  /* ---------- Paciente y datos de contacto ---------- */
  Paciente.hasOne(Contacto, { foreignKey: 'pacienteId', onDelete: 'CASCADE', hooks: true });
  Contacto.belongsTo(Paciente, { foreignKey: 'pacienteId' });

  Contacto.hasOne(Direccion, { foreignKey: 'contactoId', onDelete: 'CASCADE', hooks: true });
  Direccion.belongsTo(Contacto, { foreignKey: 'contactoId' });

  /* ---------- Firma digital del paciente ---------- */
  Paciente.hasOne(FirmaDigital, { foreignKey: 'pacienteId', onDelete: 'CASCADE' });
  FirmaDigital.belongsTo(Paciente, { foreignKey: 'pacienteId' });

  /* ---------- Odontograma completo ---------- */
  Paciente.hasOne(Odontograma, { foreignKey: 'pacienteId', onDelete: 'CASCADE' });
  Odontograma.belongsTo(Paciente, { foreignKey: 'pacienteId' });

  Odontograma.hasMany(Diente, { foreignKey: 'odontogramaId', onDelete: 'CASCADE' });
  Diente.belongsTo(Odontograma, { foreignKey: 'odontogramaId' });

  Diente.hasMany(CaraTratada, { foreignKey: 'dienteId', onDelete: 'CASCADE' });
  CaraTratada.belongsTo(Diente, { foreignKey: 'dienteId' });

  Tratamiento.hasMany(CaraTratada, { foreignKey: 'tratamientoId', onDelete: 'SET NULL' });
  CaraTratada.belongsTo(Tratamiento, { foreignKey: 'tratamientoId' });

  /* ---------- Historia clínica y soporte multimedia ---------- */
  Paciente.hasMany(HistoriaClinica, { foreignKey: 'pacienteId', onDelete: 'CASCADE' });
  HistoriaClinica.belongsTo(Paciente, { foreignKey: 'pacienteId' });

  HistoriaClinica.hasMany(ImagenClinica, { foreignKey: 'historiaClinicaId', onDelete: 'CASCADE' });
  ImagenClinica.belongsTo(HistoriaClinica, { foreignKey: 'historiaClinicaId' });

  /* ---------- Antecedentes médicos ---------- */
  Paciente.hasMany(AntecedenteMedico, { foreignKey: 'pacienteId', onDelete: 'CASCADE' });
  AntecedenteMedico.belongsTo(Paciente, { foreignKey: 'pacienteId' });
};
