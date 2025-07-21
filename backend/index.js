import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './src/routes/index.js';
import { connectDB } from './config/db.js';
import responseHandler from './src/middlewares/responseHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  credentials: true,
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());
app.use(cookieParser()); 
app.use(responseHandler);
app.use('/api', router);

app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
