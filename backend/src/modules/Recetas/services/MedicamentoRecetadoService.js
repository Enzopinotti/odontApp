// modules/Recetas/services/MedicamentoRecetadoService.js
import MedicRecRepo from '../repositories/MedicamentoRecetadoRepository.js';
import RecetaRepo from '../repositories/recetaRepository.js';
import ApiError      from '../../../utils/ApiError.js';

class MedicamentoRecetadoService {
  /**
   * Listar todos los ítems de una receta
   */
  async listarPorReceta(recetaId) {
    // Verificar que la receta exista
    const receta = await RecetaRepo.findById(recetaId);
    if (!receta) throw new ApiError('Receta no encontrada', 404);
    return MedicRecRepo.findByRecetaId(recetaId);
  }

}

export default new MedicamentoRecetadoService();
