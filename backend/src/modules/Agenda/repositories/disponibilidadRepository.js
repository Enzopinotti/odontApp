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

  // Filtro por fecha - normalizar a formato YYYY-MM-DD
  if (filtros.fecha) {
    let fechaNormalizada;
    if (filtros.fecha instanceof Date) {
      fechaNormalizada = filtros.fecha.toISOString().split('T')[0];
    } else if (typeof filtros.fecha === 'string') {
      fechaNormalizada = filtros.fecha.split('T')[0]; // Eliminar cualquier parte de hora
    } else {
      fechaNormalizada = filtros.fecha;
    }
    where.fecha = fechaNormalizada;
  }

  // Filtro por rango de fechas
  if (filtros.fechaInicio && filtros.fechaFin) {
    // Normalizar fechas a formato YYYY-MM-DD
    const normalizarFecha = (fecha) => {
      if (!fecha) return fecha;
      if (fecha instanceof Date) {
        return fecha.toISOString().split('T')[0];
      }
      if (typeof fecha === 'string') {
        return fecha.split('T')[0].split(' ')[0];
      }
      return fecha;
    };
    
    const fechaInicioNorm = normalizarFecha(filtros.fechaInicio);
    const fechaFinNorm = normalizarFecha(filtros.fechaFin);
    
    console.log('[findFiltered] Rango de fechas:', {
      fechaInicio: filtros.fechaInicio,
      fechaInicioNormalizada: fechaInicioNorm,
      fechaFin: filtros.fechaFin,
      fechaFinNormalizada: fechaFinNorm
    });
    
    where.fecha = {
      [Op.between]: [fechaInicioNorm, fechaFinNorm]
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
  // Normalizar fecha a formato YYYY-MM-DD
  let fechaNormalizada;
  if (fecha instanceof Date) {
    fechaNormalizada = fecha.toISOString().split('T')[0];
  } else if (typeof fecha === 'string') {
    fechaNormalizada = fecha.split('T')[0]; // Eliminar cualquier parte de hora
  } else {
    fechaNormalizada = fecha;
  }
  
  console.log('[obtenerDisponibilidadPorFecha] Fecha recibida:', fecha, '→ Normalizada:', fechaNormalizada);
  
  return Disponibilidad.findAll({
    where: {
      fecha: fechaNormalizada,
      odontologoId
    },
    include: [
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] }
    ],
    order: [['horaInicio', 'ASC']]
  });
};

export const obtenerDisponibilidadPorRango = (fechaInicio, fechaFin, odontologoId) => {
  // Normalizar fechas a formato YYYY-MM-DD
  const normalizarFecha = (fecha) => {
    if (!fecha) return fecha;
    if (fecha instanceof Date) {
      return fecha.toISOString().split('T')[0];
    }
    if (typeof fecha === 'string') {
      return fecha.split('T')[0].split(' ')[0];
    }
    return fecha;
  };
  
  const fechaInicioNorm = normalizarFecha(fechaInicio);
  const fechaFinNorm = normalizarFecha(fechaFin);
  
  console.log('[obtenerDisponibilidadPorRango] Parámetros:', {
    fechaInicio,
    fechaInicioNormalizada: fechaInicioNorm,
    fechaFin,
    fechaFinNormalizada: fechaFinNorm,
    odontologoId
  });
  
  return Disponibilidad.findAll({
    where: {
      fecha: {
        [Op.between]: [fechaInicioNorm, fechaFinNorm]
      },
      odontologoId
    },
    include: [
      { model: Odontologo, as: 'Odontologo', include: [{ model: Usuario, as: 'Usuario' }] }
    ],
    order: [['fecha', 'ASC'], ['horaInicio', 'ASC']]
  }).then(result => {
    console.log('[obtenerDisponibilidadPorRango] Resultado:', {
      cantidad: result.length,
      disponibilidades: result.map(d => ({
        id: d.id,
        fecha: d.fecha,
        fechaTipo: typeof d.fecha,
        odontologoId: d.odontologoId,
        tipo: d.tipo,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin
      }))
    });
    return result;
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
  // Normalizar fecha a formato YYYY-MM-DD
  let fechaNormalizada;
  if (fecha instanceof Date) {
    fechaNormalizada = fecha.toISOString().split('T')[0];
  } else if (typeof fecha === 'string') {
    fechaNormalizada = fecha.split('T')[0]; // Eliminar cualquier parte de hora
  } else {
    fechaNormalizada = fecha;
  }
  
  const where = {
    fecha: fechaNormalizada,
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
  console.log('[disponibilidadRepository.validarDisponibilidad] Parámetros:', {
    fecha,
    horaInicio,
    horaFin,
    odontologoId
  });
  
  // Normalizar formatos de hora (asegurar formato HH:MM)
  const normalizarHora = (hora) => {
    if (!hora) return '';
    return hora.length > 5 ? hora.substring(0, 5) : hora;
  };
  
  const horaInicioNorm = normalizarHora(horaInicio);
  const horaFinNorm = normalizarHora(horaFin);
  
  console.log('[disponibilidadRepository.validarDisponibilidad] Horas normalizadas:', {
    horaInicioOriginal: horaInicio,
    horaInicioNormalizada: horaInicioNorm,
    horaFinOriginal: horaFin,
    horaFinNormalizada: horaFinNorm
  });
  
  // Verificar que existe un bloque laboral que contenga el horario solicitado
  // El bloque debe cumplir: horaInicioFranja <= horaInicioTurno && horaFinFranja >= horaFinTurno
  // IMPORTANTE: La comparación de strings funciona correctamente para formato HH:MM
  const bloqueLaboral = await Disponibilidad.findOne({
    where: {
      fecha,
      odontologoId,
      tipo: TipoDisponibilidad.LABORAL,
      horaInicio: { [Op.lte]: horaInicioNorm },
      horaFin: { [Op.gte]: horaFinNorm }
    },
    order: [['horaInicio', 'ASC']] // Ordenar por hora de inicio
  });
  
  // Log detallado para debugging
  if (!bloqueLaboral) {
    // Buscar todos los bloques del día para ver qué hay disponible
    const todosLosBloques = await Disponibilidad.findAll({
      where: {
        fecha,
        odontologoId,
        tipo: TipoDisponibilidad.LABORAL
      },
      order: [['horaInicio', 'ASC']]
    });
    
    console.log('[disponibilidadRepository.validarDisponibilidad] No se encontró bloque, pero hay estos bloques:', {
      cantidad: todosLosBloques.length,
      bloques: todosLosBloques.map(b => ({
        horaInicio: b.horaInicio,
        horaFin: b.horaFin,
        // Comparación manual
        inicioMenorIgual: b.horaInicio <= horaInicioNorm,
        finMayorIgual: b.horaFin >= horaFinNorm,
        cumple: b.horaInicio <= horaInicioNorm && b.horaFin >= horaFinNorm
      })),
      horarioBuscado: {
        horaInicio: horaInicioNorm,
        horaFin: horaFinNorm
      }
    });
  }

  console.log('[disponibilidadRepository.validarDisponibilidad] Resultado:', {
    bloqueEncontrado: !!bloqueLaboral,
    bloque: bloqueLaboral ? {
      fecha: bloqueLaboral.fecha,
      horaInicio: bloqueLaboral.horaInicio,
      horaFin: bloqueLaboral.horaFin,
      tipo: bloqueLaboral.tipo
    } : null
  });
  
  // Si no se encontró bloque, buscar todos los bloques del día para debugging
  if (!bloqueLaboral) {
    const bloquesDelDia = await Disponibilidad.findAll({
      where: {
        fecha,
        odontologoId,
        tipo: TipoDisponibilidad.LABORAL
      }
    });
    
    console.log('[disponibilidadRepository.validarDisponibilidad] Bloques laborales del día:', {
      cantidad: bloquesDelDia.length,
      bloques: bloquesDelDia.map(b => ({
        horaInicio: b.horaInicio,
        horaFin: b.horaFin
      }))
    });
  }

  return !!bloqueLaboral;
};

export const generarSlotsDisponibles = async (fecha, odontologoId, duracionSlot = 30) => {
  // Asegurar que solo se generen slots de 30 o 60 minutos
  if (duracionSlot !== 30 && duracionSlot !== 60) {
    duracionSlot = 30; // Por defecto 30 minutos
  }
  // Normalizar fecha a formato YYYY-MM-DD (sin zona horaria)
  let fechaNormalizada;
  if (fecha instanceof Date) {
    fechaNormalizada = fecha.toISOString().split('T')[0];
  } else if (typeof fecha === 'string') {
    // Si viene como string, asegurarse de que esté en formato YYYY-MM-DD
    fechaNormalizada = fecha.split('T')[0]; // Eliminar cualquier parte de hora si existe
  } else {
    fechaNormalizada = fecha;
  }
  
  console.log('[generarSlotsDisponibles] Fecha recibida:', fecha, '→ Normalizada:', fechaNormalizada);
  
  // 1. Obtener disponibilidades laborales
  const disponibilidades = await Disponibilidad.findAll({
    where: {
      fecha: fechaNormalizada,
      odontologoId,
      tipo: TipoDisponibilidad.LABORAL
    },
    order: [['horaInicio', 'ASC']]
  });

  console.log('[generarSlotsDisponibles] Disponibilidades encontradas:', disponibilidades.length);

  // 2. Obtener turnos existentes para esta fecha y odontólogo
  const { Turno } = await import('../models/index.js');
  // Crear fecha en zona horaria local para evitar problemas de UTC
  const fechaObj = new Date(fechaNormalizada + 'T00:00:00');
  const fechaInicio = new Date(fechaObj);
  fechaInicio.setHours(0, 0, 0, 0);
  const fechaFin = new Date(fechaObj);
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
    // Usar fecha normalizada para construir las fechas de los slots
    const slotInicio = new Date(`${fechaNormalizada}T${slot.inicio}`);
    const slotFin = new Date(`${fechaNormalizada}T${slot.fin}`);

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
  
  // Parsear fechas en zona horaria local (Argentina) para evitar problemas con UTC
  // Si la fecha viene como string "YYYY-MM-DD", crear la fecha en hora local
  const parsearFechaLocal = (fechaStr) => {
    if (typeof fechaStr === 'string' && fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Formato YYYY-MM-DD: parsear como fecha local (no UTC)
      const [year, month, day] = fechaStr.split('-').map(Number);
      return new Date(year, month - 1, day); // month es 0-indexed en Date
    }
    return new Date(fechaStr);
  };
  
  const fechaInicioObj = parsearFechaLocal(fechaInicio);
  const fechaFinObj = parsearFechaLocal(fechaFin);
  
  // Asegurar que las fechas estén en medianoche hora local
  fechaInicioObj.setHours(0, 0, 0, 0);
  fechaFinObj.setHours(23, 59, 59, 999);
  
  if (tipoRecurrencia === 'semanal') {
    // Recurrencia semanal: días específicos de la semana (ej: todos los martes)
    // Nota: diasSemana viene del frontend como [1,2,3,4,5,6] donde 1=Lunes, 6=Sábado
    // getDay() devuelve: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
    // Necesitamos convertir: frontend 1-6 -> getDay() 1-6 (coinciden excepto que frontend no tiene 0)
    const diasSemana = configuracion.diasSemana || [];
    
    for (let fecha = new Date(fechaInicioObj); fecha <= fechaFinObj; fecha.setDate(fecha.getDate() + 1)) {
      const diaSemana = fecha.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
      // El frontend envía: 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
      // getDay() devuelve: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
      // Entonces coinciden directamente (1-6)
      if (diasSemana.includes(diaSemana)) {
        // Formatear fecha como YYYY-MM-DD en hora local
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const fechaStr = `${year}-${month}-${day}`;
        
        disponibilidades.push({
          fecha: fechaStr,
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
    const diaSemana = configuracion.diaSemana; // 1-6 del frontend (1=Lunes, 6=Sábado)
    const posicionMes = configuracion.posicionMes; // 'primero', 'segundo', 'tercero', 'cuarto', 'ultimo'
    
    for (let fecha = new Date(fechaInicioObj); fecha <= fechaFinObj; fecha.setDate(fecha.getDate() + 1)) {
      // Verificar si es el día de la semana correcto
      // getDay() devuelve 0-6, el frontend envía 1-6, coinciden directamente
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
        // Formatear fecha como YYYY-MM-DD en hora local
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        const fechaStr = `${year}-${month}-${day}`;
        
        disponibilidades.push({
          fecha: fechaStr,
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
