// backend/src/middlewares/permissionMiddleware.js
import ApiError from '../utils/ApiError.js';
import { Permiso, Rol } from '../modules/Usuarios/models/index.js';

/**
 * Middleware para requerir un permiso específico
 * Uso: router.post('/', requirePermiso('usuarios','crear'), crearUsuario);
 */
export const requirePermiso = (recurso, accion) => async (req, _res, next) => {
  try {
    // Obtenemos roleId del token (soporta ambos formatos)
    const roleId = req.user?.roleId || req.user?.RolId;
    if (!roleId) throw new ApiError('Rol no definido en token', 403);

    // BYPASS para Administrador (ID 1)
    if (Number(roleId) === 1) return next();

    const permiso = await Permiso.findOne({
      where: { recurso, accion },
      include: {
        model: Rol,
        where: { id: roleId },
        through: { attributes: [] }, // omitimos atributos de la tabla intermedia
      },
    });

    if (!permiso) throw new ApiError('No tienes permiso para esta acción', 403);

    return next();
  } catch (err) {
    return next(err);
  }
};
