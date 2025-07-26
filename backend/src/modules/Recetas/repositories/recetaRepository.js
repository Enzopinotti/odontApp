import  Receta  from "../models/Receta.js";
import MedicamentoRecetado from '../models/MedicamentoRecetado.js';
import Medicamento from '../models/Medicamento.js'; 
import {Paciente}  from "../../Clinica/models/index.js";
import {Odontologo}   from "../../Usuarios/models/index.js";
import { sequelize } from "../../../../config/db.js";

class RecetaRepository {
  async findAll() {
    return Receta.findAll({
      include: [
        { model: Paciente, as: "paciente" },
        { model: Odontologo, as: "odontologo" },
        {
          model: MedicamentoRecetado,
          as: "medicamentos",
          include: [{ model: Medicamento, as: "medicamento" }],
        },
      ],
    });
  }

  async findById(id) {
    return Receta.findByPk(id, {
      include: [
        { model: Paciente, as: "paciente" },
        { model: Odontologo, as: "odontologo" },
        {
          model: MedicamentoRecetado,
          as: "medicamentos",
          include: [{ model: Medicamento, as: "medicamento" }],
        },
      ],
    });
  }

  async findByOdontologoId(odontologoId) {
    return Receta.findAll({
      where: { odontologoId },
      include: [
        { model: Paciente, as: "paciente" },
        { model: Odontologo, as: "odontologo" },
        {
          model: MedicamentoRecetado,
          as: "medicamentos",
          include: [{ model: Medicamento, as: "medicamento" }],
        },
      ],
    });
  }
  async findByPacienteId(pacienteId) {
    return Receta.findAll({
      where: { pacienteId },
      include: [
        { model: Paciente, as: "paciente" },
        { model: Odontologo, as: "odontologo" },
        {
          model: MedicamentoRecetado,
          as: "medicamentos",
          include: [{ model: Medicamento, as: "medicamento" }],
        },
      ],
    });
  }
  async createWithMedicamentos(data, medicamentos) {
    return sequelize.transaction(async (transaction) => {
      const receta = await Receta.create(data, { transaction });
      if (medicamentos && medicamentos.length > 0) {
        const medicamentosRecetados = medicamentos.map((medicamento) => ({
          ...medicamento,
          recetaId: receta.id,
        }));
        await MedicamentoRecetado.bulkCreate(medicamentosRecetados, {
          transaction,
        });
      }
      return receta;
    });
  }
}
export default new RecetaRepository();