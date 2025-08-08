// index.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import router from './src/routes/index.js';
import { connectDB } from './src/config/db.js';
import responseHandler from './src/middlewares/responseHandler.js';
import errorHandler from './src/middlewares/errorMiddleware.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/docs/swaggerConfig.js';
import passport from './src/config/passport.js';

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/* 🛡️ Seguridad y protección */
app.use(helmet()); // Protege contra ataques conocidos
app.use(cors({
  origin: FRONTEND_URL,     // Permitir solo el frontend definido
  credentials: true,        // Habilitar envío de cookies
}));

/* 🔒 Límite de peticiones por IP (anti-abuso) */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,                 // Máximo 100 peticiones por IP
  message: 'Demasiadas solicitudes, intenta más tarde.',
}));

/* 🔐 Inicialización de Passport (Google OAuth y otros) */
app.use(passport.initialize());

/* 🔧 Middlewares base */
app.use(express.json());       // Parsear JSON en body
app.use(cookieParser());       // Leer cookies
app.use(responseHandler);      // Agrega helpers a `res.*`

/* 📚 Documentación Swagger */
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      withCredentials: true,
    },
  })
);

/* 📦 Rutas principales de la API */
app.use('/api', router);

/* ❗ Middleware de errores - debe ir al FINAL */
app.use(errorHandler);

/* 🚀 Inicio del servidor y conexión a la base de datos */
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
