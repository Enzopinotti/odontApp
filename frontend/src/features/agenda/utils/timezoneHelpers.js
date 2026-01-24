// Utilidades para manejar zona horaria de Argentina

/**
 * Obtiene la hora y minutos de una fecha en la zona horaria de Argentina
 * @param {Date|string} fechaISO - Fecha en formato Date o string ISO
 * @returns {Object} - Objeto con { hora, minutos }
 */
export const getHoraArgentina = (fechaISO) => {
  // Si la fecha viene como string ISO, convertirla a Date
  const fecha = typeof fechaISO === 'string' ? new Date(fechaISO) : fechaISO;
  
  // Usar Intl.DateTimeFormat para obtener componentes en zona horaria de Argentina
  const formatter = new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const partes = formatter.formatToParts(fecha);
  const hora = parseInt(partes.find(p => p.type === 'hour').value, 10);
  const minutos = parseInt(partes.find(p => p.type === 'minute').value, 10);
  
  return { hora, minutos };
};

/**
 * Obtiene un string de hora en formato HH:MM en zona horaria de Argentina
 * @param {Date|string} fechaISO - Fecha en formato Date o string ISO
 * @returns {string} - Hora en formato "HH:MM"
 */
export const getHoraStringArgentina = (fechaISO) => {
  const { hora, minutos } = getHoraArgentina(fechaISO);
  return `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
};

