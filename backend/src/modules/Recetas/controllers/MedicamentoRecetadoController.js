import MedicRecService from '../services/MedicamentoRecetadoService.js';

export const listarItems = async (req, res, next) => {
  const { recetaId } = req.params;
  try {
    const items = await MedicRecService.listarPorReceta(recetaId);
    res.status(200).json(items);
  } catch (error) {
    next(error);
  }
};
