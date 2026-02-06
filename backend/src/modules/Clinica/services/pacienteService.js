import pacienteRepository from "../repositories/pacienteRepository.js";
import ApiError from "../../../utils/ApiError.js";

class PacienteService {
  async listarPacientes() {
    return pacienteRepository.findAll();
  }

  async obtenerPorId(id) {
    const paciente = await pacienteRepository.findById(id);
    if (!paciente) return null;
    return paciente;
  }

  async crear(data) {
    const nuevo = await pacienteRepository.create(data);
    return nuevo;
  }

  async actualizar(id, data) {
    const actualizado = await pacienteRepository.update(id, data);
    return actualizado;
  }

  async eliminar(id) {
    const eliminado = await pacienteRepository.delete(id);
    return eliminado;
  }

  async buscarConFiltros(filtros, page, perPage) {
    return pacienteRepository.findFiltered(filtros, page, perPage);
  }

  async buscarPacientes(texto) {
    if (!texto || texto.trim() === "") {
      throw new ApiError('Falta parámetro de búsqueda', 400);
    }
    return pacienteRepository.findByNombreApellidoODni(texto);
  }
}

export default new PacienteService();