export default function responseHandler(req, res, next) {
  /**
   * Éxito genérico → 200
   * @param {any} data – payload a devolver
   * @param {string} message – mensaje opcional
   */
  res.ok = (data = null, message = 'OK') => {
    return res.status(200).json({ success: true, message, data });
  };

  /**
   * Creado → 201
   */
  res.created = (data = null, message = 'Creado') => {
    return res.status(201).json({ success: true, message, data });
  };

  /**
   * Respuesta paginada → 200
   * meta: { page, perPage, total }
   */
  res.paginated = (data, meta, message = 'OK') => {
    return res.status(200).json({ success: true, message, data, meta });
  };

  /**
   * Error controlado
   * e: instancia de ApiError o Error genérico
   * status: HTTP opcional
   */
  res.fail = (e, status = 500) => {
    const payload = {
      success: false,
      message: e.message || 'Error interno',
    };
    // Si el error trae detalles (ej. validaciones) los incluimos
    if (e.details) payload.details = e.details;
    return res.status(status).json(payload);
  };

  next();
}
