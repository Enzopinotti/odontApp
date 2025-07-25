import { MedicamentoRecetado, Medicamento } from "../models";

class MedicamentoRecetadoRepository {
  async findByRecetaId(recetaId) {
    return MedicamentoRecetado.findAll({
      where: { recetaId },
      include: [{ model: Medicamento, as: "medicamento" }],
    });
  }
  async create(item, transaction) {
    return MedicamentoRecetado.create(item, { transaction });
  }
  async bulkCreate(items, transaction) {
    return MedicamentoRecetado.bulkCreate(items, { transaction });
  }


}

export default new MedicamentoRecetadoRepository();
