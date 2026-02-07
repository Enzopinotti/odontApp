import * as service from '../services/financeService.js';

/* --- CONTROLADORES DE FINANZAS --- */

// 1. Crear Orden de Cobro
export const crearOrdenCobro = async (req, res, next) => {
  try {
    // El servicio ya se encarga de resolver el Odontólogo usando req.user.id
    const factura = await service.crearOrdenCobro(req.body, req.user.id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Orden enviada a recepción', 
      data: factura 
    });
  } catch (e) { 
    next(e); 
  }
};

// 2. Gestionar Pago (Cobrar) - CON LOGS DE DEPURACIÓN
export const gestionarPago = async (req, res, next) => {
  try {
    console.log("💰 [DEBUG] Controller: Petición de cobro recibida");
    console.log("   ID Factura:", req.params.id);
    console.log("   Datos Pago:", req.body);
    console.log("   Usuario:", req.user.id);

    const factura = await service.gestionarPago(req.params.id, req.body, req.user.id);
    
    console.log("✅ [DEBUG] Controller: Pago procesado correctamente. Nuevo estado:", factura.estado);

    res.json({ 
      success: true, 
      message: 'Pago registrado exitosamente', 
      data: factura 
    });
  } catch (e) { 
    console.error("❌ [DEBUG] Error en gestionarPago:", e.message);
    next(e); 
  }
};

// 3. Listar Facturas (Historial y Pendientes)
export const listarFacturas = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 20;
    const filtros = req.query;

    // Pasamos el ID del usuario al servicio para aplicar el filtro de seguridad (si es Odontólogo)
    const { data, total } = await service.listarFacturas(filtros, page, perPage, req.user.id);
    
    res.json({ 
      success: true,
      data, 
      meta: { page, perPage, total } 
    }); 
  } catch (e) { 
    next(e); 
  }
};

// 4. Crear Presupuesto
export const crearPresupuesto = async (req, res, next) => {
  try {
    const presupuesto = await service.crearPresupuesto(req.body, req.user.id);
    
    res.status(201).json({ 
      success: true, 
      message: 'Presupuesto creado correctamente', 
      data: presupuesto 
    });
  } catch (e) { 
    next(e); 
  }
};