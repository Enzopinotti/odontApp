import { Turno, Paciente, Odontologo, Usuario, Nota } from '../models/index.js';
import { Op } from 'sequelize';
import { EstadoTurno } from '../models/enums.js';

export const findPaginated = (page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  return Turno.findAndCountAll({
    offset,
    limit: perPage,
    include: [
      { model: Paciente, as: 'Paciente' },
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] },
      { model: Usuario, as: 'Recepcionista' },
      { model: Nota, as: 'Notas' }
    ],
    order: [['fechaHora', 'ASC']],
  });
};

export const findById = (id, options = {}) => {
  const defaultOptions = {
    include: [
      { model: Paciente, as: 'Paciente' },
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] },
      { model: Usuario, as: 'Recepcionista' },
      { model: Nota, as: 'Notas', include: [{ model: Usuario, as: 'Usuario' }] }
    ]
  };
  
  return Turno.findByPk(id, { ...defaultOptions, ...options });
};

export const create = (data) => Turno.create(data);

export const update = (instancia, data) => instancia.update(data);

export const remove = (instancia) => instancia.destroy();

export const findFiltered = (filtros = {}, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  const where = {};

  // Filtro por fecha
  if (filtros.fecha) {
    const fecha = new Date(filtros.fecha);
    const inicioDia = new Date(fecha.setHours(0, 0, 0, 0));
    const finDia = new Date(fecha.setHours(23, 59, 59, 999));
    
    where.fechaHora = {
      [Op.between]: [inicioDia, finDia]
    };
  }

  // Filtro por rango de fechas
  if (filtros.fechaInicio && filtros.fechaFin) {
    where.fechaHora = {
      [Op.between]: [new Date(filtros.fechaInicio), new Date(filtros.fechaFin)]
    };
  }

  // Filtro por odontólogo
  if (filtros.odontologoId) {
    where.odontologoId = filtros.odontologoId;
  }

  // Filtro por paciente
  if (filtros.pacienteId) {
    where.pacienteId = filtros.pacienteId;
  }

  // Filtro por estado
  if (filtros.estado) {
    where.estado = filtros.estado;
  }

  // Filtro por motivo
  if (filtros.motivo) {
    where.motivo = { [Op.like]: `%${filtros.motivo}%` };
  }

  // Filtro por recepcionista
  if (filtros.recepcionistaId) {
    where.recepcionistaId = filtros.recepcionistaId;
  }

  return Turno.findAndCountAll({
    where,
    offset,
    limit: perPage,
    include: [
      { model: Paciente, as: 'Paciente' },
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] },
      { model: Usuario, as: 'Recepcionista' },
      { model: Nota, as: 'Notas' }
    ],
    order: [['fechaHora', 'ASC']],
  });
};

export const obtenerTurnosPorFecha = (fecha, odontologoId = null) => {
  const fechaObj = new Date(fecha);
  const inicioDia = new Date(fechaObj.setHours(0, 0, 0, 0));
  const finDia = new Date(fechaObj.setHours(23, 59, 59, 999));
  
  const where = {
    fechaHora: {
      [Op.between]: [inicioDia, finDia]
    }
  };

  if (odontologoId) {
    where.odontologoId = odontologoId;
  }

  return Turno.findAll({
    where,
    include: [
      { model: Paciente, as: 'Paciente' },
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] },
      { model: Usuario, as: 'Recepcionista' },
      { model: Nota, as: 'Notas' }
    ],
    order: [['fechaHora', 'ASC']]
  });
};

export const verificarSolapamiento = (fechaHora, duracion, odontologoId, turnoIdExcluir = null) => {
  const inicio = new Date(fechaHora);
  const fin = new Date(fechaHora.getTime() + duracion * 60000);
  
  const where = {
    odontologoId,
    estado: {
      [Op.ne]: EstadoTurno.CANCELADO
    },
    [Op.or]: [
      {
        fechaHora: {
          [Op.between]: [inicio, fin]
        }
      },
      {
        [Op.and]: [
          {
            fechaHora: {
              [Op.lte]: inicio
            }
          },
          {
            [Op.and]: [
              {
                fechaHora: {
                  [Op.lt]: fin
                }
              },
              {
                [Op.raw]: `DATE_ADD(fechaHora, INTERVAL duracion MINUTE) > '${inicio.toISOString()}'`
              }
            ]
          }
        ]
      }
    ]
  };

  if (turnoIdExcluir) {
    where.id = {
      [Op.ne]: turnoIdExcluir
    };
  }

  return Turno.findOne({ where });
};

export const obtenerTurnosPendientesVencidos = () => {
  const ahora = new Date();
  
  return Turno.findAll({
    where: {
      estado: EstadoTurno.PENDIENTE,
      fechaHora: {
        [Op.lt]: ahora
      }
    },
    include: [
      { model: Paciente, as: 'Paciente' },
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] }
    ]
  });
};

export const marcarAusenciaAutomatica = async (turnoId) => {
  const turno = await Turno.findByPk(turnoId);
  if (turno && turno.estado === EstadoTurno.PENDIENTE) {
    await turno.marcarAusencia();
    return turno;
  }
  return null;
};
