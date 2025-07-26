import PacienteService from "../services/PacienteService.js";

export const listarPacientes = async (req, res, next) => {
    try{
        const pacientes = await PacienteService.listarPacientes();
        res.status(200).json(pacientes);

    }catch (error) {
        next(error);
    }
}

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