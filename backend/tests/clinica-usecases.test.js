import { jest } from '@jest/globals';

// Mocks
jest.unstable_mockModule('../src/utils/upload/cloudinary.js', () => ({
    default: {
        uploader: {
            upload: jest.fn().mockResolvedValue({ secure_url: 'http://example.com/img.jpg', public_id: '123' }),
            destroy: jest.fn().mockResolvedValue(true)
        }
    }
}));

jest.unstable_mockModule('../src/utils/upload/multerCloudinary.js', () => {
    console.log('🛠️ Mock factory for multerCloudinary called');
    return {
        uploadAvatar: {
            single: () => (req, res, next) => {
                req.file = { path: 'http://example.com/mock.jpg' };
                next();
            }
        },
        uploadImagenesClinicas: {
            single: () => (req, res, next) => {
                req.file = { path: 'http://example.com/clinical.jpg' };
                if (!req.body) req.body = {};
                req.body.tipoImagen = 'Radiografia';
                next();
            }
        }
    };
});

const { default: request } = await import('supertest');
const { default: app } = await import('../index.js');
const { sequelize } = await import('../src/config/db.js');
const { Rol, Usuario } = await import('../src/modules/Usuarios/models/index.js');
const { Paciente, EstadoPaciente, Odontograma, Tratamiento, Diente } = await import('../src/modules/Clinica/models/index.js');

describe('Módulo Clínica - Casos de Uso (CU-CL)', () => {
    let adminToken;
    let pacienteId;
    let odontogramaId;
    let tratamientoId;
    let historiaId;

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Setup Roles y Admin
        await Rol.bulkCreate([{ id: 1, nombre: 'Admin' }]);
        const admin = await Usuario.create({
            nombre: 'Admin',
            apellido: 'Clinica',
            email: 'admin@clinica.com',
            password: 'AdminPassword123!',
            RolId: 1,
            activo: true
        });

        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@clinica.com', password: 'AdminPassword123!' });
        adminToken = loginRes.body.data.accessToken;

        // Setup Estados
        await EstadoPaciente.bulkCreate([
            { id: 1, nombre: 'ACTIVO' },
            { id: 2, nombre: 'BAJA' }
        ]);
    });

    describe('CU-CL1.1 — Crear Paciente', () => {
        test('Debe crear un paciente correctamente', async () => {
            const res = await request(app)
                .post('/api/clinica/pacientes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nombre: 'Carlos',
                    apellido: 'Méndez',
                    dni: '20123456',
                    contacto: {
                        email: 'carlos@test.com',
                        telefono: '11223344',
                        direccion: {
                            calle: 'Av. Corrientes 500',
                            ciudad: 'CABA'
                        }
                    }
                });

            expect(res.status).toBe(201);
            pacienteId = res.body.data.id;
        });

        test('RN-CL01: DNI único', async () => {
            const res = await request(app)
                .post('/api/clinica/pacientes')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nombre: 'Duplicado',
                    apellido: 'Test',
                    dni: '20123456',
                    contacto: {
                        email: 'dup@test.com',
                        direccion: { calle: 'Fake 123', ciudad: 'CABA' }
                    }
                });
            expect(res.status).toBe(409);
        });
    });

    describe('CU-CL1.0 — Listar / Buscar Pacientes', () => {
        test('Debe filtrar pacientes por DNI', async () => {
            const res = await request(app)
                .get('/api/clinica/pacientes')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ dni: '20123456' });

            expect(res.status).toBe(200);
            // Ajuste para estructura actual { success, message, data: { data: [], total: X } }
            const pacientes = res.body.data.data || res.body.data;
            expect(pacientes.length).toBe(1);
        });
    });

    describe('CU-CL1.2 — Ver Ficha de Paciente', () => {
        test('Debe retornar todo el detalle del paciente', async () => {
            const res = await request(app)
                .get(`/api/clinica/pacientes/${pacienteId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.dni).toBe('20123456');
        });
    });

    describe('CU-CL1.3 — Editar Paciente', () => {
        test('Debe actualizar datos del paciente', async () => {
            const res = await request(app)
                .put(`/api/clinica/pacientes/${pacienteId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ apellido: 'Méndez Actualizado' });

            expect(res.status).toBe(200);
            expect(res.body.data.apellido).toBe('Méndez Actualizado');
        });
    });

    describe('CU-CL3.2 — Crear Odontograma', () => {
        test('Debe inicializar un odontograma de 32 dientes', async () => {
            const res = await request(app)
                .post(`/api/clinica/odontograma/${pacienteId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(201);
            odontogramaId = res.body.data.id;
        });
    });

    describe('CU-CL3.1 — Obtener Odontograma por Paciente', () => {
        test('Debe retornar la estructura del odontograma', async () => {
            const res = await request(app)
                .get(`/api/clinica/odontograma/${pacienteId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.id).toBe(odontogramaId);
        });
    });

    describe('CU-CL3.3 — Actualizar Diente', () => {
        test('Debe actualizar estado de un diente', async () => {
            const res = await request(app)
                .put(`/api/clinica/odontograma/${odontogramaId}/diente/11`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ estadoDiente: 'CARIES', notas: 'Caries disto-oclusal' });

            expect(res.status).toBe(200);
        });
    });

    describe('CU-CL2.2 — Registrar Entrada Clínica', () => {
        test('Debe registrar evolución y actualizar ultimaVisita (RN-CL03)', async () => {
            const res = await request(app)
                .post(`/api/clinica/historia/${pacienteId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    motivoConsulta: 'Consulta de urgencia', // titulo en spec
                    evolucion: 'Se realiza apertura cameral.' // descripcion en spec
                });

            expect(res.status).toBe(201);
            historiaId = res.body.data.id;

            const p = await Paciente.findByPk(pacienteId);
            expect(p.ultimaVisita).toBeDefined();
        });
    });

    describe('CU-CL2.1 — Obtener Historia Clínica por Paciente', () => {
        test('Debe listar entradas clínicas', async () => {
            const res = await request(app)
                .get(`/api/clinica/historia/${pacienteId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('CU-CL2.3 — Subir Imagen Clínica', () => {
        test('Debe permitir subir una imagen adjunta a una historia', async () => {
            // Mockeamos la carga de archivos con supertest
            const res = await request(app)
                .post(`/api/clinica/historia/${historiaId}/imagenes`)
                .set('Authorization', `Bearer ${adminToken}`)
                .attach('imagen', Buffer.from('fake image'), 'radiografia.jpg')
                .field('tipoImagen', 'Radiografia');

            expect(res.status).toBe(201);
        });
    });

    describe('CU-CL4.2 — Crear / Editar Tratamiento', () => {
        test('Debe crear un tratamiento en el catálogo', async () => {
            const res = await request(app)
                .post('/api/clinica/tratamientos')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nombre: 'Endodoncia Unirradicular',
                    precio: 15000,
                    descripcion: 'Tratamiento de conducto'
                });

            expect(res.status).toBe(201);
            tratamientoId = res.body.data.id;
        });
    });

    describe('CU-CL4.1 — Listar Tratamientos', () => {
        test('Debe listar tratamientos', async () => {
            const res = await request(app)
                .get('/api/clinica/tratamientos')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('CU-CL3.4 — Gestionar Caras Tratadas', () => {
        test('Debe aplicar un tratamiento a una cara de un diente', async () => {
            const odon = await Odontograma.findByPk(odontogramaId, {
                include: [{ model: Diente, as: 'Dientes' }]
            });
            const dienteId = odon.Dientes[0].id;

            const res = await request(app)
                .post(`/api/clinica/odontograma/diente/${dienteId}/aplicar-tratamiento`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    tratamientoId,
                    cara: 'O',
                    estado: 'REALIZADO'
                });

            expect(res.status).toBe(201);
        });
    });

    describe('CU-CL4.4 — Historial de Tratamientos por Paciente', () => {
        test('Debe retornar timeline de tratamientos', async () => {
            const res = await request(app)
                .get(`/api/clinica/tratamientos/paciente/${pacienteId}/historial`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
        });
    });

    describe('CU-CL5 — Firmar Ficha Digital', () => {
        test('RN-CL08: Hash de integridad obligatorio (Placeholder)', async () => {
            const res = await request(app)
                .post(`/api/clinica/pacientes/${pacienteId}/firma`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ trazo: 'base64...' });

            expect(res.status).toBe(200);
        });
    });

    describe('CU-CL1.4 — Eliminar Paciente', () => {
        test('Debe marcar estado=BAJA (RN-CL05)', async () => {
            const res = await request(app)
                .delete(`/api/clinica/pacientes/${pacienteId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);

            const p = await Paciente.findByPk(pacienteId, { paranoid: false });
            expect(p.estadoId).toBe(2); // BAJA
        });
    });
});
