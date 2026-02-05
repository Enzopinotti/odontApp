// src/config/db.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

// Configurar zona horaria de Argentina
process.env.TZ = 'America/Argentina/Buenos_Aires';

// Configuración de Sequelize basado en el entorno
const isTest = process.env.NODE_ENV === 'test';

export const sequelize = isTest
  ? new Sequelize('sqlite::memory:', {
    logging: false,
    dialect: 'sqlite'
  })
  : new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: 'mysql',
      logging: false,
      timezone: '-03:00',
      dialectOptions: {
        timezone: '-03:00',
        dateStrings: false,
        typeCast: true
      },
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
