import * as service from '../services/financeService.js';


export const crearOrdenCobro = async (req, res, next) => {
  try {
    const factura = await service.crearOrdenCobro(req.body, req.user.id);
    res.status(201).json({ message: 'Enviado a recepción', data: factura });
  } catch (e) { next(e); }
};

export const gestionarPago = async (req, res, next) => {
  try {
    const factura = await service.gestionarPago(req.params.id, req.body);
    res.json({ message: 'Pago registrado', data: factura });
  } catch (e) { next(e); }
};

export const listarFacturas = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const filtros = req.query;

    const { data, total } = await service.listarFacturas(filtros, page, perPage);
    
    res.json({ 
      success: true,
      data, 
      meta: { page, perPage, total } 
    }); 
  } catch (e) { next(e); }
};

export const crearPresupuesto = async (req, res, next) => {
  try {
    const presupuesto = await service.crearPresupuesto(req.body, req.user.id);
    res.status(201).json({ message: 'Presupuesto creado', data: presupuesto });
  } catch (e) { next(e); }
};