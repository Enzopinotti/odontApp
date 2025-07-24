// backend/src/modules/Usuarios/models/associations.js
/*  Recibe el objeto models generado por Sequelize y aplica TODAS las relaciones */
export default (models) => {
  const {
    Odontologo,
    Paciente,
    Receta,
    MedicamentoRecetado,
    Medicamento,
  } = models;

  
  //Receta
  Receta.belongsTo(Paciente, {
    foreignKey: "pacienteId",
    as: "paciente",
  });
  Receta.belongsTo(Odontologo, {
    foreignKey: "userId",
    as: "odontologo",
  });
  Receta.hasMany(MedicamentoRecetado, {
    foreignKey: "recetaId",
    as: "medicamentosRecetados",
  });

  //MedicamentoRecetado
  MedicamentoRecetado.belongsTo(Receta, {
    foreignKey: "recetaId",
    as: "receta",
  });
  MedicamentoRecetado.belongsTo(Medicamento, {
    foreignKey: "medicamentoId",
    as: "medicamento",
  });
  //Medicamento
  Medicamento.hasMany(MedicamentoRecetado, {
    foreignKey: "medicamentoId",
    as: "usosRecetados",
  });
};
