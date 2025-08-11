// backend/src/modules/Clinica/services/pacienteService.js

import * as repo from '../repositories/pacienteRepository.js';
import ApiError from '../../../utils/ApiError.js';

/* ---------- OBTENER TODOS LOS PACIENTES ---------- */
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


export const obtenerPorId = async (id) => {
  const paciente = await repo.findById(id);
  if (!paciente) {
    throw new ApiError('Paciente no encontrado', 404, null, 'PACIENTE_NO_EXISTE');
  }
  return paciente.toJSON(); // ya trae ultimaVisita
};


/* ---------- CREAR PACIENTE ---------- */
export const crear = async (data) => {
  /* Normalizamos keys – aceptamos contacto/direccion en minúscula o TitleCase */
  if (data.contacto) {
    data.Contacto = data.contacto;
    delete data.contacto;
  }
  if (data.Contacto && data.Contacto.direccion) {
    data.Contacto.Direccion = data.Contacto.direccion;
    delete data.Contacto.direccion;
  }

  /* DNI duplicado */
  const existente = await repo.findByDNI(data.dni);
  if (existente) {
    throw new ApiError(
      'Ya existe un paciente con ese DNI',
      409,
      [{ field: 'dni', message: 'DNI ya registrado' }],
      'DNI_DUPLICADO',
    );
  }

  /* Persiste paciente + contacto + dirección */
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
