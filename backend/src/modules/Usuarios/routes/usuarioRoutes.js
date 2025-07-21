import { Router } from 'express';
import usuarioController from '../controllers/usuarioController.js';
import {
  validarCrearUsuario,
  validarEditarUsuario,
} from '../validators/usuarioValidator.js';
import { requireAuth } from '../../../middlewares/authMiddleware.js';
import { requirePermiso } from '../../../middlewares/permissionMiddleware.js';

const router = Router();

router.use(requireAuth);

// 👇 Protegemos cada acción con su permiso correspondiente
router.get(
  '/',
  requirePermiso('usuarios', 'listar'),
  usuarioController.obtenerUsuarios
);

router.get(
  '/:id',
  requirePermiso('usuarios', 'listar'),
  usuarioController.obtenerUsuarioPorId
);

router.post(
  '/',
  requirePermiso('usuarios', 'crear'),
  validarCrearUsuario,
  usuarioController.crearUsuario
);

router.put(
  '/:id',
  requirePermiso('usuarios', 'editar'),
  validarEditarUsuario,
  usuarioController.editarUsuario
);

router.delete(
  '/:id',
  requirePermiso('usuarios', 'eliminar'),
  usuarioController.eliminarUsuario
);

export default router;
