import api from '../../../api/axios';

export const finanzasApi = {
  /**
   * Crea una nueva orden de cobro / presupuesto.
   * Usado por: Odontólogo (crea orden) o Recepción (crea cobro directo).
   */
  crearOrden: async (payload) => {
    // payload: { patientId, items: [{ treatmentId, precio, cantidad }], observaciones, estado }
    const res = await api.post('/finanzas/facturas', payload);
    return res.data;
  },

  /**
   * Obtiene el historial de facturas con filtros y paginación.
   * Params: { page, limit, search, estado, odontologoId, patientId }
   */
  getFacturas: async (params = {}) => {
    const res = await api.get('/finanzas/facturas', { params });
    return res.data; 
  },

  /**
   * Obtiene específicamente la "Cola de Cobro" para recepción.
   * Filtra por estado 'ENVIADO' (u otro estado intermedio que definas).
   */
  getPendientesCobro: async () => {
    const res = await api.get('/finanzas/facturas', { 
      params: { 
        estado: 'ENVIADO', 
        limit: 50,
        sort: 'createdAt:asc' // Las más antiguas primero
      } 
    });
    return res.data;
  },

  /**
   * Registra el pago de una factura (Caja).
   * Se puede usar para pagos rápidos pasando solo el string del método.
   */
  registrarPago: async (id, metodoPago) => {
    // metodoPago: 'EFECTIVO', 'TARJETA', 'TRANSFERENCIA'
    const res = await api.put(`/finanzas/facturas/${id}/pagar`, { metodoPago });
    return res.data;
  },

  /**
   * Cancela o anula una orden.
   */
  cancelarOrden: async (id, motivo) => {
    const res = await api.put(`/finanzas/facturas/${id}/cancelar`, { motivo });
    return res.data;
  },

  /**
   * Versión flexible para cobrar, recibe el objeto completo de datos de pago.
   * Usado en BillingQueue.js
   */
  cobrarOrden: async (id, datosPago) => {
    // datosPago debe ser { metodoPago: 'EFECTIVO', ...otrosDatos }
    const response = await api.put(`/finanzas/facturas/${id}/pagar`, datosPago);
    return response.data;
  }
};