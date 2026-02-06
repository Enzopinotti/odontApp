
// 🔁 Asociación principal
export function applyAssociations({ Receta, Medicamento, MedicamentoRecetado, Paciente, Odontologo }) {
  // Una receta pertenece a un paciente
  Receta.belongsTo(Paciente, { foreignKey: 'pacienteId', as: 'paciente' });
  Paciente.hasMany(Receta, { foreignKey: 'pacienteId' });

  // Una receta pertenece a un odontólogo
  Receta.belongsTo(Odontologo, { foreignKey: 'odontologoId', as: 'odontologo' });
  Odontologo.hasMany(Receta, { foreignKey: 'odontologoId' });

  // Una receta tiene muchos medicamentos recetados
  Receta.hasMany(MedicamentoRecetado, { foreignKey: 'recetaId', as: 'medicamentos' });
  MedicamentoRecetado.belongsTo(Receta, { foreignKey: 'recetaId' });

  // Un medicamento recetado se vincula a un medicamento (catálogo)
  MedicamentoRecetado.belongsTo(Medicamento, { foreignKey: 'medicamentoId', as: 'medicamento' });
  Medicamento.hasMany(MedicamentoRecetado, { foreignKey: 'medicamentoId' });
}
