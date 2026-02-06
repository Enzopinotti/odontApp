import { jest } from '@jest/globals';

// Mocks
jest.unstable_mockModule('../src/services/emailService.js', () => ({
    enviarCorreo: jest.fn().mockResolvedValue(true)
}));

const { default: request } = await import('supertest');
const { default: app } = await import('../index.js');
const { sequelize } = await import('../src/config/db.js');
const { Rol, Usuario, EmailVerificationToken, PasswordResetToken } = await import('../src/modules/Usuarios/models/index.js');

describe('Módulo Usuarios - Casos de Uso (CU-US)', () => {
    let adminToken;
    let userToken;
    let testUserId;
    const testEmail = 'user@test.com';
    const testPassword = 'Password123!';

    beforeAll(async () => {
        await sequelize.sync({ force: true });

        // Seed Roles
        await Rol.bulkCreate([
            { id: 1, nombre: 'Admin' },
            { id: 2, nombre: 'Odontologo' },
            { id: 3, nombre: 'Secretaria' },
            { id: 4, nombre: 'Recepcionista' },
            { id: 5, nombre: 'Paciente' }
        ]);

        // Create Admin
        const admin = await Usuario.create({
            nombre: 'Admin',
            apellido: 'Sistema',
            email: 'admin@test.com',
            password: 'AdminPassword123!',
            RolId: 1,
            activo: true
        });

        // Admin Login to get token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'AdminPassword123!' });
        adminToken = loginRes.body.data.accessToken;
    });

    describe('CU-US6.1 — Registrar usuario (autoregistro)', () => {
        test('Debe registrar un usuario pendiente de verificación', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    nombre: 'Juan',
                    apellido: 'Pérez',
                    email: testEmail,
                    password: testPassword
                });

            expect(res.status).toBe(201);
            expect(res.body.data.email).toBe(testEmail);
            expect(res.body.data.activo).toBe(false);
            testUserId = res.body.data.id;
        });
    });

    describe('CU-US4 — Verificar email', () => {
        test('Debe activar al usuario con un token válido', async () => {
            const tokenRecord = await EmailVerificationToken.findOne({ where: { UsuarioId: testUserId } });

            const res = await request(app)
                .get(`/api/auth/verify-email/${tokenRecord.token}`);

            expect(res.status).toBe(200);

            const user = await Usuario.findByPk(testUserId);
            expect(user.activo).toBe(true);
        });
    });

    describe('CU-US1 — Iniciar sesión (email + contraseña)', () => {
        test('Debe iniciar sesión y retornar tokens y cookies', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: testEmail, password: testPassword });

            expect(res.status).toBe(200);
            expect(res.body.data.accessToken).toBeDefined();
            expect(res.header['set-cookie']).toBeDefined();
            userToken = res.body.data.accessToken;
        });

        test('RN-US04: Bloqueo tras 5 intentos fallidos (Simulación)', async () => {
            // Intentos fallidos
            for (let i = 0; i < 5; i++) {
                await request(app).post('/api/auth/login').send({ email: testEmail, password: 'wrong' });
            }

            const res = await request(app).post('/api/auth/login').send({ email: testEmail, password: testPassword });
            expect(res.status).toBe(429); // Bloqueado
        });
    });


    describe('CU-US5 — Obtener mi perfil (getMe)', () => {
        test('Debe retornar el perfil del usuario autenticado', async () => {
            const res = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.email).toBe(testEmail);
        });
    });

    describe('CU-US5.1 — Actualizar mi perfil', () => {
        test('Debe editar campos permitidos', async () => {
            const res = await request(app)
                .put('/api/auth/me')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ nombre: 'Juan Actualizado' });

            expect(res.status).toBe(200);
            expect(res.body.data.nombre).toBe('Juan Actualizado');
        });
    });

    describe('CU-US3 — Recuperar contraseña (solicitud)', () => {
        test('Debe generar token de reseteo sin revelar existencia', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: testEmail });

            expect(res.status).toBe(200);
        });
    });

    describe('CU-US3.1 — Restablecer contraseña (uso de token)', () => {
        test('Debe actualizar el password con token válido', async () => {
            const tokenRecord = await PasswordResetToken.findOne({
                include: [{ model: Usuario, where: { email: testEmail } }]
            });

            const res = await request(app)
                .post(`/api/auth/reset-password/${tokenRecord.token}`)
                .send({ password: 'NewPassword123!' });

            expect(res.status).toBe(200);
        });
    });

    describe('CU-US2 — Cerrar sesión', () => {
        test('Debe borrar cookies', async () => {
            const res = await request(app)
                .post('/api/auth/logout');

            expect(res.status).toBe(200);
            // El servidor debería enviar cookies vacías o expiradas en el header
        });
    });

    describe('CU-US6 — Administrar Usuarios (Listar/Buscar)', () => {
        test('Admin debe listar usuarios con filtros', async () => {
            const res = await request(app)
                .get('/api/usuarios')
                .set('Authorization', `Bearer ${adminToken}`)
                .query({ page: 1, pageSize: 10 });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('CU-US6.2 — Editar usuario (admin)', () => {
        test('Admin debe cambiar el rol de un usuario', async () => {
            const res = await request(app)
                .put(`/api/usuarios/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ RolId: 2 });

            expect(res.status).toBe(200);
            expect(res.body.data.RolId).toBe(2);
        });
    });

    describe('CU-US6.3 — Eliminar usuario (baja lógica)', () => {
        test('Admin debe marcar activo=false (Baja Lógica)', async () => {
            const res = await request(app)
                .delete(`/api/usuarios/${testUserId}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);

            // Re-obtener usuario (incluyendo eliminados si es soft-delete, pero el spec pide activo=false)
            const user = await Usuario.findByPk(testUserId, { paranoid: false });
            expect(user.activo).toBe(false);
        });
    });

    describe('CU-US6.4 — Activa / Desactivar usuario (atajo)', () => {
        test('Debe alternar el estado del usuario', async () => {
            const res = await request(app)
                .patch(`/api/usuarios/${testUserId}/toggle`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.data.activo).toBe(true); // Estaba en false por el test anterior
        });
    });

    describe('CU-US6.5 — Registrar / Iniciar sesión con Google (OAuth)', () => {
        test('Debe existir la ruta de redirección', async () => {
            const res = await request(app).get('/api/auth/google');
            expect(res.status).toBe(302); // Redirect
        });
    });

    describe('CU-US5.4 — Autenticación 2FA (setup/verify/disable)', () => {
        let secret;

        test('Debe generar secreto', async () => {
            const res = await request(app)
                .post('/api/auth/2fa/setup')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
            secret = res.body.data.secret;
        });

        test('Debe activar 2FA con código válido (Simulado)', async () => {
            const { default: speakeasy } = await import('speakeasy');
            const token = speakeasy.totp({
                secret,
                encoding: 'base32'
            });

            const res = await request(app)
                .post('/api/auth/2fa/verify')
                .set('Authorization', `Bearer ${userToken}`)
                .send({ token, secret });

            expect(res.status).toBe(200);
        });

        test('CU-US1.1: Login con 2FA usando tempToken', async () => {
            // Reset de intentos previos por si acaso (evitar 429)
            await Usuario.update(
                { intentosFallidos: 0, bloqueadoHasta: null },
                { where: { email: testEmail } }
            );

            // 1. Login normal -> recibe tempToken
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({ email: testEmail, password: 'NewPassword123!' });

            if (loginRes.status !== 200) {
                console.log('Login Step 1 failed:', loginRes.status, loginRes.body);
            }
            expect(loginRes.body.data.require2FA).toBe(true);
            const tempToken = loginRes.body.data.tempToken;
            expect(tempToken).toBeDefined();

            // 2. Login 2FA
            const { default: speakeasy } = await import('speakeasy');
            const token = speakeasy.totp({
                secret,
                encoding: 'base32'
            });

            const res = await request(app)
                .post('/api/auth/2fa/login')
                .send({ tempToken, token });

            expect(res.status).toBe(200);
            expect(res.body.data.accessToken).toBeDefined();
        });

        test('Debe desactivar 2FA', async () => {
            const res = await request(app)
                .delete('/api/auth/2fa')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.status).toBe(200);
        });
    });
});
