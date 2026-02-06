// backend/src/modules/Clinica/controllers/odontologoController.js
import * as odontologoSvc from '../services/odontologoService.js';

export const listarOdontologos = async (req, res) => {
  const { page = 1, perPage = 20, ...filtros } = req.query;
  const resultado = await odontologoSvc.buscarConFiltros(
    filtros,
    parseInt(page),
    parseInt(perPage)
  );
  res.ok(resultado);
};
/* GET /api/odontologo/:id */
export const obtenerOdontologoPorId = async (req, res) => {
  const odontologo = await odontologoSvc.getById(req.params.id);
  return res.ok(odontologo);
};