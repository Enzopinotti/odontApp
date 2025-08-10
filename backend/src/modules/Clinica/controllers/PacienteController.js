import PacienteService from "../services/PacienteService.js";
import { Op } from "sequelize";
export const listarPacientes = async (req, res, next) => {
    try{
        const pacientes = await PacienteService.listarPacientes();
        res.status(200).json(pacientes);

    }catch (error) {
        next(error);
    }
}
export const buscarPacientes = async (req, res) => {
  try {
    const { query } = req.query;
    const pacientes = await PacienteService.buscarPacientes(query);
    res.json(pacientes);
  } catch (error) {
    if (error.message === "Falta parámetro de búsqueda") {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error en búsqueda de pacientes:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

export const getPaciente = async (req, res, next) => {
    const { id } = req.params;
    try {
        const paciente = await PacienteService.obtenerPacientePorId(id);
        res.status(200).json(paciente);
    } catch (error) {
        next(error);
    }
}

export const crearPaciente = async (req, res, next) => {
    try {
        const paciente = await PacienteService.crearPaciente(req.body);
        res.status(201).json(paciente);
    } catch (error) {
        next(error);
    }
}

export const actualizarPaciente = async (req, res, next) => {
    const { id } = req.params;
    try {
        const pacienteActualizado = await PacienteService.actualizarPaciente(id, req.body);
        res.status(200).json(pacienteActualizado);
    } catch (error) {
        next(error);
    }
}

export const eliminarPaciente = async (req, res, next) => {
    const { id } = req.params;
    try {
        await PacienteService.eliminarPaciente(id);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
}