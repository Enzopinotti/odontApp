import { Disponibilidad } from '../models/index.js';
import { Odontologo, Usuario } from '../../Usuarios/models/index.js';
import { Op } from 'sequelize';
import { TipoDisponibilidad } from '../models/enums.js';

export const findPaginated = (page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  return Disponibilidad.findAndCountAll({
    offset,
    limit: perPage,
    include: [
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] }
    ],
    order: [['fecha', 'ASC'], ['horaInicio', 'ASC']],
  });
};

export const findById = (id, options = {}) => {
  const defaultOptions = {
    include: [
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] }
    ]
  };
  
  return Disponibilidad.findByPk(id, { ...defaultOptions, ...options });
};

export const create = (data) => Disponibilidad.create(data);

export const update = (instancia, data) => instancia.update(data);

export const remove = (instancia) => instancia.destroy();

export const findFiltered = (filtros = {}, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  const where = {};

  // Filtro por fecha
  if (filtros.fecha) {
    where.fecha = filtros.fecha;
  }

  // Filtro por rango de fechas
  if (filtros.fechaInicio && filtros.fechaFin) {
    where.fecha = {
      [Op.between]: [filtros.fechaInicio, filtros.fechaFin]
    };
  }

  // Filtro por odontólogo
  if (filtros.odontologoId) {
    where.odontologoId = filtros.odontologoId;
  }

  // Filtro por tipo
  if (filtros.tipo) {
    where.tipo = filtros.tipo;
  }

  // Filtro por motivo
  if (filtros.motivo) {
    where.motivo = { [Op.like]: `%${filtros.motivo}%` };
  }

  return Disponibilidad.findAndCountAll({
    where,
    offset,
    limit: perPage,
    include: [
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] }
    ],
    order: [['fecha', 'ASC'], ['horaInicio', 'ASC']],
  });
};

export const obtenerDisponibilidadPorFecha = (fecha, odontologoId) => {
  return Disponibilidad.findAll({
    where: {
      fecha,
      odontologoId
    },
    include: [
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] }
    ],
    order: [['horaInicio', 'ASC']]
  });
};

export const obtenerDisponibilidadPorRango = (fechaInicio, fechaFin, odontologoId) => {
  return Disponibilidad.findAll({
    where: {
      fecha: {
        [Op.between]: [fechaInicio, fechaFin]
      },
      odontologoId
    },
    include: [
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] }
    ],
    order: [['fecha', 'ASC'], ['horaInicio', 'ASC']]
  });
};

export const obtenerDisponibilidadesPorOdontologo = (odontologoId) => {
  return Disponibilidad.findAll({
    where: { odontologoId },
    include: [
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] }
    ],
    order: [['fecha', 'ASC'], ['horaInicio', 'ASC']]
  });
};

export const verificarSolapamiento = (fecha, horaInicio, horaFin, odontologoId, disponibilidadIdExcluir = null) => {
  const where = {
    fecha,
    odontologoId,
    [Op.or]: [
      {
        [Op.and]: [
          { horaInicio: { [Op.lte]: horaInicio } },
          { horaFin: { [Op.gt]: horaInicio } }
        ]
      },
      {
        [Op.and]: [
          { horaInicio: { [Op.lt]: horaFin } },
          { horaFin: { [Op.gte]: horaFin } }
        ]
      },
      {
        [Op.and]: [
          { horaInicio: { [Op.gte]: horaInicio } },
          { horaFin: { [Op.lte]: horaFin } }
        ]
      }
    ]
  };

  if (disponibilidadIdExcluir) {
    where.id = {
      [Op.ne]: disponibilidadIdExcluir
    };
  }

  return Disponibilidad.findOne({ where });
};

export const validarDisponibilidad = async (fecha, horaInicio, horaFin, odontologoId) => {
  // Verificar que existe un bloque laboral que contenga el horario solicitado
  const bloqueLaboral = await Disponibilidad.findOne({
    where: {
      fecha,
      odontologoId,
      tipo: TipoDisponibilidad.LABORAL,
      horaInicio: { [Op.lte]: horaInicio },
      horaFin: { [Op.gte]: horaFin }
    }
  });

  return !!bloqueLaboral;
};

export const generarSlotsDisponibles = async (fecha, odontologoId, duracionSlot = 30) => {
  const disponibilidades = await Disponibilidad.findAll({
    where: {
      fecha,
      odontologoId,
      tipo: TipoDisponibilidad.LABORAL
    },
    order: [['horaInicio', 'ASC']]
  });

  const slots = [];
  
  disponibilidades.forEach(disp => {
    const inicio = new Date(`2000-01-01T${disp.horaInicio}`);
    const fin = new Date(`2000-01-01T${disp.horaFin}`);
    
    let slotActual = new Date(inicio);
    
    while (slotActual.getTime() + (duracionSlot * 60000) <= fin.getTime()) {
      const slotFin = new Date(slotActual.getTime() + (duracionSlot * 60000));
      
      slots.push({
        inicio: slotActual.toTimeString().slice(0, 5),
        fin: slotFin.toTimeString().slice(0, 5),
        duracion: duracionSlot
      });
      
      slotActual = new Date(slotActual.getTime() + (duracionSlot * 60000));
    }
  });
  
  return slots;
};

export const generarDisponibilidadesAutomaticas = async (odontologoId, fechaInicio, fechaFin, horarioLaboral) => {
  const disponibilidades = [];
  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);
  
  for (let fecha = new Date(fechaInicioObj); fecha <= fechaFinObj; fecha.setDate(fecha.getDate() + 1)) {
    // Verificar si es día laboral (lunes a viernes)
    const diaSemana = fecha.getDay();
    if (diaSemana >= 1 && diaSemana <= 5) { // 1 = lunes, 5 = viernes
      disponibilidades.push({
        fecha: fecha.toISOString().split('T')[0],
        horaInicio: horarioLaboral.horaInicio,
        horaFin: horarioLaboral.horaFin,
        tipo: TipoDisponibilidad.LABORAL,
        motivo: 'Horario laboral automático',
        odontologoId
      });
    }
  }
  
  return await Disponibilidad.bulkCreate(disponibilidades);
};
