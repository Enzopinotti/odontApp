// src/api/finanzas.js
import api from './axios';

/** FACTURACIÓN (Odontólogo -> Recepción) */

// Crear orden de cobro (Odontólogo)
export async function crearOrdenCobro(payload) {
  // payload: { patientId, items: [{ treatmentId, cantidad }], observaciones }
  const res = await api.post('/finanzas/facturas', payload);
  return res.data;
}

// Listar facturas (Recepción: filtro ?estado=PENDIENTE_PAGO)
export async function getFacturas(params = {}) {
  const res = await api.get('/finanzas/facturas', { params });
  return res.data; // { data: [], meta: { total, ... } }
}

// Registrar Pago (Recepción)
export async function registrarPago(id, payload) {
  // payload: { metodoPago: 'EFECTIVO' | 'TARJETA' ... }
  const res = await api.put(`/finanzas/facturas/${id}/pagar`, payload);
  return res.data;
}

/** PRESUPUESTOS */

export async function crearPresupuesto(payload) {
  const res = await api.post('/finanzas/presupuestos', payload);
  return res.data;
}

// Obtener presupuestos de un paciente
export async function getPresupuestosPaciente(patientId) {
  const res = await api.get(`/finanzas/presupuestos`, { params: { patientId } });
  return res.data;
}