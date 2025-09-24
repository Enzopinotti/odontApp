import ApiError from '../utils/ApiError.js';
import { Permiso, Rol } from '../modules/Usuarios/models/index.js';

/**
 * Ejemplo de uso:
 *   router.post('/', requirePermiso('usuarios','crear'), crearUsuario);
 */
export const requirePermiso = (recurso, accion) => async (req, _res, next) => {
  try {
    console.log('Debug middleware:', {
      user: req.user,
      roleId: req.user.RolId,
      recurso,
      accion
    });
    
    const roleId = req.user.roleId || req.user.RolId;
    if (!roleId) throw new ApiError('Rol no definido en token', 403);

    const tiene = await Permiso.findOne({
      where: { recurso, accion },
      include: {
        model: Rol,
        where: { id: roleId },
        through: { attributes: [] },
      },
    });

    console.log('Permiso encontrado:', tiene ? 'SÍ' : 'NO');
    
    if (!tiene) throw new ApiError('No tienes permiso para esta acción', 403);
    return next();
  } catch (err) {
    console.log('Error en middleware:', err.message);
    return next(err);
  }
};
