import { Turno, Nota } from '../models/index.js';
import { Paciente, Contacto } from '../../Clinica/models/index.js';
import { Odontologo, Usuario } from '../../Usuarios/models/index.js';
import { Op } from 'sequelize';
import { EstadoTurno } from '../models/enums.js';

export const findPaginated = async (page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  const { rows, count } = await Turno.findAndCountAll({
    offset,
    limit: perPage,
    include: [
      { 
        model: Paciente, 
        as: 'Paciente',
        include: [{ model: Contacto }]
      },
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] },
      { model: Usuario, as: 'Recepcionista' },
      { model: Nota, as: 'Notas' }
    ],
    order: [['fechaHora', 'ASC']],
  });
  
  // CU-AG01.2: Agregar código de turno personalizado a cada turno
  rows.forEach(turno => {
    if (turno) {
      turno.dataValues.codigoTurno = turno.getCodigoTurno();
    }
  });
  
  return { rows, count };
};

export const findById = async (id, options = {}) => {
  const defaultOptions = {
    include: [
      { 
        model: Paciente, 
        as: 'Paciente',
        include: [{ model: Contacto }]
      },
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] },
      { model: Usuario, as: 'Recepcionista' },
      { model: Nota, as: 'Notas', include: [{ model: Usuario, as: 'Usuario' }] }
    ]
  };
  
  const turno = await Turno.findByPk(id, { ...defaultOptions, ...options });
  
  // CU-AG01.2: Agregar código de turno personalizado al JSON
  if (turno) {
    turno.dataValues.codigoTurno = turno.getCodigoTurno();
  }
  
  return turno;
};

export const create = (data) => Turno.create(data);

export const update = (instancia, data) => instancia.update(data);

export const remove = (instancia) => instancia.destroy();

export const findFiltered = async (filtros = {}, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  const where = {};

  // Filtro por fecha
  if (filtros.fecha) {
    // Parsear fecha sin zona horaria para evitar problemas de UTC
    let fechaObj;
    if (typeof filtros.fecha === 'string') {
      const partes = filtros.fecha.split('-');
      if (partes.length === 3) {
        const año = parseInt(partes[0], 10);
        const mes = parseInt(partes[1], 10) - 1; // Mes es 0-indexado
        const dia = parseInt(partes[2], 10);
        fechaObj = new Date(año, mes, dia);
      } else {
        fechaObj = new Date(filtros.fecha);
      }
    } else {
      fechaObj = new Date(filtros.fecha);
    }
    
    const inicioDia = new Date(fechaObj);
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date(fechaObj);
    finDia.setHours(23, 59, 59, 999);
    
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

  const { rows, count } = await Turno.findAndCountAll({
    where,
    offset,
    limit: perPage,
    include: [
      { 
        model: Paciente, 
        as: 'Paciente',
        include: [{ model: Contacto }]
      },
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] },
      { model: Usuario, as: 'Recepcionista' },
      { model: Nota, as: 'Notas' }
    ],
    order: [['fechaHora', 'ASC']],
  });
  
  // CU-AG01.2: Agregar código de turno personalizado a cada turno
  rows.forEach(turno => {
    if (turno) {
      turno.dataValues.codigoTurno = turno.getCodigoTurno();
    }
  });
  
  return { rows, count };
};

export const obtenerTurnosPorFecha = async (fecha, odontologoId = null) => {
  // Parsear fecha sin zona horaria para evitar problemas de UTC
  // Si viene como string "YYYY-MM-DD", crear fecha en zona horaria local
  let fechaObj;
  if (typeof fecha === 'string') {
    // Si es string, parsear como fecha local (no UTC)
    const partes = fecha.split('-');
    if (partes.length === 3) {
      const año = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10) - 1; // Mes es 0-indexado
      const dia = parseInt(partes[2], 10);
      fechaObj = new Date(año, mes, dia);
    } else {
      fechaObj = new Date(fecha);
    }
  } else {
    fechaObj = new Date(fecha);
  }
  
  // Crear inicio y fin del día en zona horaria local
  const inicioDia = new Date(fechaObj);
  inicioDia.setHours(0, 0, 0, 0);
  
  const finDia = new Date(fechaObj);
  finDia.setHours(23, 59, 59, 999);
  
  const where = {
    fechaHora: {
      [Op.between]: [inicioDia, finDia]
    }
  };

  if (odontologoId) {
    where.odontologoId = odontologoId;
  }

  const turnos = await Turno.findAll({
    where,
    include: [
      { 
        model: Paciente, 
        as: 'Paciente',
        include: [{ model: Contacto }]
      },
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] },
      { model: Usuario, as: 'Recepcionista' },
      { model: Nota, as: 'Notas' }
    ],
    order: [['fechaHora', 'ASC']]
  });
  
  // CU-AG01.2: Agregar código de turno personalizado a cada turno
  turnos.forEach(turno => {
    if (turno) {
      turno.dataValues.codigoTurno = turno.getCodigoTurno();
    }
  });
  
  return turnos;
};

export const verificarSolapamiento = async (fechaHora, duracion, odontologoId, turnoIdExcluir = null) => {
  const inicio = new Date(fechaHora);
  const fin = new Date(fechaHora.getTime() + duracion * 60000);
  
  // Buscar todos los turnos del odontólogo en el día (excepto cancelados)
  const turnosDelDia = await Turno.findAll({
    where: {
      odontologoId,
      estado: {
        [Op.ne]: EstadoTurno.CANCELADO
      },
      fechaHora: {
        [Op.gte]: new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate())
      },
      ...(turnoIdExcluir && { id: { [Op.ne]: turnoIdExcluir } })
    }
  });
  
  // Verificar solapamiento manualmente
  for (const turno of turnosDelDia) {
    const turnoInicio = new Date(turno.fechaHora);
    const turnoFin = new Date(turno.fechaHora.getTime() + turno.duracion * 60000);
    
    // Hay solapamiento si:
    // - El nuevo turno inicia durante un turno existente
    // - El nuevo turno termina durante un turno existente
    // - El nuevo turno engloba completamente un turno existente
    const haySolapamiento = (
      (inicio >= turnoInicio && inicio < turnoFin) ||
      (fin > turnoInicio && fin <= turnoFin) ||
      (inicio <= turnoInicio && fin >= turnoFin)
    );
    
    if (haySolapamiento) {
      return turno;
    }
  }
  
  return null;
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
