import { Medicamento } from '../../Usuarios/models/index.js';
import { Op } from 'sequelize';


export const buscarMedicamentos = async (req, res) => {
  const q = req.query.q || '';
  if (q.length < 2) return res.json([]);

  const resultados = await Medicamento.findAll({
    where: {
      nombreGenerico: { [Op.iLike]: `%${q}%` },
    },
    attributes: ['medicamentoId', 'nombreGenerico', 'formaFarmaceutica', 'dosis', 'presentacion'],
    limit: 15,
  });

  res.json(resultados);
};


export const obtenerFormasFarmaceuticas = async (req, res) => {
  const { nombreGenerico } = req.query;
  if (!nombreGenerico) return res.status(400).json({ error: 'Falta nombreGenerico' });

  const formas = await Medicamento.findAll({
    where: { nombreGenerico },
    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('formaFarmaceutica')), 'formaFarmaceutica']],
  });

  res.json(formas.map(f => f.formaFarmaceutica));
};


export const obtenerDosis = async (req, res) => {
  const { nombreGenerico, formaFarmaceutica } = req.query;
  if (!nombreGenerico || !formaFarmaceutica) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  const dosis = await Medicamento.findAll({
    where: { nombreGenerico, formaFarmaceutica },
    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('dosis')), 'dosis']],
  });

  res.json(dosis.map(d => d.dosis));
};


export const obtenerPresentaciones = async (req, res) => {
  const { nombreGenerico, formaFarmaceutica, dosis } = req.query;
  if (!nombreGenerico || !formaFarmaceutica || !dosis) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  const presentaciones = await Medicamento.findAll({
    where: { nombreGenerico, formaFarmaceutica, dosis },
    attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('presentacion')), 'presentacion']],
  });

  res.json(presentaciones.map(p => p.presentacion));
};
