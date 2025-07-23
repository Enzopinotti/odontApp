import { Router } from 'express';
import usuarioRoutes from '../modules/Usuarios/routes/usuarioRoutes.js';
import authRoutes from '../modules/Usuarios/routes/authRoutes.js';

const router = Router();

router.use('/usuarios', usuarioRoutes);
router.use('/auth', authRoutes);
export default router;
