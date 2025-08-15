/**
 * Convierte las claves del formulario a las esperadas por el backend
 * - Contacto → contacto
 * - Contacto.Direccion → contacto.direccion
 * @param {Object} data
 * @returns {Object}
 */
export function normalizePacienteKeys(data) {
  const paciente = { ...data };

  // Reestructuramos el objeto Contacto
  const contactoOriginal = paciente.Contacto || {};
  const direccionOriginal = contactoOriginal.Direccion || {};

  const contactoNormalizado = {
    email: contactoOriginal.email,
    telefonoMovil: contactoOriginal.telefonoMovil,
    telefonoFijo: contactoOriginal.telefonoFijo,
    preferenciaContacto: contactoOriginal.preferenciaContacto,
    direccion: { ...direccionOriginal }, // 👈 solo "direccion"
  };

  // Eliminamos los originales
  delete paciente.Contacto;

  return {
    ...paciente,
    contacto: contactoNormalizado,
  };
}
