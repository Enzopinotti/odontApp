import MedicamentoRepository from "../repositories/MedicamentoRepository";
class MedicamentoService{
    async listarMedicamentos(){
        return await MedicamentoRepository.findAll()
    }

    async buscarPorId(id){
        return await MedicamentoRepository.findById(id);
    }
    async listarNombresgenericos(){
        return await MedicamentoRepository.obtenerNombreGenericos();
    }
    async listarFormasFarmaceuticas(nombreGenerico){
        if(!nombreGenerico) throw new Error('El nombre generico es obligatorio');
        return await MedicamentoRepository.obtenerFormarFarmaceuticas(nombreGenerico);
    }
    async listarDosis(nombreGenerico,formaFarmaceutica){
        if(!nombreGenerico || !formaFarmaceutica){
            throw new Error('faltan datos para buscar dosis')
        }
        return await MedicamentoRepository.obtenerDosis(nombreGenerico,formaFarmaceutica);
    }
    async listarPresentaciones(nombreGenerico,formaFarmaceutica,dosis){
        if(!nombreGenerico||!formaFarmaceutica||!dosis){
            throw new Error('faltan datos para buscar presentaciones')
        }
        return await MedicamentoRepository.obtenerPresentaciones(nombreGenerico,formaFarmaceutica,dosis)
    }
    async obtenerMedicamento(nombreGenerico,formaFarmaceutica,dosis,presentacion){
         if(!nombreGenerico||!formaFarmaceutica||!dosis||!presentacion){
            throw new Error('faltan datos para buscar medicamento')
        }
        return await MedicamentoRepository.obtenerMedicamentoCompleto(nombreGenerico,formaFarmaceutica,dosis,presentacion)
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