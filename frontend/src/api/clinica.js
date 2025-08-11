// src/api/clinica.js
import api from './axios';

/** Helpers ----------------------------------------------------- */
const isEmptyStr = (v) => typeof v === 'string' && v.trim() === '';
const toNullIfEmpty = (v) => (isEmptyStr(v) ? null : v);

/** Quita objetos anidados vacíos (Contacto/Direccion) y normaliza DATEONLY */
export function sanitizePacientePayload(form) {
  const out = structuredClone(form);

  // normalizar date-only
  out.ultimaVisita = out.ultimaVisita ? out.ultimaVisita : null;

  // trim básicos
  ['nombre','apellido','dni','obraSocial','nroAfiliado'].forEach(k => {
    if (typeof out[k] === 'string') out[k] = out[k].trim();
  });

  // Contacto
  if (out.Contacto) {
    const c = out.Contacto;
    c.email         = toNullIfEmpty(c.email);
    c.telefonoMovil = toNullIfEmpty(c.telefonoMovil);
    c.telefonoFijo  = toNullIfEmpty(c.telefonoFijo);

    // Direccion
    if (c.Direccion) {
      const d = c.Direccion;
      ['calle','numero','detalle','codigoPostal','ciudad','provincia','pais'].forEach(k=>{
        d[k] = toNullIfEmpty(d[k]);
      });

      const allNullDir = Object.values(d).every(v => v == null);
      if (allNullDir) c.Direccion = null;
    }

    const allNullContacto = (c.email ?? c.telefonoMovil ?? c.telefonoFijo ?? c.preferenciaContacto ?? c.Direccion) == null;
    if (allNullContacto) out.Contacto = null;
  }

  return out;
}

/** Pacientes --------------------------------------------------- */
export async function getPacientes(params) {
  const res = await api.get('/clinica/pacientes', { params });
  return res.data; // SOBRE { success, message, data: { data:[], total } } (o tu shape)
}

export async function getPacienteById(id) {
  const n = Number(id);
  if (!Number.isFinite(n) || n <= 0) throw new Error('Paciente ID inválido');
  const res = await api.get(`/clinica/pacientes/${n}`);
  return res.data; // SOBRE { success, message, data: paciente }
}

export async function crearPaciente(data) {
  const res = await api.post('/clinica/pacientes', sanitizePacientePayload(data));
  return res.data;
}

export async function actualizarPaciente(id, data) {
  const res = await api.put(`/clinica/pacientes/${id}`, sanitizePacientePayload(data));
  return res.data;
}

export async function eliminarPaciente(id) {
  const res = await api.delete(`/clinica/pacientes/${id}`);
  return res.data;
}

/** Odontograma / Tratamientos / Historia clínica ----------------
 * Devolvemos SIEMPRE res.data (sobre) para contrato uniforme
 */
export async function getOdontograma(pacienteId) {
  const res = await api.get(`/clinica/odontograma/${pacienteId}`);
  return res.data;
}
export async function crearOdontograma(pacienteId, data) {
  const res = await api.post(`/clinica/odontograma/${pacienteId}`, data);
  return res.data;
}
export async function actualizarDiente(odontogramaId, numero, data) {
  const res = await api.put(`/clinica/odontograma/${odontogramaId}/diente/${numero}`, data);
  return res.data;
}
export async function registrarCaraTratada(dienteId, data) {
  const res = await api.post(`/clinica/odontograma/diente/${dienteId}/caras`, data);
  return res.data;
}

export async function getTratamientos() {
  const res = await api.get('/clinica/tratamientos');
  return res.data;
}
export async function crearTratamiento(data) {
  const res = await api.post('/clinica/tratamientos', data);
  return res.data;
}
export async function actualizarTratamiento(id, data) {
  const res = await api.put(`/clinica/tratamientos/${id}`, data);
  return res.data;
}
export async function eliminarTratamiento(id) {
  const res = await api.delete(`/clinica/tratamientos/${id}`);
  return res.data;
}
export async function getHistorialTratamientos(pacienteId) {
  const res = await api.get(`/clinica/tratamientos/paciente/${pacienteId}/historial`);
  return res.data;
}

export async function getHistoriaClinica(pacienteId) {
  const res = await api.get(`/clinica/historia/${pacienteId}`);
  return res.data;
}
export async function registrarEntradaClinica(pacienteId, data) {
  const res = await api.post(`/clinica/historia/${pacienteId}`, data);
  return res.data;
}
export async function subirImagenClinica(historiaClinicaId, formData) {
  const res = await api.post(`/clinica/historia/${historiaClinicaId}/imagenes`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
export async function getImagenesPaciente(pacienteId) {
  const res = await api.get(`/clinica/historia/paciente/${pacienteId}/imagenes`);
  return res.data;
}
export async function eliminarImagenClinica(imagenId) {
  const res = await api.delete(`/clinica/historia/imagenes/${imagenId}`);
  return res.data;
}

export async function actualizarCaraTratada(caraId, data) {
  const res = await api.put(`/clinica/odontograma/caras/${caraId}`, data);
  return res.data;
}
export async function eliminarCaraTratada(caraId) {
  const res = await api.delete(`/clinica/odontograma/caras/${caraId}`);
  return res.data;
}