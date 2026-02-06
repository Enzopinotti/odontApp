import { jest } from '@jest/globals';

// Mock del servicio de correo
jest.unstable_mockModule('../src/services/emailService.js', () => ({
  enviarCorreo: jest.fn().mockResolvedValue(true)
}));

const { default: request } = await import('supertest');
const { default: app } = await import('../index.js');
const { sequelize } = await import('../src/config/db.js');
const { EstadoTurno, TipoDisponibilidad } = await import('../src/modules/Agenda/models/enums.js');
const { Rol, Usuario, Odontologo } = await import('../src/modules/Usuarios/models/index.js');
const { Turno } = await import('../src/modules/Agenda/models/index.js');

describe('Módulo Agenda - Integración y Reglas de Negocio', () => {
  let authToken;
  let recepcionistaId;
  let odontologoId;
  let pacienteId;

  beforeAll(async () => {
    await sequelize.sync({ force: true });

    await Rol.bulkCreate([
      { id: 1, nombre: 'Admin' },
      { id: 2, nombre: 'Odontologo' },
      { id: 3, nombre: 'Secretaria' },
      { id: 4, nombre: 'Recepcionista' },
      { id: 5, nombre: 'Paciente' }
    ]);

    await setupTestData();
  });

  describe('CU-AG01.1: Registrar Asistencia', () => {
    test('Debe marcar asistencia correctamente en un turno pasado', async () => {
      const ahora = new Date();
      const turno = await Turno.create({
        fechaHora: new Date(ahora.getTime() - 7200000),
        duracion: 30,
        motivo: 'Control',
        pacienteId,
        odontologoId,
        recepcionistaId,
        estado: EstadoTurno.PENDIENTE
      }, { validate: false });

      const response = await request(app)
        .post(`/api/agenda/turnos/${turno.id}/marcar-asistencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nota: 'Paciente puntual' });

      expect(response.status).toBe(200);
      expect(response.body.data.estado).toBe(EstadoTurno.ASISTIO);
    });
  });

  describe('CU-AG01.2: Crear Turno', () => {
    const mañana = new Date();
    mañana.setDate(mañana.getDate() + 1);
    const fechaStr = mañana.toISOString().split('T')[0];

    beforeAll(async () => {
      // Configurar disponibilidad para las pruebas de creación
      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fecha: fechaStr,
          horaInicio: '08:00',
          horaFin: '12:00',
          tipo: TipoDisponibilidad.LABORAL,
          odontologoId
        });
    });

    test('Debe crear turno exitosamente en horario disponible', async () => {
      const response = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fechaHora: `${fechaStr}T09:00:00`,
          duracion: 30,
          motivo: 'Limpieza',
          pacienteId,
          odontologoId
        });

      expect(response.status).toBe(201);
      expect(response.body.data.estado).toBe(EstadoTurno.PENDIENTE);
    });

    test('RN-AG01: No debe permitir solapamiento de turnos', async () => {
      // Turno ya existe a las 09:00 (de la prueba anterior)
      const response = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fechaHora: `${fechaStr}T09:15:00`,
          duracion: 30,
          motivo: 'Consulta',
          pacienteId,
          odontologoId
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('solapa');
    });

    test('RN-AG02: No debe permitir turnos fuera de horario laboral', async () => {
      const response = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fechaHora: `${fechaStr}T15:00:00`,
          duracion: 30,
          motivo: 'Urgencia',
          pacienteId,
          odontologoId
        });

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('laborales');
    });

    test('RN-AG03: Debe validar duración (múltiplo de 5)', async () => {
      const response = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fechaHora: `${fechaStr}T10:00:00`,
          duracion: 13,
          motivo: 'Error',
          pacienteId,
          odontologoId
        });

      expect(response.status).toBe(400);
    });
  });

  describe('CU-AG02: Gestionar Disponibilidad', () => {
    const pasadoMañana = new Date();
    pasadoMañana.setDate(pasadoMañana.getDate() + 2);
    const fechaStr = pasadoMañana.toISOString().split('T')[0];

    test('Debe crear bloque de disponibilidad correctamente', async () => {
      const response = await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fecha: fechaStr,
          horaInicio: '14:00',
          horaFin: '18:00',
          tipo: TipoDisponibilidad.LABORAL,
          odontologoId
        });

      expect(response.status).toBe(201);
    });

    test('RN-AG08: No debe permitir bloques menores a 1 hora', async () => {
      const response = await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fecha: fechaStr,
          horaInicio: '08:00',
          horaFin: '08:30',
          tipo: TipoDisponibilidad.LABORAL,
          odontologoId
        });

      // Dependiendo de la implementación, esto puede ser 400
      expect(response.status).toBe(400);
    });

    test('RN-AG09: Días no laborables requieren motivo', async () => {
      const response = await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          fecha: fechaStr,
          horaInicio: '09:00',
          horaFin: '13:00',
          tipo: TipoDisponibilidad.NOLABORAL,
          odontologoId
          // falta motivo
        });

      expect(response.status).toBe(400);
    });
  });

  async function setupTestData() {
    try {
      const regRes = await request(app).post('/api/auth/register').send({
        nombre: 'Admin',
        apellido: 'Test',
        email: 'admin@test.com',
        password: 'Password123!',
        telefono: '123'
      });

      recepcionistaId = regRes.body.data.id;
      await Usuario.update({ activo: true, RolId: 1 }, { where: { id: recepcionistaId } });

      const odontologoUser = await Usuario.create({
        nombre: 'Dr. Maria',
        apellido: 'González',
        email: 'odontologo@test.com',
        password: 'Password123!',
        activo: true,
        RolId: 2
      });
      odontologoId = odontologoUser.id;
      await Odontologo.create({ userId: odontologoId, matricula: 'MAT123456' });

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@test.com', password: 'Password123!' });

      authToken = loginRes.body.data.accessToken;

      const pRes = await request(app)
        .post('/api/clinica/pacientes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          nombre: 'Ana',
          apellido: 'López',
          dni: '12345678',
          contacto: {
            email: 'ana@test.com',
            direccion: {
              calle: 'Av Siempre Viva 123',
              ciudad: 'Springfield'
            }
          }
        });

      pacienteId = pRes.body.data.id;
    } catch (e) {
      console.error('FAILED SETUP:', e.message);
      throw e;
    }
  }
});
