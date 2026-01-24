// backend/src/modules/Clinica/services/pacienteService.js

import * as repo from '../repositories/pacienteRepository.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- OBTENER TODOS LOS PACIENTES ---------- */
export const obtenerTodos = async () => {
  const { rows: pacientes, count } = await repo.findPaginated(1, 100);
  const data = pacientes.map((p) => p.toJSON());
  return { data, total: count };
};

/* ---------- BUSCAR CON FILTROS ---------- */
export const buscarConFiltros = async (filtros, page = 1, perPage = 20) => {
  const { rows: pacientes, count } = await repo.findFiltered(filtros, page, perPage);
  return { data: pacientes.map((p) => p.toJSON()), total: count };
};

/* ---------- OBTENER POR ID ---------- */
export const obtenerPorId = async (id) => {
  const paciente = await repo.findById(id);
  if (!paciente) {
    throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');
  }
  return paciente.toJSON();
};

/* ---------- CREAR PACIENTE ---------- */
export const crear = async (data) => {
  // Normalizamos keys: contacto/direccion
  if (data.contacto) {
    data.Contacto = data.contacto;
    delete data.contacto;
  }
  if (data.Contacto && data.Contacto.direccion) {
    data.Contacto.Direccion = data.Contacto.direccion;
    delete data.Contacto.direccion;
  }

  // DNI duplicado
  const existente = await repo.findByDNI(data.dni);
  if (existente) {
    throw new ApiError(
      'Ya existe un paciente con ese DNI',
      409,
      [{ field: 'dni', message: 'DNI ya registrado' }],
      'DNI_DUPLICADO',
    );
  }

  // Si no viene estadoId, se usará el default del modelo (ACTIVO)
  return repo.createWithContacto(data);
};

// Alias requerido por otros módulos (ej. Agenda)
export const crearPaciente = crear;

/* ---------- ACTUALIZAR PACIENTE ---------- */
export const actualizar = async (id, data) => {
  // 🔧 Normalizar la estructura de datos
  const dataNormalizada = { ...data };

  // Si viene 'contacto' en minúscula, convertir a 'Contacto'
  if (data.contacto) {
    dataNormalizada.Contacto = data.contacto;
    delete dataNormalizada.contacto;
  }

  // Si viene 'direccion' dentro de Contacto, convertir a 'Direccion'
  if (dataNormalizada.Contacto && dataNormalizada.Contacto.direccion) {
    dataNormalizada.Contacto.Direccion = dataNormalizada.Contacto.direccion;
    delete dataNormalizada.Contacto.direccion;
  }

  // Verificar que el paciente existe antes de actualizar
  const pacienteExistente = await repo.findById(id);
  if (!pacienteExistente) {
    throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');
  }

  return repo.updateWithContacto(id, dataNormalizada);
};

/* ---------- ELIMINAR PACIENTE (baja lógica) ---------- */
export const eliminar = async (id) => {
  const paciente = await repo.findById(id);
  if (!paciente) return null;

  await repo.remove(paciente);
  return true;
};
