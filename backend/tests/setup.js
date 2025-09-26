import { sequelize } from '../src/config/db.js';

// Configuración global para los tests
beforeAll(async () => {
  // Configurar variables de entorno para testing
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.DB_DIALECT = 'sqlite';
  process.env.DB_STORAGE = ':memory:';
  
  // Sincronizar base de datos
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  // Cerrar conexión a la base de datos
  await sequelize.close();
});

// Configurar timeout global para tests - se hace en jest.config.js
