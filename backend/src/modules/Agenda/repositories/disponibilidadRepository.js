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
  // 1. Obtener disponibilidades laborales
  const disponibilidades = await Disponibilidad.findAll({
    where: {
      fecha,
      odontologoId,
      tipo: TipoDisponibilidad.LABORAL
    },
    order: [['horaInicio', 'ASC']]
  });

  // 2. Obtener turnos existentes para esta fecha y odontólogo
  const { Turno } = await import('../models/index.js');
  const fechaInicio = new Date(fecha);
  fechaInicio.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fecha);
  fechaFin.setHours(23, 59, 59, 999);

  const turnosExistentes = await Turno.findAll({
    where: {
      odontologoId,
      fechaHora: {
        [Op.between]: [fechaInicio, fechaFin]
      },
      estado: {
        [Op.ne]: 'CANCELADO' // No considerar turnos cancelados
      }
    }
  });

  // 3. Generar todos los slots posibles
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

  // 4. Filtrar slots que NO están ocupados por turnos
  const slotsDisponibles = slots.filter(slot => {
    const slotInicio = new Date(`${fecha}T${slot.inicio}`);
    const slotFin = new Date(`${fecha}T${slot.fin}`);

    // Verificar si algún turno se solapa con este slot
    const hayConflicto = turnosExistentes.some(turno => {
      const turnoInicio = new Date(turno.fechaHora);
      const turnoFin = new Date(turno.fechaHora.getTime() + turno.duracion * 60000);

      // Hay conflicto si se solapan
      return (
        (slotInicio >= turnoInicio && slotInicio < turnoFin) ||
        (slotFin > turnoInicio && slotFin <= turnoFin) ||
        (slotInicio <= turnoInicio && slotFin >= turnoFin)
      );
    });

    return !hayConflicto;
  });
  
  return slotsDisponibles;
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

export const generarDisponibilidadesRecurrentes = async (odontologoId, tipoRecurrencia, configuracion, fechaInicio, fechaFin, horarioLaboral) => {
  const disponibilidades = [];
  const fechaInicioObj = new Date(fechaInicio);
  const fechaFinObj = new Date(fechaFin);
  
  if (tipoRecurrencia === 'semanal') {
    // Recurrencia semanal: días específicos de la semana (ej: todos los martes)
    const diasSemana = configuracion.diasSemana || [];
    
    for (let fecha = new Date(fechaInicioObj); fecha <= fechaFinObj; fecha.setDate(fecha.getDate() + 1)) {
      const diaSemana = fecha.getDay();
      if (diasSemana.includes(diaSemana)) {
        disponibilidades.push({
          fecha: fecha.toISOString().split('T')[0],
          horaInicio: horarioLaboral.horaInicio,
          horaFin: horarioLaboral.horaFin,
          tipo: TipoDisponibilidad.LABORAL,
          motivo: `Disponibilidad recurrente semanal`,
          odontologoId
        });
      }
    }
  } else if (tipoRecurrencia === 'mensual') {
    // Recurrencia mensual: día específico del mes (ej: primeros martes)
    const diaSemana = configuracion.diaSemana; // 0-6
    const posicionMes = configuracion.posicionMes; // 'primero', 'segundo', 'tercero', 'cuarto', 'ultimo'
    
    for (let fecha = new Date(fechaInicioObj); fecha <= fechaFinObj; fecha.setDate(fecha.getDate() + 1)) {
      // Verificar si es el día de la semana correcto
      if (fecha.getDay() !== diaSemana) continue;
      
      // Calcular la posición del día en el mes
      const diaMes = fecha.getDate();
      let posicion = 0;
      
      if (diaMes <= 7) posicion = 1; // Primera semana
      else if (diaMes <= 14) posicion = 2; // Segunda semana
      else if (diaMes <= 21) posicion = 3; // Tercera semana
      else if (diaMes <= 28) posicion = 4; // Cuarta semana
      else posicion = 5; // Última semana (día 29, 30 o 31)
      
      // Verificar si coincide con la posición solicitada
      let coincide = false;
      if (posicionMes === 'primero' && posicion === 1) coincide = true;
      else if (posicionMes === 'segundo' && posicion === 2) coincide = true;
      else if (posicionMes === 'tercero' && posicion === 3) coincide = true;
      else if (posicionMes === 'cuarto' && posicion === 4) coincide = true;
      else if (posicionMes === 'ultimo') {
        // Para "último", verificar si es el último día de la semana en el mes
        const ultimoDiaMes = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
        const ultimoDiaSemana = new Date(ultimoDiaMes);
        // Ir hacia atrás hasta encontrar el día de la semana correcto
        while (ultimoDiaSemana.getDay() !== diaSemana) {
          ultimoDiaSemana.setDate(ultimoDiaSemana.getDate() - 1);
        }
        coincide = fecha.getDate() === ultimoDiaSemana.getDate();
      }
      
      if (coincide) {
        disponibilidades.push({
          fecha: fecha.toISOString().split('T')[0],
          horaInicio: horarioLaboral.horaInicio,
          horaFin: horarioLaboral.horaFin,
          tipo: TipoDisponibilidad.LABORAL,
          motivo: `Disponibilidad recurrente mensual`,
          odontologoId
        });
      }
    }
  }
  
  // Verificar solapamientos antes de crear
  const disponibilidadesValidas = [];
  for (const disp of disponibilidades) {
    const solapamiento = await verificarSolapamiento(
      disp.fecha,
      disp.horaInicio,
      disp.horaFin,
      disp.odontologoId
    );
    
    if (!solapamiento) {
      disponibilidadesValidas.push(disp);
    }
  }
  
  if (disponibilidadesValidas.length === 0) {
    return [];
  }
  
  return await Disponibilidad.bulkCreate(disponibilidadesValidas);
};
