import { Router } from 'express';

import pacienteRoutes from './pacienteRoutes.js';
import odontogramaRoutes from './odontogramaRoutes.js';
import historiaClinicaRoutes from './historiaClinicaRoutes.js';
import tratamientoRoutes from './tratamientoRoutes.js';

const router = Router();

router.use('/pacientes', pacienteRoutes);
router.use('/odontograma', odontogramaRoutes);
router.use('/historia', historiaClinicaRoutes);
router.use('/tratamientos', tratamientoRoutes);

export default router;
