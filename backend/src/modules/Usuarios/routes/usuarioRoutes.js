import { Router } from 'express';
import usuarioController from '../controllers/usuarioController.js';
import { 
  validarCrearUsuario, 
  validarEditarUsuario, 
  validarLogin 
} from '../validators/usuarioValidator.js';

const router = Router();

// Rutas públicas
router.post('/login', validarLogin ,usuarioController.login);
router.post('/forgot-password', usuarioController.forgotPassword);
router.post('/reset-password/:token', usuarioController.resetPassword);

// Rutas privadas (administración usuarios)
router.get('/', usuarioController.obtenerUsuarios);
router.get('/:id', usuarioController.obtenerUsuarioPorId);
router.post('/', validarCrearUsuario ,usuarioController.crearUsuario);
router.put('/:id', validarEditarUsuario ,usuarioController.editarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);


export default router;
