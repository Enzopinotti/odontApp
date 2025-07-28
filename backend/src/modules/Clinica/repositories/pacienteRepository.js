// backend/src/modules/Clinica/repositories/pacienteRepository.js
import {
  Paciente,
  Contacto,
  Direccion,
  FirmaDigital,
  AntecedenteMedico,
  HistoriaClinica,
} from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

/* ---------- Obtener paciente por ID ---------- */
export const findById = (id) =>
  Paciente.findByPk(id, {
    include: [
      {
        model: Contacto,
        include: [Direccion],
      },
      FirmaDigital,
      AntecedenteMedico,
    ],
  });

/* ---------- Obtener todos los pacientes paginados ---------- */
export const findPaginated = (page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  return Paciente.findAndCountAll({
    offset,
    limit: perPage,
    order: [['createdAt', 'DESC']],
    include: [Contacto],
  });
};

/* ---------- Buscar pacientes por nombre, apellido o DNI ---------- */
export const search = (query, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;

  return Paciente.findAndCountAll({
    where: {
      [Op.or]: [
        { nombre: { [Op.like]: `%${query}%` } },
        { apellido: { [Op.like]: `%${query}%` } },
        { dni: { [Op.like]: `%${query}%` } },
      ],
    },
    offset,
    limit: perPage,
    order: [['apellido', 'ASC']],
    include: [Contacto],
  });
};

/* ---------- Buscar por DNI exacto ---------- */
export const findByDNI = (dni) =>
  Paciente.findOne({
    where: { dni },
    include: [Contacto],
  });

/* ---------- Crear paciente con contacto y dirección ---------- */
export const createWithContacto = async (data) => {
  return Paciente.create(data, {
    include: [{ model: Contacto, include: [Direccion] }],
  });
};

/* ---------- Actualizar datos del paciente ---------- */
export const updateWithContacto = async (paciente, data) => {
  await paciente.update(data);

  if (data.Contacto) {
    await paciente.Contacto.update(data.Contacto);

    if (data.Contacto.Direccion && paciente.Contacto.Direccion) {
      await paciente.Contacto.Direccion.update(data.Contacto.Direccion);
    }
  }

  return paciente;
};

/* ---------- Eliminar paciente (baja lógica) ---------- */
export const remove = async (paciente) => {
  await paciente.destroy();
};

/* ---------- Filtro avanzado de pacientes ---------- */
export const findFiltered = async (queryParams = {}, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  const where = {};
  const contactoWhere = {};
  const direccionWhere = {};
  const include = [
    {
      model: Contacto,
      where: contactoWhere,
      required: false,
      include: [
        {
          model: Direccion,
          where: direccionWhere,
          required: false,
        },
      ],
    },
  ];

  const {
    q,
    telefono,
    obraSocial,
    desdeUltimaVisita,
    hastaUltimaVisita,
    orden = 'apellido',
    direccion,
  } = queryParams;

  // Búsqueda textual general
  if (q) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${q}%` } },
      { apellido: { [Op.like]: `%${q}%` } },
      { dni: { [Op.like]: `%${q}%` } },
    ];
  }

  if (obraSocial) {
    where.obraSocial = { [Op.like]: `%${obraSocial}%` };
  }

  if (telefono) {
    contactoWhere[Op.or] = [
      { telefonoMovil: { [Op.like]: `%${telefono}%` } },
      { telefonoFijo: { [Op.like]: `%${telefono}%` } },
    ];
  }

  if (direccion) {
    direccionWhere[Op.or] = [
      { calle: { [Op.like]: `%${direccion}%` } },
      { ciudad: { [Op.like]: `%${direccion}%` } },
    ];
  }

  // Filtro por fecha de última consulta
  if (desdeUltimaVisita || hastaUltimaVisita) {
    include.push({
      model: HistoriaClinica,
      attributes: [],
      required: true,
      where: {
        ...(desdeUltimaVisita && { fecha: { [Op.gte]: desdeUltimaVisita } }),
        ...(hastaUltimaVisita && { fecha: { [Op.lte]: hastaUltimaVisita } }),
      },
    });
  }

  return Paciente.findAndCountAll({
    where,
    include,
    offset,
    limit: perPage,
    distinct: true,
    order: [[orden, 'ASC']],
  });
};

export const getUltimaVisita = async (pacienteId) => {
  const resultado = await HistoriaClinica.findOne({
    where: { pacienteId },
    attributes: [
      [Sequelize.fn('MAX', Sequelize.col('fecha')), 'ultimaVisita']
    ],
    raw: true,
  });

  return resultado?.ultimaVisita || null;
};

export default {
  findById,
  findByDNI,
  findPaginated,
  search,
  createWithContacto,
  updateWithContacto,
  remove,
  findFiltered,
  getUltimaVisita
};
