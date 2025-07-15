// src/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
  }
);

export const connectDB = async (retries = 10, delay = 3000) => {
  while (retries) {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos exitosa');
      break;                      
    } catch (err) {
      console.error('⏳ DB no disponible, reintentando...', err.message);
      retries -= 1;
      if (!retries) throw err;    
      await new Promise(res => setTimeout(res, delay));
    }
  }
};
