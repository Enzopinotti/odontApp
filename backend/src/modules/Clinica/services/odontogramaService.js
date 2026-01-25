import { sequelize } from '../models/index.js';
import { Paciente, Odontograma, Diente, CaraTratada, Tratamiento } from '../models/index.js';
import ApiError from '../../../utils/ApiError.js';

/* utils */
const hexToInt = (hex) => parseInt(String(hex || '').replace('#', ''), 16);

/* ---------- Verifica si existe odontograma para paciente ---------- */
export const existeParaPaciente = async (pacienteId) =>
  Boolean(await Odontograma.findOne({ where: { pacienteId } }));

/* ---------- Crear odontograma con 32 dientes ---------- */
export const crearParaPaciente = async (pacienteId, data) =>
  sequelize.transaction(async (t) => {
    const paciente = await Paciente.findByPk(pacienteId, { transaction: t });
    if (!paciente) throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');

    const odontograma = await Odontograma.create(
      {
        pacienteId,
        fechaCreacion: new Date(),
        observaciones: data?.observaciones ?? null,
      },
      { transaction: t }
    );

    const dientes = Array.from({ length: 32 }, () => ({
      odontogramaId: odontograma.id,
      estadoDiente: 'Sano',
      notas: null,
    }));

    await Diente.bulkCreate(dientes, { transaction: t });

    return Odontograma.findByPk(odontograma.id, {
      include: { model: Diente },
      transaction: t,
    });
  });

/* ---------- Obtener odontograma completo de un paciente ---------- */
export const obtenerPorPaciente = async (pacienteId) =>
  Odontograma.findOne({
    where: { pacienteId },
    include: { model: Diente, include: { model: CaraTratada, include: Tratamiento } },
  });

/* ---------- Actualizar estado o notas de un diente ---------- */
export const actualizarDiente = async (odontogramaId, numero, data) => {
  const diente = await Diente.findOne({
    where: { odontogramaId },
    offset: parseInt(numero, 10) - 1,
    limit: 1,
    order: [['id', 'ASC']],
  });
  if (!diente) return null;

  return diente.update({
    estadoDiente: data?.estadoDiente ?? diente.estadoDiente,
    notas: data?.notas ?? diente.notas,
  });
};

/* ---------- Agregar cara tratada a un diente ---------- */
export const agregarCara = async (dienteId, data) => {
  const diente = await Diente.findByPk(dienteId);
  if (!diente) throw new ApiError('Diente no encontrado', 404, null, 'DIENTE_NO_EXISTE');

  return CaraTratada.create({
    dienteId,
    simbolo: data.simbolo,
    tipoTrazo: data.tipoTrazo,
    colorEstado: data.colorEstado,
    estadoCara: data.estadoCara,
    tratamientoId: data.tratamientoId ?? null,
  });
};

/* ---------- Actualizar cara tratada ---------- */
export const actualizarCara = async (caraId, data) => {
  const cara = await CaraTratada.findByPk(caraId);
  if (!cara) return null;

  return cara.update({
    simbolo: data.simbolo,
    tipoTrazo: data.tipoTrazo,
    colorEstado: data.colorEstado,
    estadoCara: data.estadoCara,
    tratamientoId: data.tratamientoId ?? null,
  });
};

/* ---------- Eliminar cara tratada ---------- */
export const eliminarCara = async (caraId) => {
  const cara = await CaraTratada.findByPk(caraId);
  if (!cara) return null;

  await cara.destroy();
  return true;
};

/* ---------- Aplicar tratamiento del catálogo a un diente ---------- */
export const aplicarTratamiento = async (dienteId, { tratamientoId, estado = 'Planificado', color, trazo, caras }) => {
  const diente = await Diente.findByPk(dienteId);
  if (!diente) throw new ApiError('Diente no encontrado', 404, null, 'DIENTE_NO_EXISTE');

  const tto = await Tratamiento.findByPk(tratamientoId);
  if (!tto) throw new ApiError('Tratamiento no encontrado', 404, null, 'TRATAMIENTO_NO_EXISTE');

  const cfg = tto.config || {};

  let carasObjetivo = caras;
  if (!carasObjetivo) {
    if (cfg.alcance === 'cara') {
      carasObjetivo = Array.isArray(cfg.carasPorDefecto) && cfg.carasPorDefecto.length ? cfg.carasPorDefecto : ['O'];
    } else if (cfg.alcance === 'diente') {
      carasObjetivo = ['O', 'M', 'D', 'B', 'L'];
    } else {
      carasObjetivo = [];
    }
  }

  const colorFinal = color ?? (estado === 'Realizado' ? (cfg.colorRealizado || '#2563eb') : (cfg.colorPlanificado || cfg.colorRealizado || '#ef4444'));
  const trazoFinal = trazo ?? (cfg.trazoSugerido || 'Continuo');

  const payload = carasObjetivo.map((simbolo) => ({
    dienteId,
    simbolo,
    tipoTrazo: trazoFinal,
    colorEstado: hexToInt(colorFinal),
    estadoCara: estado,
    tratamientoId: tto.id,
  }));

  if (payload.length) await CaraTratada.bulkCreate(payload);

  return {
    creadas: payload.length,
    modoDibujo: cfg.modoDibujo || 'fill',
    alcance: cfg.alcance || 'cara',
  };
};

/* ---------- Historial de tratamientos por paciente ---------- */
export const historialPorPaciente = async (pacienteId) => {
  const odontograma = await Odontograma.findOne({ where: { pacienteId } });
  if (!odontograma) return []; // Retornar vacío si no hay odontograma, en lugar de 404

  const dientes = await Diente.findAll({
    where: { odontogramaId: odontograma.id },
    include: { model: CaraTratada, include: [Tratamiento] },
    order: [['id', 'ASC']],
  });

  const historial = [];
  dientes.forEach((diente, idx) => {
    diente.CaraTratadas.forEach((cara) => {
      if (cara.Tratamiento) {
        historial.push({
          dienteNumero: idx + 1,
          cara: cara.estadoCara,
          simbolo: cara.simbolo,
          tratamiento: {
            id: cara.Tratamiento.id,
            nombre: cara.Tratamiento.nombre,
            descripcion: cara.Tratamiento.descripcion,
            config: cara.Tratamiento.config,
          },
          actualizado: cara.updatedAt,
        });
      }
    });
  });

  return historial.sort((a, b) => new Date(b.actualizado) - new Date(a.actualizado));
};

/* ---------- Export default ---------- */
export default {
  existeParaPaciente,
  crearParaPaciente,
  obtenerPorPaciente,
  actualizarDiente,
  agregarCara,
  actualizarCara,
  eliminarCara,
  aplicarTratamiento,
  historialPorPaciente,
};
