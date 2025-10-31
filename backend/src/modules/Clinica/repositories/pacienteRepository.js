// backend/src/modules/Clinica/repositories/pacienteRepository.js
import {
  Paciente,
  Contacto,
  Direccion,
  FirmaDigital,
  AntecedenteMedico,
  HistoriaClinica,
} from '../models/index.js';
import { Op, Sequelize } from 'sequelize';

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
    include: [
      {
        model: Contacto,
        include: [Direccion],
      },
    ],
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
    include: [
      {
        model: Contacto,
        include: [Direccion],
      },
    ],
  });
};

/* ---------- Buscar por DNI exacto ---------- */
export const findByDNI = (dni) =>
  Paciente.findOne({
    where: { dni },
    include: [
      {
        model: Contacto,
        include: [Direccion],
      },
    ],
  });

/* ---------- Crear paciente con contacto y dirección ---------- */
export const createWithContacto = async (data) => {
  return Paciente.create(data, {
    include: [{ model: Contacto, include: [Direccion] }],
  });
};

/* ---------- Actualizar datos del paciente con creación automática de Contacto/Direccion ---------- */
export const updateWithContacto = async (pacienteOrId, data) => {

    // 🔍 DEBUG TEMPORAL - REMOVER DESPUÉS
  console.log('🔍 updateWithContacto called with:');
  console.log('  - pacienteOrId:', pacienteOrId);
  console.log('  - data:', JSON.stringify(data, null, 2));
  let paciente;

  // Traer siempre el paciente con asociaciones
  if (typeof pacienteOrId === 'number') {
    paciente = await findById(pacienteOrId);
  } else {
    paciente = await findById(pacienteOrId.id);
  }

  if (!paciente) throw new Error('Paciente no encontrado');

  // 🔧 SEPARAR datos del paciente de las asociaciones
  const { Contacto: contactoData, ...pacienteData } = data;

  // ✅ Actualizar SOLO los datos que pertenecen al modelo Paciente
  if (Object.keys(pacienteData).length > 0) {
    await paciente.update(pacienteData);
  }

  // Manejar Contacto
  if (contactoData) {
    // Separar datos de Direccion de los datos de Contacto
    const { Direccion: direccionData, ...contactoFields } = contactoData;

    if (!paciente.Contacto) {
      // Crear nuevo contacto
      paciente.Contacto = await Contacto.create({
        ...contactoFields,
        pacienteId: paciente.id,
      });
    } else {
      // Actualizar contacto existente
      if (Object.keys(contactoFields).length > 0) {
        await paciente.Contacto.update(contactoFields);
      }
    }

    // Manejar Direccion dentro de Contacto
    if (direccionData) {
      if (!paciente.Contacto.Direccion) {
        // Crear nueva dirección
        paciente.Contacto.Direccion = await Direccion.create({
          ...direccionData,
          contactoId: paciente.Contacto.id,
        });
      } else {
        // Actualizar dirección existente
        if (Object.keys(direccionData).length > 0) {
          await paciente.Contacto.Direccion.update(direccionData);
        }
      }
    }
  }

  return findById(paciente.id); // Devolver instancia fresca
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
    direccion,
    turnoActual,
    desdeUltimaVisita,
    hastaUltimaVisita,
    orden = 'apellido',
  } = queryParams;

  if (q) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${q}%` } },
      { apellido: { [Op.like]: `%${q}%` } },
      { dni: { [Op.like]: `%${q}%` } },
    ];

    contactoWhere[Op.or] = [
      { telefonoMovil: { [Op.like]: `%${q}%` } },
      { telefonoFijo: { [Op.like]: `%${q}%` } },
    ];
  }

  if (obraSocial) where.obraSocial = { [Op.like]: `%${obraSocial}%` };
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

  if (turnoActual === 'true') {
    const hoy = new Date().toISOString().split('T')[0];
    include.push({
      model: HistoriaClinica,
      attributes: [],
      required: true,
      where: { fecha: { [Op.eq]: hoy } },
    });
  }

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

/* ---------- Obtener última visita de un paciente ---------- */
export const getUltimaVisita = async (pacienteId) => {
  const resultado = await HistoriaClinica.findOne({
    where: { pacienteId },
    attributes: [[Sequelize.fn('MAX', Sequelize.col('fecha')), 'ultimaVisita']],
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
  getUltimaVisita,
};
