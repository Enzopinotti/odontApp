import RecetaRepository from "../repositories/recetaRepository.js";
import PacienteRepository from "../../Clinica/repositories/pacienteRepository.js";
import ApiError from "../../../utils/ApiError.js";
class RecetaService {
  async listarRecetas() {
    return RecetaRepository.findAll();
  }
  async obtenerRecetaPorId(id) {
    return RecetaRepository.findById(id);
  }
  async listarRecetasPorOdontologo(odontologoId) {
    return RecetaRepository.findByOdontologoId(odontologoId);
  }

  async listarRecetasPorPaciente(pacienteId) {
    return RecetaRepository.findByPacienteId(pacienteId);
  }
  async crearReceta(data, medicamentos) {
    const { pacienteId, odontologoId, diagnostico, indicaciones } = data;
    const paciente = await PacienteRepository.findById(pacienteId);
    if (!paciente) {
      throw new ApiError("Paciente no encontrado");
    }
    if (medicamentos.length > 10) {
      throw new Error("Máximo 10 medicamentos por receta");
    }
    const receta = await RecetaRepository.createWithMedicamentos(
      data,
      medicamentos
    );
    return RecetaRepository.findById(receta.id);
  }
  async actualizar(id, payload) {
    const updated = await RecetaRepo.update(id, payload);
    if (!updated) throw new Error("Receta no encontrada");
    return updated;
  }

  async eliminar(id) {
    const deleted = await RecetaRepo.delete(id);
    if (!deleted) throw new Error("Receta no encontrada");
  }
}
export default new RecetaService();
