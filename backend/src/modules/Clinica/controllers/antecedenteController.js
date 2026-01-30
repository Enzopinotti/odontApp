// backend/src/modules/Clinica/controllers/antecedenteController.js
import { AntecedenteMedico } from '../models/index.js';
import ApiError from '../../../utils/ApiError.js';

export const listarPorPaciente = async (req, res) => {
    const pacienteId = parseInt(req.params.pacienteId);
    if (isNaN(pacienteId)) throw new ApiError('ID de paciente inválido', 400);

    const lista = await AntecedenteMedico.findAll({
        where: { pacienteId, activo: true },
        order: [['fechaRegistro', 'DESC']]
    });
    res.ok(lista);
};

export const crear = async (req, res) => {
    const pacienteId = parseInt(req.params.pacienteId);
    if (isNaN(pacienteId)) throw new ApiError('ID de paciente inválido', 400);

    const { tipoAntecedente, descripcion, fechaRegistro, observaciones } = req.body;
    if (!tipoAntecedente) throw new ApiError('El tipo de antecedente es requerido', 400);

    const nuevo = await AntecedenteMedico.create({
        pacienteId,
        tipoAntecedente,
        descripcion,
        fechaRegistro: fechaRegistro || new Date(),
        observaciones,
        activo: true
    });

    res.created(nuevo, 'Antecedente registrado correctamente');
};

export const eliminar = async (req, res) => {
    const id = parseInt(req.params.id);
    const ant = await AntecedenteMedico.findByPk(id);
    if (!ant) throw new ApiError('Registro no encontrado', 404);

    await ant.update({ activo: false });
    // O baja con deletedAt si tiene paranoid habilitado el modelo
    res.ok(null, 'Registro eliminado');
};
