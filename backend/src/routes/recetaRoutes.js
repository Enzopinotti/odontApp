import express from 'express';
import { requireAuth } from '../middlewares/authMiddleware';
import { requirePermiso } from '../middlewares/permissionMiddleware';
import RecetaController from '../controllers/recetaController.js';

const router = Router();

// Rutas para recetas
router.use(requireAuth);
//POST /api/recetas
//crear nueva receta
//requiere rol odontologo y paciente valido
router.post('/', requirePermiso('recetas','crear'), RecetaController.crearReceta);
//GET /api/recetas/
//obtener todas las recetas
router.get('/', requirePermiso('recetas','listar'), RecetaController.listarRecetas);
//GET /api/recetas/:id
//obtener receta por id
router.get('/:id', requirePermiso('recetas','ver'), RecetaController.getRecetaById);
//GET /api/recetas/:id/pdf
//obtener receta en formato PDF
router.get('/:id/pdf', requirePermiso('recetas','ver'), RecetaController.getRecetaPdf);
