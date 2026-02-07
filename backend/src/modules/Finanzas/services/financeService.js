import * as invoiceRepo from '../repositories/invoiceRepository.js';
import * as budgetRepo from '../repositories/budgetRepository.js';

// Importamos modelos de otros módulos
import { Odontologo } from '../../Usuarios/models/index.js'; 
import { Tratamiento } from '../../Clinica/models/index.js';

import ApiError from '../../../utils/ApiError.js';

/* --- 🛠 Helpers --- */

const resolverResponsable = async (userId, manualOdontologoId) => {
  console.log("🕵️ [DEBUG] Resolviendo Responsable:");
  console.log("   👉 User ID Logueado:", userId);
  console.log("   👉 Odontólogo manual (Input):", manualOdontologoId);

  // 1. Buscamos si el usuario logueado es un Odontólogo
  const perfilOdonto = await Odontologo.findOne({ where: { userId } });

  if (perfilOdonto) {
    console.log("   ✅ El usuario ES odontólogo. ID:", perfilOdonto.id);
    return perfilOdonto.id; // Es Odontólogo, la orden es suya
  } 
  
  // 2. Si no es odonto, revisamos si eligió uno manualmente
  if (manualOdontologoId) {
    console.log("   ✅ Se asigna al odontólogo seleccionado manualmente:", manualOdontologoId);
    return manualOdontologoId; // Es Recep/Admin y eligió un Odontólogo manual
  }

  console.log("   ⚠️ No se asignó odontólogo (Orden de Clínica/Sistema)");
  return null; // Es orden de la Clínica (Sistema)
};

const calcularItems = async (itemsInput) => {
  let total = 0;
  
  const itemsProcesados = await Promise.all(itemsInput.map(async (item) => {
    const tratamiento = await Tratamiento.findByPk(item.treatmentId);
    
    if (!tratamiento) {
      throw new ApiError(`El tratamiento con ID ${item.treatmentId} no existe o no está activo`, 400);
    }
    
    const precioReal = Number(tratamiento.precio);
    const subtotal = precioReal * item.cantidad;
    total += subtotal;

    return {
      treatmentId: item.treatmentId,
      cantidad: item.cantidad,
      precioUnitario: precioReal,
      subtotal
    };
  }));
  
  return { total, itemsProcesados };
};

/* --- 🧾 Facturación --- */

export const crearOrdenCobro = async (data, userId) => {
  console.log("📝 [DEBUG] Iniciando crearOrdenCobro para User:", userId);

  let itemsAGuardar = [];
  let totalFactura = 0;

  // 1. Calcular Totales
  if (data.budgetId) {
    const presupuesto = await budgetRepo.findById(data.budgetId);
    if (!presupuesto) throw new ApiError('El presupuesto indicado no existe', 404);
    
    totalFactura = Number(presupuesto.total);
    itemsAGuardar = presupuesto.items.map(i => ({
      treatmentId: i.treatmentId,
      cantidad: i.cantidad,
      precioUnitario: i.precioUnitario,
      subtotal: i.subtotal
    }));
  } 
  else if (data.items && data.items.length > 0) {
    const calculo = await calcularItems(data.items);
    totalFactura = calculo.total;
    itemsAGuardar = calculo.itemsProcesados;
  } 
  else {
    throw new ApiError('Debe indicar items o un presupuesto para facturar', 400);
  }

  // 2. Definir Responsable
  const idOdontologoFinal = await resolverResponsable(userId, data.odontologoId);
  const estadoInicial = data.estado || 'ENVIADO';

  // 3. Preparar datos para BD
  // 🚨 TRUCO DE SEGURIDAD: Enviamos las claves en minúscula Y mayúscula
  const datosFactura = {
    patientId: data.patientId,
    PatientId: data.patientId, 

    usuarioId: userId,        
    UsuarioId: userId,         

    odontologoId: idOdontologoFinal, 
    OdontologoId: idOdontologoFinal,

    budgetId: data.budgetId || null,
    total: totalFactura,
    estado: estadoInicial, 
    observaciones: data.observaciones,
    patientName: data.patientName 
  };

  console.log("💾 [DEBUG] Guardando Factura en BD:", datosFactura);

  // 4. Crear en BD
  const nuevaFactura = await invoiceRepo.create(datosFactura, itemsAGuardar);

  console.log("✅ [DEBUG] Factura creada con ID:", nuevaFactura.id);

  // 5. Devolver objeto completo
  return await invoiceRepo.findById(nuevaFactura.id);
};

export const gestionarPago = async (invoiceId, datosPago, userId) => {
  console.log("💰 [DEBUG] Gestionando Pago. ID Factura:", invoiceId);

  const factura = await invoiceRepo.findById(invoiceId);
  
  if (!factura) throw new ApiError('Factura no encontrada', 404);
  
  if (factura.estado === 'PAGADO') {
    throw new ApiError('Esta factura ya fue pagada anteriormente', 400);
  }

  // Actualizar
  await invoiceRepo.update(factura, {
    estado: 'PAGADO',
    metodoPago: datosPago.metodoPago || 'Efectivo', 
    fechaPago: new Date()
  });
  
  console.log("✅ [DEBUG] Factura actualizada a PAGADO");

  return await invoiceRepo.findById(invoiceId);
};

export const listarFacturas = async (filtros, page, perPage, userId) => {
  const filtrosSeguros = { ...filtros };

  // Si es Odontólogo, forzamos que solo vea sus facturas
  const perfilOdonto = await Odontologo.findOne({ where: { userId } });
  if (perfilOdonto) {
    filtrosSeguros.odontologoId = perfilOdonto.id;
  }

  const { count, rows } = await invoiceRepo.findPaginated(filtrosSeguros, page, perPage);
  return { data: rows, total: count };
};

/* --- 📜 Presupuestos --- */

export const crearPresupuesto = async (data, userId) => {
  const { total, itemsProcesados } = await calcularItems(data.items);
  
  const idOdontologoFinal = await resolverResponsable(userId, data.odontologoId);

  const nuevoPresupuesto = await budgetRepo.create({
    patientId: data.patientId,
    usuarioId: userId, 
    UsuarioId: userId, 
    odontologoId: idOdontologoFinal,
    OdontologoId: idOdontologoFinal,
    total,
    estado: 'BORRADOR',
    observaciones: data.observaciones
  }, itemsProcesados);

  return await budgetRepo.findById(nuevoPresupuesto.id);
};

export default {
  crearOrdenCobro,
  gestionarPago,
  listarFacturas,
  crearPresupuesto
};