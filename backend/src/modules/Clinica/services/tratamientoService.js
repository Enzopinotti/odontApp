import {
  Tratamiento,
  CaraTratada,
  Diente,
  Odontograma,
} from '../models/index.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- Listar tratamientos de un odontograma ---------- */
export const listarPorOdontograma = async (odontogramaId) => {
  const tratamientos = await Tratamiento.findAll({
    where: { odontogramaId },
    include: [CaraTratada],
    order: [['createdAt', 'DESC']],
  });

  return tratamientos;
};

/* ---------- Crear tratamiento ---------- */
export const crear = async (odontogramaId, data) => {
  const { nombre, descripcion, dienteId, carasTratadas } = data;

  if (!nombre || !dienteId || !Array.isArray(carasTratadas)) {
    throw new ApiError('Datos insuficientes', 400, null, 'TRATAMIENTO_DATOS_INVALIDOS');
  }

  const odontograma = await Odontograma.findByPk(odontogramaId);
  if (!odontograma) {
    throw new ApiError('Odontograma no encontrado', 404, null, 'ODONTOGRAMA_NO_EXISTE');
  }

  const diente = await Diente.findByPk(dienteId);
  if (!diente || diente.odontogramaId !== odontogramaId) {
    throw new ApiError('Diente inválido para este odontograma', 400, null, 'DIENTE_INVALIDO');
  }

  const tratamiento = await Tratamiento.create({
    nombre,
    descripcion,
    odontogramaId,
    dienteId,
  });

  const caras = carasTratadas.map((cara) => ({
    ...cara,
    tratamientoId: tratamiento.id,
    dienteId,
  }));

  await CaraTratada.bulkCreate(caras);

  return obtenerPorId(tratamiento.id);
};

/* ---------- Obtener tratamiento por ID ---------- */
export const obtenerPorId = async (id) => {
  const tratamiento = await Tratamiento.findByPk(id, {
    include: [CaraTratada],
  });

  if (!tratamiento) {
    throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');
  }

  return tratamiento;
};

/* ---------- Actualizar tratamiento ---------- */
export const actualizar = async (id, data) => {
  const tratamiento = await Tratamiento.findByPk(id, {
    include: [CaraTratada],
  });

  if (!tratamiento) {
    throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');
  }

  await tratamiento.update({
    nombre: data.nombre || tratamiento.nombre,
    descripcion: data.descripcion || tratamiento.descripcion,
  });

  // Eliminar las caras tratadas anteriores
  await CaraTratada.destroy({ where: { tratamientoId: id } });

  // Crear nuevas caras tratadas
  const nuevasCaras = data.carasTratadas?.map((cara) => ({
    ...cara,
    tratamientoId: id,
    dienteId: tratamiento.dienteId,
  })) || [];

  await CaraTratada.bulkCreate(nuevasCaras);

  return obtenerPorId(id);
};

/* ---------- Eliminar tratamiento ---------- */
export const eliminar = async (id) => {
  const tratamiento = await Tratamiento.findByPk(id);
  if (!tratamiento) {
    throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');
  }

  await CaraTratada.destroy({ where: { tratamientoId: id } });
  await tratamiento.destroy();
  return true;
};
