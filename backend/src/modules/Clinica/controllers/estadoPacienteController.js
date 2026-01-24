// backend/src/modules/Clinica/controllers/estadoPacienteController.js
import { EstadoPaciente } from '../models/index.js';

export const listarEstados = async (req, res) => {
    const estados = await EstadoPaciente.findAll({
        order: [['orden', 'ASC']],
    });
    res.ok(estados);
};
