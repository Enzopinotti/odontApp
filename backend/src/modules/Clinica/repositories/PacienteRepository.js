import {Paciente} from '../models/Paciente.js';
import {sequelize} from '../../../../config/db.js';
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
}   
export default new PacienteRepository();