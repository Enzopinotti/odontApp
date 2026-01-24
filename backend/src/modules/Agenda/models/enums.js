// Enumeraciones para el módulo de Agenda
export const EstadoTurno = {
  PENDIENTE: 'PENDIENTE',
  ASISTIO: 'ASISTIO', 
  AUSENTE: 'AUSENTE',
  CANCELADO: 'CANCELADO'
};

export const TipoDisponibilidad = {
  LABORAL: 'LABORAL',
  NOLABORAL: 'NOLABORAL'
};

// Función helper para validar estados de turno
export const esEstadoValido = (estado) => {
  return Object.values(EstadoTurno).includes(estado);
};

// Función helper para validar tipos de disponibilidad
export const esTipoDisponibilidadValido = (tipo) => {
  return Object.values(TipoDisponibilidad).includes(tipo);
};
