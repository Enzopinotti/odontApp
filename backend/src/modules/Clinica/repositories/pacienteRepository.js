import { Paciente } from "../models/index.js";
import { Op } from "sequelize";

class PacienteRepository {
  async findAll() {
    return Paciente.findAll();
  }

  async findById(id) {
    return Paciente.findByPk(id, { include: ['Estado'] });
  }

  async create(data) {
    return Paciente.create(data);
  }

  async update(id, data) {
    const paciente = await this.findById(id);
    if (paciente) {
      return paciente.update(data);
    }
    return null;
  }

  async delete(id) {
    const paciente = await this.findById(id);
    if (paciente) {
      return paciente.destroy();
    }
    return null;
  }

  async findFiltered(filtros = {}, page = 1, perPage = 20) {
    const offset = (page - 1) * perPage;
    const where = {};

    if (filtros.q) {
      where[Op.or] = [
        { nombre: { [Op.like]: `%${filtros.q}%` } },
        { apellido: { [Op.like]: `%${filtros.q}%` } },
        { dni: { [Op.like]: `%${filtros.q}%` } },
      ];
    }

    if (filtros.estadoId) {
      where.estadoId = filtros.estadoId;
    }

    return Paciente.findAndCountAll({
      where,
      limit: perPage,
      offset,
      order: [['apellido', 'ASC']],
      include: ['Estado'],
    });
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