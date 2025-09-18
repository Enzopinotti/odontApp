// backend/src/modules/Clinica/services/odontologoService.js
import * as repo from '../repositories/odontologoRepository.js';

export const buscarConFiltros = async (filtros, page, perPage) => {
  const resultado = await repo.findFiltered(filtros, page, perPage);
  return {
    data: resultado.rows.map((o) => o.toJSON()),
    total: resultado.count,
  };
};

export const getById = async (id) => {
  const odontologo = await repo.findById(id);
  if (!odontologo) {
    throw new ApiError('Odontologo no encontrado', 404, null, 'ODONTOLOGO_INEXISTENTE');
  }
  return odontologo;
};
