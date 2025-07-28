import { Router } from 'express';
import usuarioRoutes from '../modules/Usuarios/routes/usuarioRoutes.js';
import authRoutes from '../modules/Usuarios/routes/authRoutes.js';
import clinicaRoutes from '../modules/Clinica/routes/index.js';

const router = Router();

router.use('/usuarios', usuarioRoutes);
router.use('/auth', authRoutes);
router.use('/clinica', clinicaRoutes); 

export default router;
