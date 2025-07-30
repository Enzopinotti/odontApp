// src/middlewares/responseMiddleware.js

export default function responseMiddleware(req, res, next) {
  res.ok = (data = null, message = 'OK') => {
    return res.json({ success: true, message, data });
  };

  res.created = (data = null, message = 'Creado') => {
    return res.status(201).json({ success: true, message, data });
  };

  res.paginated = (data, pagination, message = 'Listado') => {
    return res.json({
      success: true,
      message,
      data,
      pagination,
    });
  };

  res.fail = (error, status = 400) => {
    return res.status(status).json({
      success: false,
      message: error.message || 'Error',
      ...(error.details && { details: error.details }),
      ...(error.code && { code: error.code }),
    });
  };

  next();
}
