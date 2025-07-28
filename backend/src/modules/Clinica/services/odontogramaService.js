// backend/src/modules/Clinica/services/odontogramaService.js

import { sequelize } from '../models/index.js';
import {
  Paciente,
  Odontograma,
  Diente,
  CaraTratada,
  Tratamiento,
} from '../models/index.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- Verifica si ya existe odontograma para paciente ---------- */
export const existeParaPaciente = async (pacienteId) => {
  return Boolean(await Odontograma.findOne({ where: { pacienteId } }));
};

/* ---------- Crear odontograma con 32 dientes ---------- */
export const crearParaPaciente = async (pacienteId, data) => {
  return await sequelize.transaction(async (t) => {
    const paciente = await Paciente.findByPk(pacienteId, { transaction: t });
    if (!paciente) {
      throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');
    }

    const odontograma = await Odontograma.create(
      {
        pacienteId,
        fechaCreacion: new Date(),
        observaciones: data.observaciones,
      },
      { transaction: t }
    );

    const dientes = Array.from({ length: 32 }, (_, i) => ({
      odontogramaId: odontograma.id,
      estadoDiente: 'Sano',
      notas: null,
    }));

    await Diente.bulkCreate(dientes, { transaction: t });

    return await Odontograma.findByPk(odontograma.id, {
      include: { model: Diente },
      transaction: t,
    });
  });
};

/* ---------- Obtener odontograma completo de un paciente ---------- */
export const obtenerPorPaciente = async (pacienteId) => {
  return Odontograma.findOne({
    where: { pacienteId },
    include: {
      model: Diente,
      include: { model: CaraTratada, include: Tratamiento },
    },
  });
};

/* ---------- Actualizar estado o notas de un diente ---------- */
export const actualizarDiente = async (odontogramaId, numero, data) => {
  const diente = await Diente.findOne({
    where: { odontogramaId },
    offset: parseInt(numero) - 1,
    limit: 1,
    order: [['id', 'ASC']],
  });

  if (!diente) return null;

  await diente.update({
    estadoDiente: data.estadoDiente || diente.estadoDiente,
    notas: data.notas ?? diente.notas,
  });

  return diente;
};

/* ---------- Agregar cara tratada a un diente ---------- */
export const agregarCara = async (dienteId, data) => {
  const diente = await Diente.findByPk(dienteId);
  if (!diente) throw new ApiError('Diente no encontrado', 404, null, 'DIENTE_NO_EXISTE');

  const nueva = await CaraTratada.create({
    dienteId,
    simbolo: data.simbolo,
    tipoTrazo: data.tipoTrazo,
    colorEstado: data.colorEstado,
    estadoCara: data.estadoCara,
    tratamientoId: data.tratamientoId || null,
  });

  return nueva;
};

/* ---------- Actualizar cara tratada ---------- */
export const actualizarCara = async (caraId, data) => {
  const cara = await CaraTratada.findByPk(caraId);
  if (!cara) return null;

  await cara.update({
    simbolo: data.simbolo,
    tipoTrazo: data.tipoTrazo,
    colorEstado: data.colorEstado,
    estadoCara: data.estadoCara,
    tratamientoId: data.tratamientoId ?? null,
  });

  return cara;
};

/* ---------- Eliminar cara tratada ---------- */
export const eliminarCara = async (caraId) => {
  const cara = await CaraTratada.findByPk(caraId);
  if (!cara) return null;

  await cara.destroy();
  return true;
};
