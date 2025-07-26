import MedicamentoService from '../services/MedicamentoService.js';

export const getNombresGenericos = async (req, res) => {
  try {
    const data = await MedicamentoService.listarNombresGenericos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFormasFarmaceuticas = async (req, res) => {
  try {
    const { nombreGenerico } = req.params;
    const data = await MedicamentoService.listarFormasFarmaceuticas(nombreGenerico);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getConcentraciones = async (req, res) => {
  try {
    const { nombreGenerico, formaFarmaceutica } = req.params;
    const data = await MedicamentoService.listarConcentraciones(nombreGenerico, formaFarmaceutica);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getPresentaciones = async (req, res) => {
  try {
    const { nombreGenerico, formaFarmaceutica, concentracion } = req.params;
    const data = await MedicamentoService.listarPresentaciones(nombreGenerico, formaFarmaceutica, concentracion);
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getMedicamentoCompleto = async (req, res) => {
  try {
    const { nombreGenerico, formaFarmaceutica, concentracion, presentacion } = req.body;
    const data = await MedicamentoService.obtenerMedicamento(nombreGenerico, formaFarmaceutica, concentracion, presentacion);
    if (!data) {
      return res.status(404).json({ error: 'No se encontró el medicamento.' });
    }
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const crearMedicamento = async (req, res) => {
  try {
    const data = await MedicamentoService.crearMedicamento(req.body);
    res.status(201).json({ message: 'Medicamento creado con éxito.', data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const actualizarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MedicamentoService.actualizarMedicamento(id, req.body);
    res.json({ message: 'Medicamento actualizado', data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const eliminarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    await MedicamentoService.eliminarMedicamento(id);
    res.json({ message: 'Medicamento eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
