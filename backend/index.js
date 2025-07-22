import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import router from './src/routes/index.js';
import { connectDB } from './config/db.js';
import responseHandler from './src/middlewares/responseHandler.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './src/docs/swaggerConfig.js';


const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/* 🛡️ Seguridad */
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo de 100 requests por IP
  message: 'Demasiadas solicitudes, intenta más tarde.',
}));

/* 🔧 Otros middlewares */
app.use(express.json());
app.use(cookieParser());
app.use(responseHandler);

/* 📦 Rutas */
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
      withCredentials: true, // ✅ habilita cookies en Swagger UI
    },
  })
);
app.use('/api', router);

/* 🚀 Inicio */
app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
