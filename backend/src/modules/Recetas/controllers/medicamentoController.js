// backend/src/modules/Clinica/controllers/medicamentoController.js
import MedicamentoService from "../services/MedicamentoService.js";

// 📌 Listar todos los medicamentos
export const getMedicamentos = async (req, res) => {
  try {
    const data = await MedicamentoService.listarMedicamentos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Buscar medicamento por ID
export const getMedicamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MedicamentoService.buscarPorId(id);
    if (!data) return res.status(404).json({ error: "Medicamento no encontrado" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Jerarquía completa (nombre → formas → dosis → presentaciones)
export const getJerarquia = async (req, res) => {
  try {
    const data = await MedicamentoService.obtenerJerarquia();
    res.json(data);
  } catch (error) {
    console.error("❌ Error en getJerarquia:", error);
    res.status(500).json({ error: error.message });
  }
};

// 📌 Crear nuevo medicamento
export const crearMedicamento = async (req, res) => {
  try {
    const data = await MedicamentoService.crearMedicamento(req.body);
    res.status(201).json({ message: "Medicamento creado con éxito.", data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📌 Actualizar medicamento
export const actualizarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await MedicamentoService.actualizarMedicamento(id, req.body);
    res.json({ message: "Medicamento actualizado", data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// 📌 Eliminar medicamento
export const eliminarMedicamento = async (req, res) => {
  try {
    const { id } = req.params;
    await MedicamentoService.eliminarMedicamento(id);
    res.json({ message: "Medicamento eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
