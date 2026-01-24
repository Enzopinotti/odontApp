import request from 'supertest';
import { sequelize } from '../src/config/db.js';
import { EstadoTurno, TipoDisponibilidad } from '../src/modules/Agenda/models/enums.js';

describe('Validación Completa de Casos de Uso - Módulo Agenda', () => {
  let authToken;
  let recepcionistaId;
  let odontologoId;
  let pacienteId;

  beforeAll(async () => {
    await setupTestData();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  describe('CU-AG01.1: Registrar Asistencia - Validación Completa', () => {
    test('Escenario Principal: Marcar asistencia exitosa', async () => {
      // Crear turno que ya pasó
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

      // Validar resultado
      expect(response.body.data.estado).toBe(EstadoTurno.ASISTIO);
      expect(response.body.message).toBe('Asistencia registrada');
      
      // Verificar que se creó la nota
      expect(response.body.data.Notas).toBeDefined();
      expect(response.body.data.Notas.length).toBeGreaterThan(0);
    });

    test('Flujo Alternativo 5a: Llegó tarde pero asistió', async () => {
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

      // Marcar asistencia con nota de retraso
      const response = await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-asistencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nota: 'Paciente retrasado' })
        .expect(200);

      expect(response.body.data.estado).toBe(EstadoTurno.ASISTIO);
      expect(response.body.data.Notas[0].descripcion).toBe('Paciente retrasado');
    });

    test('Flujo Alternativo 5b: Cancelación a último momento', async () => {
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

      // Marcar ausencia con motivo
      const response = await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-ausencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ motivo: 'Cancelación de última hora' })
        .expect(200);

      expect(response.body.data.estado).toBe(EstadoTurno.AUSENTE);
      expect(response.body.data.Notas[0].descripcion).toContain('Cancelación de última hora');
    });

    test('Regla de Negocio RN-AG06: Ausencia automática', async () => {
      // Este test simularía la ausencia automática después de 15 minutos
      // En una implementación real, esto sería manejado por un job/cron
      const turnoData = {
        fechaHora: new Date(Date.now() - 20 * 60000), // 20 minutos atrás
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

      // Simular ausencia automática
      const response = await request(app)
        .post(`/api/agenda/turnos/${turnoId}/marcar-ausencia`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ motivo: 'Ausencia automática - 15 minutos sin registro' })
        .expect(200);

      expect(response.body.data.estado).toBe(EstadoTurno.AUSENTE);
    });
  });

  describe('CU-AG01.2: Crear Turno - Validación Completa', () => {
    test('Escenario Principal: Crear turno exitoso', async () => {
      // Primero crear disponibilidad
      const disponibilidadData = {
        fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      // Crear turno
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000 + 3600000), // Mañana a las 10:00
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
      expect(response.body.data.recepcionistaId).toBe(recepcionistaId);
    });

    test('Flujo Alternativo 3a: Paciente no registrado', async () => {
      // Crear disponibilidad
      const disponibilidadData = {
        fecha: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      // Crear paciente nuevo
      const pacienteData = {
        nombre: 'Nuevo',
        apellido: 'Paciente',
        dni: '87654321',
        obraSocial: 'Swiss Medical'
      };

      const pacienteResponse = await request(app)
        .post('/api/clinica/pacientes')
        .set('Authorization', `Bearer ${authToken}`)
        .send(pacienteData)
        .expect(201);

      const nuevoPacienteId = pacienteResponse.body.data.id;

      // Crear turno con nuevo paciente
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000 + 7200000), // Mañana a las 11:00
        duracion: 30,
        motivo: 'Primera consulta',
        pacienteId: nuevoPacienteId,
        odontologoId
      };

      const response = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData)
        .expect(201);

      expect(response.body.data.pacienteId).toBe(nuevoPacienteId);
    });

    test('Flujo Alternativo 6a: Conflicto en horarios', async () => {
      const fechaHora = new Date(Date.now() + 86400000 + 10800000); // Mañana a las 12:00

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

      const response = await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData2)
        .expect(409);

      expect(response.body.message).toContain('solapa');
    });

    test('Validación de Reglas de Negocio', async () => {
      // RN-AG01: No solapamiento
      const fechaHora = new Date(Date.now() + 86400000 + 14400000); // Mañana a las 13:00

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

      // Intentar solapamiento
      const turnoData2 = {
        fechaHora: new Date(fechaHora.getTime() + 900000),
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

      // RN-AG03: Duración mínima
      const turnoData3 = {
        fechaHora: new Date(Date.now() + 86400000 + 18000000), // Mañana a las 14:00
        duracion: 10, // Menos de 15 minutos
        motivo: 'Consulta de rutina',
        pacienteId,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/turnos')
        .set('Authorization', `Bearer ${authToken}`)
        .send(turnoData3)
        .expect(400);
    });
  });

  describe('CU-AG01.3: Reprogramar Turno - Validación Completa', () => {
    test('Escenario Principal: Reprogramación exitosa', async () => {
      // Crear disponibilidad
      const disponibilidadData = {
        fecha: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Pasado mañana
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      // Crear turno
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000 + 18000000), // Mañana a las 14:00
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
      const nuevaFechaHora = new Date(Date.now() + 172800000 + 3600000); // Pasado mañana a las 10:00

      // Reprogramar turno
      const response = await request(app)
        .put(`/api/agenda/turnos/${turnoId}/reprogramar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nuevaFechaHora })
        .expect(200);

      expect(response.body.data.fechaHora).toBe(nuevaFechaHora.toISOString());
      expect(response.body.data.estado).toBe(EstadoTurno.PENDIENTE);
      expect(response.body.data.Notas[0].descripcion).toContain('reprogramado');
    });

    test('Flujo Alternativo 4a: Sin disponibilidad', async () => {
      // Crear turno
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000 + 21600000), // Mañana a las 15:00
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
      const nuevaFechaHora = new Date(Date.now() + 259200000); // En 3 días (sin disponibilidad)

      // Intentar reprogramar sin disponibilidad
      await request(app)
        .put(`/api/agenda/turnos/${turnoId}/reprogramar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nuevaFechaHora })
        .expect(409);
    });

    test('Regla de Negocio RN-AG05: Máximo 2 reprogramaciones', async () => {
      // Crear disponibilidad
      const disponibilidadData = {
        fecha: new Date(Date.now() + 259200000).toISOString().split('T')[0], // En 3 días
        horaInicio: '09:00',
        horaFin: '17:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      // Crear turno
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000 + 25200000), // Mañana a las 16:00
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

      // Primera reprogramación
      const nuevaFechaHora1 = new Date(Date.now() + 172800000 + 3600000); // Pasado mañana a las 10:00
      await request(app)
        .put(`/api/agenda/turnos/${turnoId}/reprogramar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nuevaFechaHora: nuevaFechaHora1 })
        .expect(200);

      // Segunda reprogramación
      const nuevaFechaHora2 = new Date(Date.now() + 259200000 + 3600000); // En 3 días a las 10:00
      await request(app)
        .put(`/api/agenda/turnos/${turnoId}/reprogramar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nuevaFechaHora: nuevaFechaHora2 })
        .expect(200);

      // Tercera reprogramación (debería fallar)
      const nuevaFechaHora3 = new Date(Date.now() + 345600000 + 3600000); // En 4 días a las 10:00
      await request(app)
        .put(`/api/agenda/turnos/${turnoId}/reprogramar`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ nuevaFechaHora: nuevaFechaHora3 })
        .expect(400);
    });
  });

  describe('CU-AG01.4: Cancelar Turno - Validación Completa', () => {
    test('Escenario Principal: Cancelación exitosa', async () => {
      // Crear turno
      const turnoData = {
        fechaHora: new Date(Date.now() + 86400000 + 28800000), // Mañana a las 17:00
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
        .send({ motivo: 'Paciente canceló por motivos personales' })
        .expect(200);

      expect(response.body.data.estado).toBe(EstadoTurno.CANCELADO);
      expect(response.body.data.Notas[0].descripcion).toContain('Paciente canceló por motivos personales');
    });

    test('Flujo Alternativo 4a: Cancelación múltiple', async () => {
      // Crear múltiples turnos
      const turnosData = [
        {
          fechaHora: new Date(Date.now() + 86400000 + 32400000), // Mañana a las 18:00
          duracion: 30,
          motivo: 'Consulta de rutina',
          pacienteId,
          odontologoId
        },
        {
          fechaHora: new Date(Date.now() + 86400000 + 36000000), // Mañana a las 19:00
          duracion: 30,
          motivo: 'Consulta de rutina',
          pacienteId,
          odontologoId
        }
      ];

      const turnoIds = [];
      for (const turnoData of turnosData) {
        const turnoResponse = await request(app)
          .post('/api/agenda/turnos')
          .set('Authorization', `Bearer ${authToken}`)
          .send(turnoData)
          .expect(201);
        turnoIds.push(turnoResponse.body.data.id);
      }

      // Cancelar múltiples turnos
      for (const turnoId of turnoIds) {
        const response = await request(app)
          .post(`/api/agenda/turnos/${turnoId}/cancelar`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ motivo: 'Cancelación masiva por feriado' })
          .expect(200);

        expect(response.body.data.estado).toBe(EstadoTurno.CANCELADO);
      }
    });
  });

  describe('CU-AG01.5: Ver Agenda - Validación Completa', () => {
    test('Escenario Principal: Ver agenda del día', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/agenda/turnos/agenda/${fecha}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.message).toBe('Agenda obtenida');
    });

    test('Filtros: Por odontólogo', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/agenda/turnos/agenda/${fecha}?odontologoId=${odontologoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Filtros: Por estado', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/agenda/turnos/agenda/${fecha}?estado=${EstadoTurno.PENDIENTE}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('Obtener slots disponibles', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/agenda/turnos/slots-disponibles?fecha=${fecha}&odontologoId=${odontologoId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.message).toBe('Slots disponibles obtenidos');
    });
  });

  describe('CU-AG02: Gestionar Disponibilidad - Validación Completa', () => {
    test('CU-AG02.1: Crear Disponibilidad', async () => {
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
    });

    test('CU-AG02.2: Eliminar Disponibilidad', async () => {
      // Crear disponibilidad
      const disponibilidadData = {
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '08:00',
        horaFin: '16:00',
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

    test('CU-AG02.3: Modificar Disponibilidad', async () => {
      // Crear disponibilidad
      const disponibilidadData = {
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '10:00',
        horaFin: '18:00',
        tipo: TipoDisponibilidad.LABORAL,
        odontologoId
      };

      const createResponse = await request(app)
        .post('/api/agenda/disponibilidades')
        .set('Authorization', `Bearer ${authToken}`)
        .send(disponibilidadData)
        .expect(201);

      const disponibilidadId = createResponse.body.data.id;

      // Modificar disponibilidad
      const updateData = {
        horaInicio: '09:00',
        horaFin: '17:00'
      };

      const response = await request(app)
        .put(`/api/agenda/disponibilidades/${disponibilidadId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.horaInicio).toBe('09:00');
      expect(response.body.data.horaFin).toBe('17:00');
    });

    test('CU-AG02.4: Ver Disponibilidad', async () => {
      const fecha = new Date().toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/agenda/disponibilidades/odontologo/${odontologoId}?fecha=${fecha}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('CU-AG02.5: Validar Disponibilidad', async () => {
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
    });

    test('Generar disponibilidades automáticas', async () => {
      const fechaInicio = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const fechaFin = new Date(Date.now() + 172800000).toISOString().split('T')[0];

      const horarioLaboral = {
        horaInicio: '09:00',
        horaFin: '17:00'
      };

      const response = await request(app)
        .post('/api/agenda/disponibilidades/generar-automaticas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          odontologoId,
          fechaInicio,
          fechaFin,
          horarioLaboral
        })
        .expect(201);

      expect(response.body.message).toBe('Disponibilidades generadas automáticamente');
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
