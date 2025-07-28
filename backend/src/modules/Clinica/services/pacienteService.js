// backend/src/modules/Clinica/services/pacienteService.js

import * as repo from '../repositories/pacienteRepository.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- OBTENER TODOS LOS PACIENTES ---------- */
export const obtenerTodos = async () => {
  return repo.findAll(); // incluye Contacto y Dirección
};

/* ---------- OBTENER POR ID ---------- */
export const obtenerPorId = async (id) => {
  const paciente = await repo.findById(id);
  if (!paciente) {
    throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');
  }
  return paciente;
};

/* ---------- CREAR PACIENTE ---------- */
export const crear = async (data) => {
  const existente = await repo.findByDNI(data.dni);
  if (existente) {
    throw new ApiError('Ya existe un paciente con ese DNI', 409, [
      { field: 'dni', message: 'DNI ya registrado' },
    ], 'DNI_DUPLICADO');
  }

  return repo.createWithContacto(data);
};

/* ---------- ACTUALIZAR PACIENTE ---------- */
export const actualizar = async (id, data) => {
  const paciente = await repo.findById(id);
  if (!paciente) {
    return null;
  }

  return repo.updateWithContacto(paciente, data);
};

/* ---------- ELIMINAR PACIENTE (baja lógica) ---------- */
export const eliminar = async (id) => {
  const paciente = await repo.findById(id);
  if (!paciente) {
    return null;
  }

  await repo.remove(paciente);
  return true;
};
