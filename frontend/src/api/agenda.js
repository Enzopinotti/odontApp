// src/api/agenda.js
import api from './axios';

/** Turnos --------------------------------------------------- */
export async function getTurnos(params) {
  const res = await api.get('/agenda/turnos', { params });
  return res.data;
}

export async function getTurnoById(id) {
  const res = await api.get(`/agenda/turnos/${id}`);
  return res.data;
}

export async function crearTurno(data) {
  const res = await api.post('/agenda/turnos', data);
  return res.data;
}

export async function actualizarTurno(id, data) {
  const res = await api.put(`/agenda/turnos/${id}`, data);
  return res.data;
}

export async function eliminarTurno(id) {
  const res = await api.delete(`/agenda/turnos/${id}`);
  return res.data;
}

export async function cancelarTurno(id, motivo) {
  const res = await api.post(`/agenda/turnos/${id}/cancelar`, { motivo });
  return res.data;
}

// CU-AG01.4 Flujo Alternativo 4a: Cancelación múltiple
export async function cancelarTurnosMultiple(turnoIds, motivo) {
  const res = await api.post('/agenda/turnos/cancelar-multiple', { turnoIds, motivo });
  return res.data;
}

export async function marcarAsistencia(id, nota) {
  const res = await api.post(`/agenda/turnos/${id}/marcar-asistencia`, { nota });
  return res.data;
}

export async function marcarAusencia(id, motivo) {
  const res = await api.post(`/agenda/turnos/${id}/marcar-ausencia`, { motivo });
  return res.data;
}

export async function reprogramarTurno(id, data) {
  const res = await api.put(`/agenda/turnos/${id}/reprogramar`, data);
  return res.data;
}

/** Agenda por fecha ---------------------------------------- */
export async function getAgendaPorFecha(fecha, odontologoId) {
  const params = { fecha };
  if (odontologoId) params.odontologoId = odontologoId;
  const res = await api.get(`/agenda/turnos/agenda/${fecha}`, { params });
  return res.data;
}

export async function getSlotsDisponibles(fecha, odontologoId, duracion = 30) {
  const res = await api.get('/agenda/turnos/slots-disponibles', {
    params: { fecha, odontologoId, duracion }
  });
  return res.data;
}

/** Turnos pendientes y concluidos ------------------------- */
export async function getTurnosPendientesConcluidos(fecha) {
  const res = await api.get('/agenda/turnos/pendientes-concluidos', {
    params: { fecha }
  });
  return res.data;
}

/** Búsqueda de pacientes para turnos --------------------- */
export async function buscarPacientes(termino) {
  const res = await api.get('/agenda/turnos/buscar-pacientes', {
    params: { termino }
  });
  return res.data;
}

export async function crearPacienteRapido(data) {
  const res = await api.post('/agenda/turnos/crear-paciente-rapido', data);
  return res.data;
}

/** Odontólogos y tratamientos ----------------------------- */
export async function getOdontologosPorEspecialidad(especialidad) {
  const res = await api.get('/agenda/turnos/odontologos', {
    params: { especialidad }
  });
  return res.data;
}

export async function getTratamientos() {
  const res = await api.get('/agenda/turnos/tratamientos');
  return res.data;
}

/** Procesar ausencias automáticas ------------------------- */
export async function procesarAusenciasAutomaticas() {
  const res = await api.post('/agenda/turnos/procesar-ausencias-automaticas');
  return res.data;
}

/** Disponibilidades ---------------------------------------- */
export async function getDisponibilidades(filtros = {}) {
  const res = await api.get('/agenda/disponibilidades', { params: filtros });
  return res.data;
}

export async function getDisponibilidadById(id) {
  const res = await api.get(`/agenda/disponibilidades/${id}`);
  return res.data;
}

export async function getDisponibilidadesPorOdontologo(odontologoId, filtros = {}) {
  const res = await api.get(`/agenda/disponibilidades/odontologo/${odontologoId}`, { params: filtros });
  return res.data;
}

export async function crearDisponibilidad(data) {
  const res = await api.post('/agenda/disponibilidades', data);
  return res.data;
}

export async function actualizarDisponibilidad(id, data) {
  const res = await api.put(`/agenda/disponibilidades/${id}`, data);
  return res.data;
}

export async function eliminarDisponibilidad(id) {
  const res = await api.delete(`/agenda/disponibilidades/${id}`);
  return res.data;
}

export async function generarDisponibilidadesAutomaticas(data) {
  const res = await api.post('/agenda/disponibilidades/generar-automaticas', data);
  return res.data;
}

export async function generarDisponibilidadesRecurrentes(data) {
  const res = await api.post('/agenda/disponibilidades/generar-recurrentes', data);
  return res.data;
}

export async function validarDisponibilidad(data) {
  const res = await api.post('/agenda/disponibilidades/validar', data);
  return res.data;
}

