import express from 'express';
import cors from 'cors';
import router from './src/routes/index.js';
import { connectDB } from './config/db.js';
import responseHandler from './src/middlewares/responseHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(responseHandler);
app.use('/api', router);


app.listen(PORT, async () => {
  await connectDB();
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
