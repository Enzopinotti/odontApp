import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

export const requireAuth = (req, _res, next) => {
  const token =
    req.cookies?.accessToken ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) throw new ApiError('No autorizado', 401);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    throw new ApiError('Token inválido o expirado', 403);
  }
};
