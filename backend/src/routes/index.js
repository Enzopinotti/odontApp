import { Router } from 'express';
import usuarioRoutes from '../modules/Usuarios/routes/usuarioRoutes.js';
import authRoutes from '../modules/Usuarios/routes/authRoutes.js';
import recetaRoutes from '../modules/Recetas/routes/RecetaRoutes.js';
import MedicamentoRoutes from '../modules/Recetas/routes/MedicamentoRoutes.js';
import MedicamentoRecetadoRoutes from '../modules/Recetas/routes/MedicamentoRecetadoRoutes.js';
import PacienteRoutes from '../modules/Clinica/routes/PacienteRoutes.js';
import clinicaRoutes from '../modules/Clinica/routes/index.js';

const router = Router();

router.use('/usuarios', usuarioRoutes);
router.use('/auth', authRoutes);
router.use('/recetas', recetaRoutes);
router.use('/medicamentos', MedicamentoRoutes);
router.use('/medicamentoRecetados',MedicamentoRecetadoRoutes)
router.use('/pacientes', PacienteRoutes)
router.use('/clinica', clinicaRoutes); 

export default router;
