import { jest } from '@jest/globals';
import * as pacienteService from '../src/modules/Clinica/services/pacienteService.js';
import * as historiaService from '../src/modules/Clinica/services/historiaClinicaService.js';
import { Paciente, EstadoPaciente, HistoriaClinica, Contacto, Direccion } from '../src/modules/Clinica/models/index.js';
import { sequelize } from '../src/config/db.js';

// Mock de Cloudinary
jest.unstable_mockModule('../src/utils/upload/cloudinary.js', () => ({
    default: {
        uploader: {
            upload: jest.fn().mockResolvedValue({ secure_url: 'http://example.com/img.jpg' }),
            destroy: jest.fn().mockResolvedValue(true)
        }
    }
}));

describe('Módulo Clínica - Tests Comprensivos', () => {
    let testPatient;

    beforeAll(async () => {
        // Sincronizar base de datos
        await sequelize.sync({ force: true });

        // Crear estados de paciente básicos
        await EstadoPaciente.create({ id: 1, nombre: 'ACTIVO' });
        await EstadoPaciente.create({ id: 2, nombre: 'INACTIVO' });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe('Gestión de Pacientes', () => {
        test('Debe crear un paciente con su contacto y dirección', async () => {
            const pacienteData = {
                nombre: 'Juan',
                apellido: 'Pérez',
                dni: '12345678',
                email: 'juan@example.com',
                fechaNacimiento: '1990-01-01',
                genero: 'M',
                contacto: {
                    telefono: '123456789',
                    direccion: {
                        calle: 'Falsa 123',
                        ciudad: 'Springfield'
                    }
                }
            };

            const result = await pacienteService.crear(pacienteData);
            expect(result).toBeDefined();
            expect(result.nombre).toBe('Juan');
            expect(result.dni).toBe('12345678');

            testPatient = result;

            // Verificar persistencia y asociaciones
            const dbRecord = await Paciente.findByPk(result.id, {
                include: [{ model: Contacto, include: [Direccion] }]
            });
            expect(dbRecord.Contacto).toBeDefined();
            expect(dbRecord.Contacto.Direccion).toBeDefined();
            expect(dbRecord.Contacto.Direccion.calle).toBe('Falsa 123');
        });

        test('Debe fallar al crear un paciente con DNI duplicado', async () => {
            const dupeData = {
                nombre: 'Otro',
                apellido: 'Juan',
                dni: '12345678', // Mismo DNI
                email: 'otro@example.com'
            };

            await expect(pacienteService.crear(dupeData)).rejects.toThrow('Ya existe un paciente con ese DNI');
        });

        test('Debe obtener un paciente por ID', async () => {
            const result = await pacienteService.obtenerPorId(testPatient.id);
            expect(result.id).toBe(testPatient.id);
            expect(result.nombre).toBe('Juan');
        });

        test('Debe actualizar datos del paciente', async () => {
            const updateData = { nombre: 'Juan Ignacio' };
            const updated = await pacienteService.actualizar(testPatient.id, updateData);

            expect(updated.nombre).toBe('Juan Ignacio');
        });

        test('Debe realizar una baja lógica del paciente', async () => {
            await pacienteService.eliminar(testPatient.id);

            const p = await Paciente.findByPk(testPatient.id, { paranoid: false });
            expect(p.deletedAt).not.toBeNull();
        });
    });

    describe('Historia Clínica', () => {
        let patientId;

        beforeAll(async () => {
            // Crear un nuevo paciente para los tests de historia
            const p = await pacienteService.crear({
                nombre: 'Maria',
                apellido: 'Gomez',
                dni: '87654321',
                email: 'maria@example.com'
            });
            patientId = p.id;
        });

        test('Debe añadir una evolución a la historia clínica', async () => {
            const historiaData = {
                motivoConsulta: 'Consulta General',
                evolucion: 'Paciente presenta dolor en molar superior derecho.',
                fecha: new Date().toISOString().split('T')[0]
            };

            const result = await historiaService.crear(patientId, historiaData);
            expect(result).toBeDefined();
            expect(result.motivoConsulta).toBe(historiaData.motivoConsulta);
            expect(result.pacienteId).toBe(patientId);

            // Verificar que se actualizó la última visita del paciente
            const p = await Paciente.findByPk(patientId);
            expect(p.ultimaVisita).toBeDefined();
        });

        test('Debe listar las evoluciones de un paciente', async () => {
            const historias = await historiaService.obtenerPorPaciente(patientId);
            expect(Array.isArray(historias)).toBe(true);
            expect(historias.length).toBeGreaterThan(0);
            expect(historias[0].motivoConsulta).toBe('Consulta General');
        });

        test('Debe fallar si el paciente no existe al crear una historia', async () => {
            await expect(historiaService.crear(999, { motivoConsulta: 'error' }))
                .rejects.toThrow();
        });
    });
});
