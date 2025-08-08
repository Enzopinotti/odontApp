import  Medicamento  from "../models/Medicamento.js";
import { sequelize } from "../../../config/db.js";
import { where } from "sequelize";

class MedicamentoRepository {
  async findAll() {
    return Medicamento.findAll();
  }

  async findById(id) {
    return Medicamento.findByPk(id);
  }

  //obtiene listado de nombres genericos de medicamentos
  async obtenerNombresGenericos() {
    return Medicamento.findAll({
      attributes:[nombreGenerico],
      group: [nombreGenerico]
    });
  }
//obtiene listado de las formas farmaceuticas de cada nombre generico
  async obtenerFormasFarmaceuticas(nombreGenerico){
    return Medicamento.findAll({
        attributes:['formaFarmaceutica'],
        where:{nombreGenerico},
        group:['formaFarmaceutica']
    });
  }
//una vez seleccionado nombre y forma obtiene las dosis correspondientes de medicamentos 
//que cumplen con dichas caracteristicas
  async obtenerDosis(nombreGenerico,formaFarmaceutica){
    return Medicamento.findAll({
        attributes:['dosis'],
        where:{nombreGenerico,formaFarmaceutica},
        group:['dosis']
    });
  }
//filtra x nombregenerico formafarmaceutica y dosis
  async obtenerPresentaciones(nombreGenerico, formaFarmaceutica,dosis){
    return Medicamento.findAll({
        attributes:['presentacion'],
        where:{nombreGenerico,formaFarmaceutica,dosis},
        group: ['presentacion']
    })
  }
  //filtra x nombregenerico formafarmaceutica dosis presentacion
  async obtenerMedicamentoCompleto(nombreGenerico,formaFarmaceutica,dosis,presentacion){
    return Medicamento.findOne({
        where:{
            nombreGenerico,
            formaFarmaceutica,
            dosis,
            presentacion
        }
    })
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