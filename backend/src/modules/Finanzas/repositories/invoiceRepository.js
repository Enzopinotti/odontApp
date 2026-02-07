import { Invoice, InvoiceItem } from '../models/index.js';
import { Usuario, Odontologo } from '../../Usuarios/models/index.js'; 
import { Tratamiento, Paciente } from '../../Clinica/models/index.js';

/* --- OPCIONES DE INCLUSIÓN (DRY: Don't Repeat Yourself) --- */
const defaultIncludes = [
  { 
    model: Paciente, 
    as: 'paciente', 
    attributes: ['id', 'nombre', 'apellido', 'dni', 'obraSocial'] 
  },
  { 
    model: Odontologo, 
    as: 'odontologo', 
    include: [{ 
      model: Usuario, 
      as: 'Usuario', // El usuario asociado al perfil de Odontólogo
      attributes: ['id', 'nombre', 'apellido'] 
    }]
  },
  // ✅ NUEVO: Incluimos al Creador de la orden (Usuario logueado que hizo el POST)
  // Esto permite que el Frontend diga: "Cargado por: Juan Perez"
  {
    model: Usuario,
    as: 'Usuario', // Asegúrate de que coincida con el alias en tu modelo Invoice.js
    attributes: ['id', 'nombre', 'apellido', 'email', 'rolId']
  },
  { 
    model: InvoiceItem, 
    as: 'items',
    include: [{ 
      model: Tratamiento, 
      as: 'tratamiento', // Para ver el nombre del tratamiento en el detalle
      attributes: ['nombre', 'precio'] 
    }]
  }
];

/* --- FUNCIONES DEL REPOSITORIO --- */

export const create = async (data, items) => {
  // 1. Creamos la factura y los items en una sola operación
  const nuevaFactura = await Invoice.create({
    ...data,
    items // Sequelize crea los InvoiceItems automáticamente si la asociación está bien
  }, {
    include: [{ model: InvoiceItem, as: 'items' }]
  });

  // 2. 🔥 TRUCO CLAVE: Recargamos la factura con todas las relaciones (Paciente, Odonto, Creador)
  // Si no hacemos esto, el Frontend recibe solo IDs y muestra datos vacíos o "undefined".
  return await findById(nuevaFactura.id);
};

export const findById = async (id) => {
  return await Invoice.findByPk(id, {
    include: defaultIncludes
  });
};

export const findPaginated = async (filtros = {}, page = 1, perPage = 20) => {
  const offset = (page - 1) * perPage;
  const where = {};

  // Filtros dinámicos
  if (filtros.estado) where.estado = filtros.estado;
  if (filtros.patientId) where.patientId = filtros.patientId;
  if (filtros.odontologoId) where.odontologoId = filtros.odontologoId;

  // Búsqueda paginada
  return await Invoice.findAndCountAll({
    where,
    offset,
    limit: perPage,
    order: [['createdAt', 'DESC']], // Las más recientes primero
    distinct: true, // Importante para contar facturas, no items
    include: defaultIncludes
  });
};

// Aseguramos que sea asíncrono y devuelva la instancia actualizada
export const update = async (instancia, data) => {
  if (!instancia) throw new Error("No se puede actualizar una factura inexistente");
  
  // Actualiza los campos en la base de datos
  await instancia.update(data);

  // Recargamos con includes para devolver el objeto completo y actualizado
  await instancia.reload({ include: defaultIncludes }); 
  
  return instancia;
};