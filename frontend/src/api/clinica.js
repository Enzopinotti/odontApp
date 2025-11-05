// src/api/clinica.js
import api from './axios';

/** Helpers ----------------------------------------------------- */
const isEmptyStr = (v) => typeof v === 'string' && v.trim() === '';
const toNullIfEmpty = (v) => (isEmptyStr(v) ? null : v);

/** Sanitizar payload de paciente */
export function sanitizePacientePayload(form) {
  const out = structuredClone(form);

  // normalizar date-only
  out.ultimaVisita = out.ultimaVisita ? out.ultimaVisita : null;

  // trims
  ['nombre','apellido','dni','obraSocial','nroAfiliado'].forEach(k => {
    if (typeof out[k] === 'string') out[k] = out[k].trim();
  });

  // --- Contacto / Dirección ---
  // Aseguramos estructura
  out.Contacto = out.Contacto ?? {};
  out.Contacto.Direccion = out.Contacto.Direccion ?? {};

  // Normalizamos vacíos a null
  const c = out.Contacto;
  c.email         = toNullIfEmpty(c.email);
  c.telefonoMovil = toNullIfEmpty(c.telefonoMovil);
  c.telefonoFijo  = toNullIfEmpty(c.telefonoFijo);

  const d = c.Direccion;
  ['calle','numero','detalle','codigoPostal','ciudad','provincia','pais'].forEach(k=>{
    d[k] = toNullIfEmpty(d[k]);
  });

  if (Object.values(d).every(v => v == null)) c.Direccion = null;
  if ((c.email ?? c.telefonoMovil ?? c.telefonoFijo ?? c.preferenciaContacto ?? c.Direccion) == null) out.Contacto = null;

  /* 👇👇 AQUI EL TRUCO: espejamos keys para que el validador (lowercase)
         y el create(include) (CamelCase) estén felices */
  if (out.Contacto) {
    // contacto (lowercase) para el validator
    out.contacto = out.contacto ?? structuredClone(out.Contacto);
    // direccion (lowercase) también
    if (out.contacto.Direccion && !out.contacto.direccion) {
      out.contacto.direccion = structuredClone(out.contacto.Direccion);
    }
  }

  // (opcional) si te viniera en lowercase desde algún form, espejamos al Camel
  if (out.contacto && !out.Contacto) {
    out.Contacto = structuredClone(out.contacto);
    if (out.contacto.direccion && !out.Contacto.Direccion) {
      out.Contacto.Direccion = structuredClone(out.contacto.direccion);
    }
  }

  return out;
}

/** Pacientes --------------------------------------------------- */
export async function crearPaciente(data) {
  const payload = sanitizePacientePayload(data);
  if (process.env.NODE_ENV !== 'production') {
    // 🔎 Log útil para ver lo que realmente enviamos
    console.log('[crearPaciente] payload →', payload);
  }
  const res = await api.post('/clinica/pacientes', payload);
  return res.data;
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

export async function actualizarPaciente(id, data) {
  const res = await api.put(`/clinica/pacientes/${id}`, sanitizePacientePayload(data));
  return res.data;
}

export async function eliminarPaciente(id) {
  const res = await api.delete(`/clinica/pacientes/${id}`);
  return res.data;
}

/** Odontograma / Tratamientos ---------------- */
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

export async function actualizarCaraTratada(caraId, data) {
  const res = await api.put(`/clinica/odontograma/caras/${caraId}`, data);
  return res.data;
}

export async function eliminarCaraTratada(caraId) {
  const res = await api.delete(`/clinica/odontograma/caras/${caraId}`);
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

/** Historia clínica ---------------- */
export async function getHistoriaClinica(pacienteId) {
  const res = await api.get(`/clinica/historia/${pacienteId}`);
  return res.data;
}

// 🔹 CORREGIDO: endpoint correcto para crear historia clínica
export async function crearHistoriaClinica(pacienteId, data) {
  const res = await api.post(`/clinica/historia/${pacienteId}/entrada`, data);
  return res.data;
}

export async function subirImagenClinica(historiaClinicaId, formData) {
  const res = await api.post(`/clinica/historia/${historiaClinicaId}/imagen`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function getImagenesPaciente(pacienteId) {
  const res = await api.get(`/clinica/historia/${pacienteId}/imagenes`);
  return res.data;
}

export async function eliminarImagenClinica(imagenId) {
  const res = await api.delete(`/clinica/historia/imagen/${imagenId}`);
  return res.data;
}

export async function aplicarTratamientoADiente(dienteId, payload) {
  // payload: { tratamientoId, estado?, color?, trazo?, caras? }
  const res = await api.post(`/clinica/odontograma/diente/${dienteId}/aplicar-tratamiento`, payload);
  return res.data;
}
