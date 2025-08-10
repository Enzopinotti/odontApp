import PacienteRepository from "../repositories/PacienteRepository.js";
import ApiError from "../../../utils/ApiError.js";

class PacienteService {
  async listarPacientes() {
    return PacienteRepository.findAll();
  }

  async obtenerPacientePorId(id) {
    const paciente = await PacienteRepository.findById(id);
    if (!paciente) {
      throw new ApiError(404, "Paciente no encontrado");
    }     
    return paciente;
  }
   async crearPaciente(data) {    
    const nuevo = await PacienteRepository.create(data);
    return this.obtenerPacientePorId(nuevo.id);    
}
    async actualizarPaciente(id, data) {
       await this.obtenerPacientePorId(id);       
        const actualizado = await PacienteRepository.update(id, data);
        if (!actualizado) {
        throw new ApiError(404, "Paciente no encontrado");
        }
        return actualizado;
    }
    
    async eliminarPaciente(id) {
        await this.obtenerPacientePorId(id);
        const eliminado = await PacienteRepository.delete(id);
        if (!eliminado) {
        throw new ApiError(404, "Paciente no encontrado");
        }
    }
     async buscarPacientes(texto) {
    if (!texto || texto.trim() === "") {
      throw new ApiError(400, "Falta parámetro de búsqueda");
    }
    return PacienteRepository.findByNombreApellidoODni(texto);
  }

}
export default new PacienteService();