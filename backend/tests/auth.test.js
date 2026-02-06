import { jest } from '@jest/globals';
import * as authService from '../src/modules/Usuarios/services/authService.js';
import { Usuario, Rol, EmailVerificationToken, PasswordResetToken } from '../src/modules/Usuarios/models/index.js';
import { sequelize } from '../src/config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock del servicio de correo para evitar envíos reales
jest.unstable_mockModule('../src/services/emailService.js', () => ({
    enviarCorreo: jest.fn().mockResolvedValue(true)
}));

describe('Módulo de Autenticación (Auth) - Tests Comprensivos', () => {
    let testUser;
    const passwordValida = 'Password123!';

    beforeAll(async () => {
        // Sincronizar base de datos
        await sequelize.sync({ force: true });

        // Crear rol básico para los tests
        await Rol.create({ id: 5, nombre: 'Paciente' });
        await Rol.create({ id: 1, nombre: 'Admin' });
    });

    describe('Registro de Usuarios', () => {
        test('Debe registrar un nuevo usuario exitosamente', async () => {
            const userData = {
                nombre: 'Test',
                apellido: 'User',
                email: 'test@example.com',
                password: passwordValida
            };

            const result = await authService.register(userData);
            expect(result.user).toBeDefined();
            expect(result.user.email).toBe(userData.email);
            expect(result.user.RolId).toBe(5); // Rol por defecto

            const userInDb = await Usuario.findOne({ where: { email: userData.email } });
            expect(userInDb).toBeTruthy();
        });

        test('Debe fallar si el email ya existe', async () => {
            const userData = {
                nombre: 'Dup',
                apellido: 'User',
                email: 'test@example.com',
                password: passwordValida
            };

            await expect(authService.register(userData)).rejects.toThrow('El correo ya está en uso');
        });
    });

    describe('Login de Usuarios', () => {
        test('Debe iniciar sesión exitosamente con credenciales válidas y cuenta activa', async () => {
            // Activar el usuario creado en el test anterior
            const user = await Usuario.findOne({ where: { email: 'test@example.com' } });
            await user.update({ activo: true });

            const result = await authService.login('test@example.com', passwordValida);
            expect(result.accessToken).toBeDefined();
            expect(result.refreshToken).toBeDefined();
            expect(result.user.email).toBe('test@example.com');
        });

        test('Debe fallar si la cuenta no está activa', async () => {
            const inactiveUser = await Usuario.create({
                nombre: 'Inactive',
                apellido: 'User',
                email: 'inactive@example.com',
                password: passwordValida,
                RolId: 5,
                activo: false
            });

            await expect(authService.login('inactive@example.com', passwordValida)).rejects.toThrow('Debes verificar tu cuenta');
        });

        test('Debe fallar con contraseña incorrecta e incrementar intentos fallidos', async () => {
            const user = await Usuario.findOne({ where: { email: 'test@example.com' } });
            const intentosIniciales = user.intentosFallidos;

            await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow('Credenciales inválidas');

            const updatedUser = await Usuario.findOne({ where: { email: 'test@example.com' } });
            expect(updatedUser.intentosFallidos).toBe(intentosIniciales + 1);
        });

        test('Debe bloquear la cuenta tras 5 intentos fallidos', async () => {
            const email = 'lock@example.com';
            await Usuario.create({
                nombre: 'Lock',
                apellido: 'Test',
                email: email,
                password: passwordValida,
                RolId: 5,
                activo: true
            });

            // 5 intentos fallidos
            for (let i = 0; i < 5; i++) {
                try { await authService.login(email, 'wrong'); } catch (e) { }
            }

            const lockedUser = await Usuario.findOne({ where: { email } });
            expect(lockedUser.bloqueadoHasta).not.toBeNull();
            expect(lockedUser.bloqueadoHasta > new Date()).toBe(true);

            await expect(authService.login(email, 'wrong')).rejects.toThrow('Cuenta bloqueada temporalmente');
        });
    });

    describe('Tokens y Sesión', () => {
        test('Debe refrescar el access token usando un refresh token válido', async () => {
            const loginResult = await authService.login('test@example.com', passwordValida);

            const newAccessToken = await authService.refresh(loginResult.refreshToken);
            expect(newAccessToken).toBeDefined();

            const decoded = jwt.decode(newAccessToken);
            expect(decoded.email).toBe('test@example.com');
        });

        test('Debe fallar si el refresh token es inválido', async () => {
            await expect(authService.refresh('token-invalido')).rejects.toThrow('Refresh token inválido');
        });
    });

    describe('Recuperación de Contraseña', () => {
        test('Debe generar un token de reset y validar la nueva contraseña', async () => {
            const email = 'test@example.com';
            await authService.forgotPassword(email);

            const tokenRow = await PasswordResetToken.findOne({
                include: [{ model: Usuario, where: { email } }]
            });
            expect(tokenRow).toBeTruthy();

            const nuevaPass = 'NewPassword123!';

            // Intentar resetear con la misma password (debe fallar)
            await expect(authService.resetPassword(tokenRow.token, passwordValida))
                .rejects.toThrow('Elegí una contraseña distinta a la anterior');

            // Resetear con password débil (debe fallar)
            await expect(authService.resetPassword(tokenRow.token, '123'))
                .rejects.toThrow('La contraseña no cumple los requisitos mínimos');

            // Reset exitoso
            await authService.resetPassword(tokenRow.token, nuevaPass);

            const updatedUser = await Usuario.scope(null).findOne({ where: { email } });
            const isMatch = await updatedUser.validarPassword(nuevaPass);
            expect(isMatch).toBe(true);

            const usedToken = await PasswordResetToken.findOne({ where: { token: tokenRow.token } });
            expect(usedToken.usado).toBe(true);
        });
    });

    describe('Perfil de Usuario', () => {
        test('Debe obtener el perfil del usuario con permisos formateados', async () => {
            const user = await Usuario.findOne({ where: { email: 'test@example.com' } });
            const profile = await authService.getMe(user.id);

            expect(profile).toBeDefined();
            expect(profile.email).toBe(user.email);
            expect(Array.isArray(profile.permisos)).toBe(true);
        });

        test('Debe actualizar datos del perfil', async () => {
            const user = await Usuario.findOne({ where: { email: 'test@example.com' } });
            const newData = { nombre: 'UpdatedName' };

            await authService.updateMe(user.id, newData);

            const updatedUser = await Usuario.findByPk(user.id);
            expect(updatedUser.nombre).toBe(newData.nombre);
        });
    });
});
