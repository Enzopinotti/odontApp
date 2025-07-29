// src/api/clinica.js
import api from './axios';

/* ------------------------ 🦷 PACIENTES ------------------------ */

export const getPacientes = () => api.get('/clinica/pacientes');
export const getPacienteById = (id) => api.get(`/clinica/pacientes/${id}`);
export const crearPaciente = (data) => api.post('/clinica/pacientes', data);
export const actualizarPaciente = (id, data) => api.put(`/clinica/pacientes/${id}`, data);
export const eliminarPaciente = (id) => api.delete(`/clinica/pacientes/${id}`);

/* ------------------------ 📊 ODONTOGRAMA ------------------------ */

export const getOdontograma = (pacienteId) => api.get(`/clinica/odontograma/${pacienteId}`);
export const crearOdontograma = (pacienteId, data) =>
  api.post(`/clinica/odontograma/${pacienteId}`, data);
export const actualizarDiente = (odontogramaId, numero, data) =>
  api.put(`/clinica/odontograma/${odontogramaId}/diente/${numero}`, data);
export const registrarCaraTratada = (dienteId, data) =>
  api.post(`/clinica/odontograma/diente/${dienteId}/caras`, data);

/* ------------------------ 🧾 TRATAMIENTOS ------------------------ */

export const getTratamientos = () => api.get('/clinica/tratamientos');
export const crearTratamiento = (data) => api.post('/clinica/tratamientos', data);
export const actualizarTratamiento = (id, data) => api.put(`/clinica/tratamientos/${id}`, data);
export const eliminarTratamiento = (id) => api.delete(`/clinica/tratamientos/${id}`);
export const getHistorialTratamientos = (pacienteId) =>
  api.get(`/clinica/tratamientos/paciente/${pacienteId}/historial`);

/* ------------------------ 🩺 HISTORIA CLÍNICA ------------------------ */

export const getHistoriaClinica = (pacienteId) =>
  api.get(`/clinica/historia/${pacienteId}`);
export const registrarEntradaClinica = (pacienteId, data) =>
  api.post(`/clinica/historia/${pacienteId}`, data);
export const subirImagenClinica = (historiaClinicaId, formData) =>
  api.post(`/clinica/historia/${historiaClinicaId}/imagenes`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const getImagenesPaciente = (pacienteId) =>
  api.get(`/clinica/historia/paciente/${pacienteId}/imagenes`);
export const eliminarImagenClinica = (imagenId) =>
  api.delete(`/clinica/historia/imagenes/${imagenId}`);
