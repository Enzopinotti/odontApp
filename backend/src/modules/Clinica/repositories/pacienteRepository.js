// backend/src/modules/Clinica/repositories/pacienteRepository.js
import {
  Paciente,
  Contacto,
  Direccion,
  FirmaDigital,
  EstadoPaciente,
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
      { model: EstadoPaciente, as: 'Estado' },
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
      { model: EstadoPaciente, as: 'Estado' },
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
      { model: EstadoPaciente, as: 'Estado' },
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
      { model: EstadoPaciente, as: 'Estado' },
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
  let paciente;

  // Traer siempre el paciente con asociaciones
  if (typeof pacienteOrId === 'number') {
    paciente = await findById(pacienteOrId);
  } else {
    paciente = await findById(pacienteOrId.id);
  }

  if (!paciente) throw new Error('Paciente no encontrado');

  // 🔧 SEPARAR datos del paciente de las asociaciones
  const { Contacto: contactoData, Estado, ...pacienteData } = data;

  // Si se pasa un estadoId explícito o un objeto Estado, actualizar estadoId
  if (data.estadoId) pacienteData.estadoId = data.estadoId;
  else if (Estado && Estado.id) pacienteData.estadoId = Estado.id;

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
  await paciente.update({ estadoId: 2 });
  await paciente.destroy(); // Para que también marque deletedAt (paranoid)
};

/* ---------- Crear firma digital ---------- */
export const crearFirma = async (pacienteId, data) => {
  return FirmaDigital.create({
    ...data,
    pacienteId,
  });
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
    { model: EstadoPaciente, as: 'Estado', required: false },
  ];

  const {
    q,
    dni,
    nombre,
    apellido,
    estadoId,
    telefono,
    obraSocial,
    direccion,
    turnoActual,
    desdeUltimaVisita,
    hastaUltimaVisita,
    desdeRegistro,
    hastaRegistro,
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

  // Filtros explícitos
  if (dni) where.dni = { [Op.like]: `%${dni}%` };
  if (nombre) where.nombre = { [Op.like]: `%${nombre}%` };
  if (apellido) where.apellido = { [Op.like]: `%${apellido}%` };
  if (estadoId) where.estadoId = estadoId;

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

  if (desdeRegistro || hastaRegistro) {
    where.createdAt = {
      ...(desdeRegistro && { [Op.gte]: desdeRegistro }),
      ...(hastaRegistro && { [Op.lte]: hastaRegistro }),
    };
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
    where.ultimaVisita = {
      ...(desdeUltimaVisita && { [Op.gte]: desdeUltimaVisita }),
      ...(hastaUltimaVisita && { [Op.lte]: hastaUltimaVisita }),
    };
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
