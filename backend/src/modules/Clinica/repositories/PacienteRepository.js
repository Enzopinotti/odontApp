import { Paciente } from "../models/index.js";
"../../../config/db.js";
import { Op } from "sequelize";

class PacienteRepository {
  async findAll() {
    return Paciente.findAll();
  }

  async findById(id) {
    return Paciente.findByPk(id);
  }

  async create(data) {
    return Paciente.create(data);
  }

  async update(id, data) {
    const paciente = await this.findById(id);
    if (paciente) {
      return paciente.update(data);
    }
    throw new Error('Paciente not found');
  }

  async delete(id) {
    const paciente = await this.findById(id);
    if (paciente) {
      return paciente.destroy();
    }
    throw new Error('Paciente not found');
  }
   async findByNombreApellidoODni(texto) {
    return Paciente.findAll({
      where: {
        [Op.or]: [
          { nombre: { [Op.like]: `%${texto}%` } },
          { apellido: { [Op.like]: `%${texto}%` } },
          { dni: { [Op.like]: `%${texto}%` } },
        ],
      },
      limit: 5,
      order: [["apellido", "ASC"]],
    });
  }
}   
export default new PacienteRepository();