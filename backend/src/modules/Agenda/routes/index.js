import express from 'express';
import turnoRoutes from './turnoRoutes.js';
import disponibilidadRoutes from './disponibilidadRoutes.js';
import notaRoutes from './notaRoutes.js';

const router = express.Router();

// Rutas del módulo de agenda
router.use('/turnos', turnoRoutes);
router.use('/disponibilidades', disponibilidadRoutes);
router.use('/notas', notaRoutes);

export default router;
