import { Router } from 'express';
import usuarioRoutes from '../modules/Usuarios/routes/usuarioRoutes.js';

const router = Router();


router.use('/usuarios', usuarioRoutes);

export default router;
