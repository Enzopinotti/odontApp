import MedicamentoRepository from '../repositories/MedicamentoRepository.js';
class MedicamentoService{
    async listarMedicamentos(){
        return await MedicamentoRepository.findAll()
    }

    async buscarPorId(id){
        return await MedicamentoRepository.findById(id);
    }
   async obtenerJerarquia() {
    const rows = await MedicamentoRepository.findAll();

    // Transformamos a estructura jerárquica
    const mapa = {};

    rows.forEach((row) => {
      const { nombreGenerico, formaFarmaceutica, dosis, presentacion } = row;

      if (!mapa[nombreGenerico]) {
        mapa[nombreGenerico] = { nombreGenerico, formas: [] };
      }

      let forma = mapa[nombreGenerico].formas.find(
        (f) => f.formaFarmaceutica === formaFarmaceutica
      );
      if (!forma) {
        forma = { formaFarmaceutica, dosis: [] };
        mapa[nombreGenerico].formas.push(forma);
      }

      let dosisObj = forma.dosis.find((d) => d.valor === dosis);
      if (!dosisObj) {
        dosisObj = { valor: dosis, presentaciones: [] };
        forma.dosis.push(dosisObj);
      }

      if (!dosisObj.presentaciones.includes(presentacion)) {
        dosisObj.presentaciones.push(presentacion);
      }
    });

    return Object.values(mapa);
  }

    async crearMedicamento(data) {
  const { nombreGenerico, formaFarmaceutica, concentracion, presentacion } = data;

  if (!nombreGenerico || !formaFarmaceutica || !concentracion || !presentacion) {
    throw new Error("Todos los campos son obligatorios.");
  }

  return await MedicamentoRepository.create(data);
}
async actualizarMedicamento(id, data) {
  if (!id) throw new Error("Se requiere el ID del medicamento.");
  return await MedicamentoRepository.update(id, data);
}
async eliminarMedicamento(id) {
  if (!id) throw new Error("Se requiere el ID del medicamento.");
  return await MedicamentoRepository.delete(id);
}


}

export default new MedicamentoService();