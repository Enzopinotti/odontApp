import { Router } from 'express';
// import usuariosRoutes from './usuarios.routes.js'; // Ejemplo si ya tuvieras rutas

const router = Router();

// Ejemplo básico de ruta de prueba
router.get('/', (req, res) => {
  res.json({ message: '🦷 Bienvenido a la API de OdontApp' });
});

// Aquí se agregan las rutas por módulo cuando existan
// router.use('/usuarios', usuariosRoutes);

export default router;
