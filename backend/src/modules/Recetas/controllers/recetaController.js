import { Receta, MedicamentoRecetado, Medicamento } from "../models/index.js"; // ✅
import { Paciente } from "../../Clinica/models/index.js";
import { Odontologo } from "../../Usuarios/models/index.js";

//const PDFDocument = require("pdfkit");
//const nodemailer = require("nodemailer");

// Listar todas las recetas
export const listarRecetas = async (req, res) => {
  try {
    const recetas = await Receta.findAll({
      include: [
        { model: Paciente, as: "paciente" },
        { model: Odontologo, as: "odontologo" },
        { model: MedicamentoRecetado, as: "medicamentos" },
      ],
    });
    res.status(200).json(recetas);
  } catch (error) {
    console.error("Error al listar recetas:", error);
    res.status(500).json({ error: "Error al listar recetas" });
  }
};

// Crear una nueva receta
export const crearReceta = async (req, res) => {
  const { pacienteId, odontologoId, diagnostico, indicaciones, medicamentos } =
    req.body;
  try {
    const paciente = await Paciente.findByPk(pacienteId);
    if (!paciente)
      return res.status(404).json({ error: "Paciente no encontrado" });
    const odontologo = await Odontologo.findByPk(odontologoId);
    if (!odontologo)
      return res.status(404).json({ error: "Odontólogo no encontrado" });
    const firmaOdontologo = odontologo.firma;

    //crea receta vacia de medicamentos
    const receta = await Receta.create({
      pacienteId,
      odontologoId,
      diagnostico,
      indicaciones,
      firmaOdontologo,
    });

    // Guardar medicamentos recetados
    if (Array.isArray(medicamentos) && medicamentos.length > 0) {
      for (const med of medicamentos) {
        const { id, dosis, presentacion, formaFarmaceutica } = med;
        const medicamento = await Medicamento.findByPk(id);
        if (!medicamento) {
          return res
            .status(404)
            .json({ error: `Medicamento con ID ${id} no encontrado` });
        }
        await MedicamentoRecetado.create({
          recetaId: receta.id,
          medicamentoId: id,
          dosis,
          presentacion,
          formaFarmaceutica,
        });
      }
    }
    const recetaCompleta = await Receta.findByPk(receta.id, {
      include: [
        { model: Paciente, as: "paciente" },
        { model: Odontologo, as: "odontologo" },
        {
          model: MedicamentoRecetado,
          as: "medicamentos",
          include: [{ model: Medicamento, as: "medicamento" }],
        },
      ],
    });
    res.status(201).json(recetaCompleta);
  } catch (error) {
    console.error("Error al crear receta:", error);
    res.status(500).json({ error: "Error al crear receta" });
  }
};

export const getReceta = async (req, res) => {
  const { id } = req.params;
  try {
    const receta = await Receta.findByPk(id, {
      include: [
        { model: Paciente, as: "paciente" },
        { model: Odontologo, as: "odontologo" },
        {
          model: MedicamentoRecetado,
          as: "medicamentos",
          include: [{ model: Medicamento, as: "medicamento" }],
        },
      ],
    });
    if (!receta) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    res.status(200).json(receta);
  } catch (error) {
    console.error("Error al obtener receta:", error);
    res.status(500).json({ error: "Error al obtener receta" });
  }
};

export const eliminarReceta = async (req, res) => {
  const { id } = req.params;
  try {
    const receta = await Receta.findByPk(id);
    if (!receta) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    await receta.destroy();
    res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar receta:", error);
    res.status(500).json({ error: "Error al eliminar receta" });
  }
};

export const actualizarReceta = async (req, res) => {
  const { id } = req.params;
  const { pacienteId, odontologoId, diagnostico, indicaciones, medicamentos } =
    req.body;
  try {
    const receta = await Receta.findByPk(id);
    if (!receta) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    const odontologo = await Odontologo.findByPk(odontologoId);
    if (!odontologo) {
      return res.status(404).json({ error: "Odontólogo no encontrado" });
    }
    const paciente = await Paciente.findByPk(pacienteId);
    if (!paciente) {
      return res.status(404).json({ error: "Paciente no encontrado" });
    }
    receta.pacienteId = pacienteId;
    receta.odontologoId = odontologoId;
    receta.diagnostico = diagnostico;
    receta.indicaciones = indicaciones;
    receta.firmaOdontologo = odontologo.firma; // Asignar firma del odontólogo
    await receta.save();

    // Actualizar medicamentos recetados
    if (Array.isArray(medicamentos) && medicamentos.length > 0) {
      await MedicamentoRecetado.destroy({ where: { recetaId: id } });
      for (const med of medicamentos) {
        const { id, dosis, presentacion, formaFarmaceutica } = med;
        const medicamento = await Medicamento.findByPk(id);
        if (!medicamento) {
          return res
            .status(404)
            .json({ error: `Medicamento con ID ${id} no encontrado` });
        }
        await MedicamentoRecetado.create({
          recetaId: id,
          medicamentoId: id,
          dosis,
          presentacion,
          formaFarmaceutica,
        });
      }
    }

    const recetaActualizada = await Receta.findByPk(id, {
      include: [
        { model: Paciente, as: "paciente" },
        { model: Odontologo, as: "odontologo" },
        {
          model: MedicamentoRecetado,
          as: "medicamentos",
          include: [{ model: Medicamento, as: "medicamento" }],
        },
      ],
    });
    res.status(200).json(recetaActualizada);
  } catch (error) {
    console.error("Error al actualizar receta:", error);
    res.status(500).json({ error: "Error al actualizar receta" });
  }
};

//exports.generarPDF = async (req, res) => {}

//exports.enviarRecetaPorEmail = async (req, res) => {}
