const Medicamento = require('./Medicamento');
const Receta = require('./Receta');
const MedicamentoRecetado = require('./MedicamentoRecetado');
const Paciente = require('../../Clinica/models/Paciente');
const Odontologo = require('../../Usuarios/models/odontologo'); // asumiendo que odontólogo es un tipo de usuario

// Una receta pertenece a un paciente
Receta.belongsTo(Paciente, { foreignKey: 'pacienteId' });
Paciente.hasMany(Receta, { foreignKey: 'pacienteId' });

// Una receta pertenece a un odontólogo
Receta.belongsTo(Odontologo, { foreignKey: 'odontologoId' });
Usuario.hasMany(Receta, { foreignKey: 'odontologoId' });

// Una receta tiene muchos medicamentos recetados
Receta.hasMany(MedicamentoRecetado, { foreignKey: 'recetaId' });
MedicamentoRecetado.belongsTo(Receta, { foreignKey: 'recetaId' });

// Un medicamento recetado se vincula a un medicamento (catalogado)
MedicamentoRecetado.belongsTo(Medicamento, { foreignKey: 'medicamentoId' });
Medicamento.hasMany(MedicamentoRecetado, { foreignKey: 'medicamentoId'});

module.exports = {
  Medicamento,
  Receta,
  MedicamentoRecetado,
  Paciente,
  Usuario
};