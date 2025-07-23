import ApiError from '../utils/ApiError.js';
import { Permiso, Rol } from '../modules/Usuarios/models/index.js';

/**
 * Ejemplo de uso:
 *   router.post('/', requirePermiso('usuarios','crear'), crearUsuario);
 */
export const requirePermiso = (recurso, accion) => async (req, _res, next) => {
  try {
    const roleId = req.user.roleId;
    if (!roleId) throw new ApiError('Rol no definido en token', 403);

    const tiene = await Permiso.findOne({
      where: { recurso, accion },
      include: {
        model: Rol,
        where: { id: roleId },
        through: { attributes: [] },
      },
    });

    if (!tiene) throw new ApiError('No tienes permiso para esta acción', 403);
    return next();
  } catch (err) {
    return next(err);
  }
};
