import request from 'supertest';
import { sequelize } from '../src/config/db.js';
import { EstadoTurno, TipoDisponibilidad } from '../src/modules/Agenda/models/enums.js';

describe('Módulo Agenda - Casos de Uso', () => {
  let authToken;
  let recepcionistaId;
  let odontologoId;
  let pacienteId;
  let turnoId;
  let disponibilidadId;

  beforeAll(async () => {
    // Configurar base de datos de prueba
    await sequelize.sync({ force: true });
    
    // Crear datos de prueba
    await setupTestData();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    // Limpiar datos entre tests si es necesario
  });

  describe('CU-AG01.1: Registrar Asistencia', () => {
    test('Debe marcar asistencia correctamente', async () => {
      // Crear turno para el test
      const turnoData = {
        fechaHora: new Date(Date.now() - 3600000), // 1 hora atrás
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const turnoResponse = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      const turnoId = turnoResponse.body.data.id;

      // Marcar asistencia
      const response = await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-asistencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nota: 'Paciente puntual' })
        .expect(200);

      expect(response.body.data.estado).toBe(EstadoTurno.ASISTIO);
      expect(response.body.message).toBe('Asistencia registrada');
    });

    test('Debe marcar ausencia correctamente', async () => {
      // Crear turno para el test
      const turnoData = {
        fechaHora: new Date(Date.now() - 3600000), // 1 hora atrás
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const turnoResponse = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      const turnoId = turnoResponse.body.data.id;

      // Marcar ausencia
      const response = await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-ausencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ motivo: 'Cancelación de última hora' })
        .expect(200);

      expect(response.body.data.estado).toBe(EstadoTurno.AUSENTE);
      expect(response.body.message).toBe('Ausencia registrada');
    });

    test('No debe permitir marcar asistencia en turnos futuros', async () => {
      // Crear turno futuro
      const turnoData = {
        fechaHora: new Date(Date.now() + 3600000), // 1 hora en el futuro
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const turnoResponse = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      const turnoId = turnoResponse.body.data.id;

      // Intentar marcar asistencia
      await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-asistencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nota: 'Paciente puntual' })
        .expect(400);
    });

    test('No debe permitir marcar asistencia en turnos ya procesados', async () => {
      // Crear turno y marcarlo como asistió
      const turnoData = {
        fechaHora: new Date(Date.now() - 3600000),
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const turnoResponse = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      const turnoId = turnoResponse.body.data.id;

      // Marcar asistencia
      await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-asistencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nota: 'Paciente puntual' })
        .expect(200);

      // Intentar marcar asistencia nuevamente
      await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-asistencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nota: 'Paciente puntual' })
        .expect(400);
    });
  });

  describe('CU-AG01.2: Crear Turno', () => {
    test('Debe crear turno correctamente', async () => {
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000), // Mañana
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const response = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      expect(response.body.data.estado).toBe(EstadoTurno.PENDIENTE);
      expect(response.body.data.duracion).toBe(30);
      expect(response.body.data.motivo).toBe('Consulta de rutina');
      expect(response.body.message).toBe('Turno creado exitosamente');
    });

    test('No debe crear turno con fecha pasada', async () => {
      const turnoData = {
        fechaHora: new Date(Date.now() - 3600000), // 1 hora atrás
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(400);
    });

    test('No debe crear turno con duración inválida', async () => {
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000),
        duracion: 10, // Menos de 15 minutos
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(400);
    });

    test('No debe crear turno con solapamiento', async () => {
      const fechaHora = new Date(Date.now() + 86400000);
      
      // Crear primer turno
      const turnoData1 = {
        fechaHora,
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData1)
        .expect(201);

      // Intentar crear segundo turno solapado
      const turnoData2 = {
        fechaHora: new Date(fechaHora.getTime() + 900000), // 15 minutos después
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData2)
        .expect(409);
    });

    test('No debe crear turno fuera de horario laboral', async () => {
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000), // Mañana
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      // Si no hay disponibilidad configurada, debe fallar
      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(409);
    });
  });

  describe('CU-AG01.3: Reprogramar Turno', () => {
    test('Debe reprogramar turno correctamente', async () => {
      // Crear turno
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000),
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const turnoResponse = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      const turnoId = turnoResponse.body.data.id;
      const nuevaFechaHora = new Date(Date.now() + 172800000); // Pasado mañana

      // Reprogramar turno
      const response = await request(app)
        .put(`/api/agenda/turnos/${turnoId}/reprogramar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nuevaFechaHora })
        .expect(200);

      expect(response.body.data.fechaHora).toBe(nuevaFechaHora.toISOString());
      expect(response.body.data.estado).toBe(EstadoTurno.PENDIENTE);
      expect(response.body.message).toBe('Turno reprogramado');
    });

    test('No debe reprogramar turno con fecha pasada', async () => {
      // Crear turno
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000),
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const turnoResponse = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      const turnoId = turnoResponse.body.data.id;
      const nuevaFechaHora = new Date(Date.now() - 3600000); // 1 hora atrás

      // Intentar reprogramar con fecha pasada
      await request(app)
        .put(`/api/agenda/turnos/${turnoId}/reprogramar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nuevaFechaHora })
        .expect(400);
    });

    test('No debe reprogramar turno ya procesado', async () => {
      // Crear turno y marcarlo como asistió
      const turnoData = {
        fechaHora: new Date(Date.now() - 3600000),
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const turnoResponse = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      const turnoId = turnoResponse.body.data.id;

      // Marcar asistencia
      await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-asistencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nota: 'Paciente puntual' })
        .expect(200);

      // Intentar reprogramar
      const nuevaFechaHora = new Date(Date.now() + 86400000);
      await request(app)
        .put(`/api/agenda/turnos/${turnoId}/reprogramar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nuevaFechaHora })
        .expect(400);
    });
  });

  describe('CU-AG01.4: Cancelar Turno', () => {
    test('Debe cancelar turno correctamente', async () => {
      // Crear turno
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000),
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const turnoResponse = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      const turnoId = turnoResponse.body.data.id;

      // Cancelar turno
      const response = await request(app)
        .post(`/api/agenda/turnos/${turnoId}/cancelar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ motivo: 'Paciente canceló' })
        .expect(200);

      expect(response.body.data.estado).toBe(EstadoTurno.CANCELADO);
      expect(response.body.message).toBe('Turno cancelado');
    });

    test('No debe cancelar turno ya procesado', async () => {
      // Crear turno y marcarlo como asistió
      const turnoData = {
        fechaHora: new Date(Date.now() - 3600000),
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      const turnoResponse = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      const turnoId = turnoResponse.body.data.id;

      // Marcar asistencia
      await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-asistencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nota: 'Paciente puntual' })
        .expect(200);

      // Intentar cancelar
      await request(app)
        .post(`/api/agenda/turnos/${turnoId}/cancelar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ motivo: 'Paciente canceló' })
        .expect(400);
    });
  });

  describe('CU-AG01.5: Ver Agenda', () => {
    test('Debe obtener agenda por fecha', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/agenda/turnos/agenda/${fecha}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.message).toBe('Agenda obtenida');
    });

    test('Debe obtener agenda filtrada por odontólogo', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/agenda/turnos/agenda/${fecha}?odontologoId=${odontologoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Debe obtener slots disponibles', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/agenda/turnos/slots-disponibles?fecha=${fecha}&odontologoId=${odontologoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.message).toBe('Slots disponibles obtenidos');
    });
  });

  describe('CU-AG02: Gestionar Disponibilidad', () => {
    test('Debe crear disponibilidad correctamente', async () => {
      const disponibilidadData = {
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      const response = await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      expect(response.body.data.tipo).toBe(TipoDisponibilidad.LABORAL);
      expect(response.body.data.horaInicio).toBe('09:00');
      expect(response.body.data.horaFin).toBe('17:00');
      expect(response.body.message).toBe('Disponibilidad creada exitosamente');
    });

    test('No debe crear disponibilidad con duración menor a 1 hora', async () => {
      const disponibilidadData = {
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '09:30', // Solo 30 minutos
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(400);
    });

    test('No debe crear disponibilidad con solapamiento', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      // Crear primera disponibilidad
      const disponibilidadData1 = {
        fecha,
        horaInicio: '09:00',
        horaFin: '12:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData1)
        .expect(201);

      // Intentar crear segunda disponibilidad solapada
      const disponibilidadData2 = {
        fecha,
        horaInicio: '11:00',
        horaFin: '14:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData2)
        .expect(409);
    });

    test('Debe requerir motivo para disponibilidad no laboral', async () => {
      const disponibilidadData = {
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.NOLABORAL,
        odontologoId
        // Sin motivo
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(400);
    });

    test('Debe actualizar disponibilidad correctamente', async () => {
      // Crear disponibilidad
      const disponibilidadData = {
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      const createResponse = await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      const disponibilidadId = createResponse.body.data.id;

      // Actualizar disponibilidad
      const updateData = {
        horaInicio: '08:00',
        horaFin: '16:00'
      };

      const response = await request(app)
        .put(`/api/agenda/disponibilidades/${disponibilidadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.horaInicio).toBe('08:00');
      expect(response.body.data.horaFin).toBe('16:00');
      expect(response.body.message).toBe('Disponibilidad actualizada');
    });

    test('Debe eliminar disponibilidad correctamente', async () => {
      // Crear disponibilidad
      const disponibilidadData = {
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      const createResponse = await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      const disponibilidadId = createResponse.body.data.id;

      // Eliminar disponibilidad
      const response = await request(app)
        .delete(`/api/agenda/disponibilidades/${disponibilidadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.message).toBe('Disponibilidad eliminada');
    });

    test('No debe eliminar disponibilidad con turnos futuros', async () => {
      const fecha = new Date(Date.now() + 86400000).toISOString().split('T')[0]; // Mañana

      // Crear disponibilidad
      const disponibilidadData = {
        fecha,
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      const createResponse = await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      const disponibilidadId = createResponse.body.data.id;

      // Crear turno en esa disponibilidad
      const turnoData = {
        fechaHora: new Date(`${fecha}T10:00:00`),
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      // Intentar eliminar disponibilidad
      await request(app)
        .delete(`/api/agenda/disponibilidades/${disponibilidadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);
    });

    test('Debe validar disponibilidad correctamente', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      const validacionData = {
        fecha,
        horaInicio: '10:00',
        horaFin: '11:00',
        odontologoId
      };

      const response = await request(app)
        .post('/api/agenda/disponibilidades/validar')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validacionData)
        .expect(200);

      expect(response.body.data).toHaveProperty('esValida');
      expect(response.body.message).toBe('Validación completada');
    });
  });

  describe('Reglas de Negocio', () => {
    test('RN-AG01: Turnos del mismo odontólogo no pueden solaparse', async () => {
      const fechaHora = new Date(Date.now() + 86400000);
      
      // Crear primer turno
      const turnoData1 = {
        fechaHora,
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData1)
        .expect(201);

      // Intentar crear segundo turno solapado
      const turnoData2 = {
        fechaHora: new Date(fechaHora.getTime() + 900000), // 15 minutos después
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData2)
        .expect(409);
    });

    test('RN-AG02: Turnos solo en bloques laborales configurados', async () => {
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000),
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      // Sin disponibilidad configurada, debe fallar
      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(409);
    });

    test('RN-AG03: Duración mínima 15 minutos', async () => {
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000),
        duracion: 10, // Menos de 15 minutos
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(400);
    });

    test('RN-AG07: No eliminar bloques con turnos futuros', async () => {
      const fecha = new Date(Date.now() + 86400000).toISOString().split('T')[0];

      // Crear disponibilidad
      const disponibilidadData = {
        fecha,
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      const createResponse = await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      const disponibilidadId = createResponse.body.data.id;

      // Crear turno en esa disponibilidad
      const turnoData = {
        fechaHora: new Date(`${fecha}T10:00:00`),
        duracion: 30,
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      // Intentar eliminar disponibilidad
      await request(app)
        .delete(`/api/agenda/disponibilidades/${disponibilidadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(409);
    });

    test('RN-AG08: Bloques mínimos de 1 hora', async () => {
      const disponibilidadData = {
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '09:30', // Solo 30 minutos
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(400);
    });

    test('RN-AG09: Días no laborables requieren motivo', async () => {
      const disponibilidadData = {
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.NOLABORAL,
        odontologoId
        // Sin motivo
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(400);
    });
  });

  // Función helper para configurar datos de prueba
  async function setupTestData() {
    // Crear usuario recepcionista
    const recepcionistaData = {
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'recepcionista@test.com',
      password: 'password123',
      telefono: '123456789'
    };

    const recepcionistaResponse = await request(app)
      .post('/api/usuarios/register')
      .send(recepcionistaData);

    recepcionistaId = recepcionistaResponse.body.data.id;

    // Crear usuario odontólogo
    const odontologoData = {
      nombre: 'Dr. María',
      apellido: 'González',
      email: 'odontologo@test.com',
      password: 'password123',
      telefono: '987654321',
      matricula: 'MAT123456'
    };

    const odontologoResponse = await request(app)
      .post('/api/usuarios/register-odontologo')
      .send(odontologoData);

    odontologoId = odontologoResponse.body.data.id;

    // Crear paciente
    const pacienteData = {
      nombre: 'Ana',
      apellido: 'López',
      dni: '12345678',
      obraSocial: 'OSDE',
      nroAfiliado: '123456'
    };

    const pacienteResponse = await request(app)
      .post('/api/clinica/pacientes')
      .send(pacienteData);

    pacienteId = pacienteResponse.body.data.id;

    // Autenticar como recepcionista
    const loginResponse = await request(app)
      .post('/api/usuarios/login')
      .send({
        email: 'recepcionista@test.com',
        password: 'password123'
      });

    authToken = loginResponse.body.data.token;
  }
});
