import { Router } from 'express';
import usuarioRoutes from '../modules/Usuarios/routes/usuarioRoutes.js';
import authRoutes from '../modules/Usuarios/routes/authRoutes.js';
import recetaRoutes from '../modules/Recetas/routes/RecetaRoutes.js';


const router = Router();

router.use('/usuarios', usuarioRoutes);
router.use('/auth', authRoutes);
router.use('/recetas', recetaRoutes);
export default router;
