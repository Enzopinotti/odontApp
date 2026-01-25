import invoiceRepo from '../repositories/invoiceRepository.js';
import budgetRepo from '../repositories/budgetRepository.js';

// 👇 CORRECCIÓN IMPORTANTE: 
// Importamos Tratamiento desde el index de modelos de CLINICA
import { Tratamiento } from '../../Clinica/models/index.js'; 

import ApiError from '../../../utils/ApiError.js';

/* --- 🛠 Helpers --- */

// Calculamos el total en backend para evitar fraudes en frontend
const calcularItems = async (itemsInput) => {
  let total = 0;
  
  // Usamos Promise.all para esperar a que se verifiquen todos los precios en la BD
  const itemsProcesados = await Promise.all(itemsInput.map(async (item) => {
    // Buscamos el tratamiento en la BD para obtener el precio REAL
    const tratamiento = await Tratamiento.findByPk(item.treatmentId);
    
    if (!tratamiento) {
      throw new ApiError(`El tratamiento con ID ${item.treatmentId} no existe o no está activo`, 400);
    }
    
    // Convertimos precio a número por seguridad
    const precioReal = Number(tratamiento.precio);
    const subtotal = precioReal * item.cantidad;
    total += subtotal;

    return {
      treatmentId: item.treatmentId,
      cantidad: item.cantidad,
      precioUnitario: precioReal, // Guardamos el precio del momento (congelado)
      subtotal
    };
  }));
  
  return { total, itemsProcesados };
};

/* --- 🧾 Facturación --- */

export const crearOrdenCobro = async (data, odontologoId) => {
  let itemsAGuardar = [];
  let totalFactura = 0;

  // CASO A: Facturar desde un Presupuesto existente
  if (data.budgetId) {
    const presupuesto = await budgetRepo.findById(data.budgetId);
    if (!presupuesto) {
      throw new ApiError('El presupuesto indicado no existe', 404);
    }
    
    // Copiamos los datos del presupuesto a la factura
    totalFactura = Number(presupuesto.total);
    itemsAGuardar = presupuesto.items.map(i => ({
      treatmentId: i.treatmentId,
      cantidad: i.cantidad,
      precioUnitario: i.precioUnitario,
      subtotal: i.subtotal
    }));
  } 
  // CASO B: Facturar items directos (seleccionados en el momento)
  else if (data.items && data.items.length > 0) {
    const calculo = await calcularItems(data.items);
    totalFactura = calculo.total;
    itemsAGuardar = calculo.itemsProcesados;
  } 
  else {
    throw new ApiError('Debe indicar items o un presupuesto para facturar', 400);
  }

  // Creamos la factura usando el repositorio
  // El estado nace como 'PENDIENTE_PAGO' para que aparezca en Caja
  return invoiceRepo.create({
    patientId: data.patientId,
    odontologoId, // El ID del usuario logueado (odontólogo)
    budgetId: data.budgetId || null,
    total: totalFactura,
    estado: 'PENDIENTE_PAGO', 
    observaciones: data.observaciones
  }, itemsAGuardar);
};

export const gestionarPago = async (invoiceId, datosPago) => {
  const factura = await invoiceRepo.findById(invoiceId);
  
  if (!factura) {
    throw new ApiError('Factura no encontrada', 404);
  }
  
  if (factura.estado === 'PAGADO') {
    throw new ApiError('Esta factura ya fue pagada anteriormente', 400);
  }

  // Actualizamos estado, método de pago y fecha
  return invoiceRepo.update(factura, {
    estado: 'PAGADO',
    metodoPago: datosPago.metodoPago, // Ej: 'EFECTIVO', 'TARJETA'
    fechaPago: new Date()
  });
};

export const listarFacturas = async (filtros, page, perPage) => {
  // Llama al repositorio que maneja el findAndCountAll con filtros
  const { count, rows } = await invoiceRepo.findPaginated(filtros, page, perPage);
  return { data: rows, total: count };
};

/* --- 📜 Presupuestos --- */

export const crearPresupuesto = async (data, odontologoId) => {
  // Validamos items y calculamos totales
  const { total, itemsProcesados } = await calcularItems(data.items);
  
  // Creamos presupuesto en estado BORRADOR
  return budgetRepo.create({
    patientId: data.patientId,
    odontologoId,
    total,
    estado: 'BORRADOR',
    observaciones: data.observaciones
  }, itemsProcesados);
};

// Exportamos por defecto
export default {
  crearOrdenCobro,
  gestionarPago,
  listarFacturas,
  crearPresupuesto
};