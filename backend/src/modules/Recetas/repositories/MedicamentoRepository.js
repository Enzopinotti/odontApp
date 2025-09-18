import { Medicamento } from '../models/index.js';
import { sequelize } from "../../../config/db.js";
import { where } from "sequelize";



class MedicamentoRepository {
  async findAll() {
    return Medicamento.findAll({
      attributes: ["nombreGenerico", "formaFarmaceutica", "dosis", "presentacion"],
      raw: true,
    });
  }

  async findById(id) {
    return Medicamento.findByPk(id);
  }

  async create(data) {
    return Medicamento.create(data);
  }

  async update(id, data) {
    const medicamento = await this.findById(id);
    if (medicamento) {
      return medicamento.update(data);
    }
    throw new Error("Medicamento no encontrado");
  }

  async delete(id) {
    const medicamento = await this.findById(id);
    if (medicamento) {
      return medicamento.destroy();
    }
    throw new Error("Medicamento no encontrado");
  }
}
export default new MedicamentoRepository();