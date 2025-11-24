// src/utils/handleApiError.js
export function handleApiError(error, showToast, setFieldErrors, showModal) {
  const res = error?.response;

  // ❌ Sin respuesta del server (timeout / offline / CORS)
  if (!res) {
    console.error('❌ Sin respuesta del servidor:', error);
    showToast('Error de conexión con el servidor', 'error');
    return;
  }

  // 🔎 Logs útiles para depurar rápido
  try {
    console.groupCollapsed(
      `API ERROR ${res.status} – ${String(res.config?.method || '').toUpperCase()} ${res.config?.url}`
    );
    if (res.config?.data) {
      try { console.info('Payload:', JSON.parse(res.config.data)); }
      catch { console.info('Payload (raw):', res.config.data); }
    }
    console.info('Response:', res.data);
    console.groupEnd();
  } catch {}

  const { message, code, details } = res.data || {};

  /* ===================== Casuísticas existentes ===================== */

  // 🔒 ERRORES EN LOGIN
  if (code === 'EMAIL_NO_VERIFICADO') {
    console.log('⚠️ Código recibido:', code);
    showModal?.({
      title: 'Cuenta no verificada',
      message: 'Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada o solicitá un nuevo correo.',
      email: res?.config?.data ? (() => { try { return JSON.parse(res.config.data).email; } catch { return ''; } })() : '',
    });
    return;
  }

  if (code === 'USUARIO_BLOQUEADO') {
    const minutos = res.data?.retryAfterMinutes || 10;
    console.log('⚠️ Código recibido:', code);
    showModal?.({
      title: 'Cuenta bloqueada',
      message: `Se bloqueó temporalmente por múltiples intentos fallidos. Intentá nuevamente en ${minutos} minuto(s).`,
    });
    return;
  }

  if (code === 'LOGIN_INVALIDO') {
    showToast('Correo o contraseña incorrectos', 'error');
    return;
  }

  // 🧾 ERRORES EN REGISTRO
  if (code === 'EMAIL_DUPLICADO') {
    if (typeof setFieldErrors === 'function') {
      setFieldErrors({ email: 'Este correo ya está registrado' });
    }
    showToast('Ese correo ya está en uso. Probá con otro.', 'error');
    return;
  }

  // 🔑 VERIFICACIÓN DE CORREO Y RESET PASSWORD
  if (code === 'TOKEN_YA_USADO') {
    showToast('Este enlace ya fue utilizado.', 'error');
    return;
  }
  if (code === 'TOKEN_EXPIRADO') {
    showToast('El enlace ha expirado. Solicitá uno nuevo.', 'error');
    return;
  }
  if (['TOKEN_INEXISTENTE', 'TOKEN_INVALIDO'].includes(code)) {
    showToast('El enlace no es válido.', 'error');
    return;
  }
  if (code === 'USUARIO_INEXISTENTE') {
    showToast('No se encontró un usuario con ese correo.', 'error');
    return;
  }
  if (code === 'CUENTA_CON_GOOGLE') {
    showToast('Registraste tu cuenta con Google. Iniciá sesión usando ese método.', 'error');
    return;
  }
  if (code === 'PASSWORD_REPETIDA') {
    showToast('Elegí una contraseña distinta a la anterior', 'error');
    return;
  }
  if (code === 'PASSWORD_DEBIL') {
    showToast('La contraseña no cumple los requisitos mínimos', 'error');
    return;
  }
  if (code === 'PWD_ACTUAL_INCORRECTA') {
    if (typeof setFieldErrors === 'function') setFieldErrors({ actual: 'Contraseña incorrecta' });
    showToast('Tu contraseña actual no coincide', 'error');
    return;
  }

  // 🔒 LOGIN CON GOOGLE
  if (code === 'LOGIN_CON_GOOGLE') {
    console.log('⚠️ Código recibido:', code);
    showModal?.({
      type: 'google',
      title: 'Inicio con Google',
      message: 'Registraste tu cuenta usando Google. Iniciá sesión usando ese método.',
    });
    return;
  }

  // 🔐 2FA
  if (code === '2FA_NO_CONFIGURADO') {
    showToast('No se ha configurado la autenticación en dos pasos para este usuario.', 'error');
    return;
  }
  if (code === '2FA_INVALIDO') {
    showToast('Código de verificación inválido. Intentá nuevamente.', 'error');
    return;
  }

  // 👤 Pacientes
  if (code === 'DNI_DUPLICADO') {
    if (typeof setFieldErrors === 'function') {
      setFieldErrors({ dni: 'Ya existe un paciente con este DNI' });
    }
    showToast('Este DNI ya está registrado', 'error');
    return;
  }

  /* ===================== NUEVO: Validación 422 ===================== */

  // 🧪 422 – Validaciones del backend (incluye Sequelize.ValidationError normalizada)
  if (res.status === 422 || code === 'VALIDATION_ERROR') {
    if (Array.isArray(details) && typeof setFieldErrors === 'function') {
      const fieldErrors = {};
      details.forEach((e) => {
        if (e?.field) fieldErrors[e.field] = e?.message || 'Dato inválido';
      });
      setFieldErrors(fieldErrors);
    }
    showToast(message || 'Datos inválidos, revisá el formulario', 'error');
    return;
  }

  // Variante por UniqueConstraint genérica desde Sequelize
  if (code === 'SEQUELIZE_UNIQUE' && Array.isArray(details)) {
    const isDni = details.some?.((d) => d.field === 'dni');
    if (isDni) {
      if (typeof setFieldErrors === 'function') setFieldErrors({ dni: 'Ya existe un paciente con este DNI' });
      showToast('Este DNI ya está registrado', 'error');
      return;
    }
  }

  /* ===================== Extras genéricos útiles ===================== */

  // PERMISO DENEGADO (403)
  if (res.status === 403 || code === 'PERMISO_DENEGADO') {
    // Para vistas de detalle usamos gating, así que acá solo un toast suave si hace falta:
    showToast('No tenés permiso para esta acción.', 'error');
    return;
  }
  if (res.status === 404) {
    showToast('Recurso no encontrado', 'error');
    return;
  }

  // 📋 Si viene `details` pero no era 422, igual marcamos campos
  if (details && Array.isArray(details) && typeof setFieldErrors === 'function') {
    const fieldErrors = {};
    for (const err of details) {
      if (err?.field) fieldErrors[err.field] = err?.message || 'Dato inválido';
    }
    setFieldErrors(fieldErrors);
  }

  // CU-AG01.2: Manejo de conflictos de turnos (409 con código SOLAPAMIENTO_TURNO)
  // Nota: Este error se maneja en el componente que llama a la API
  // No mostramos toast aquí para que el componente pueda mostrar el modal
  if (res.status === 409 && code === 'SOLAPAMIENTO_TURNO') {
    // Retornar sin mostrar toast, el componente manejará el error
    return;
  }

  // 🧯 Fallback general
  showToast(message || 'Ocurrió un error inesperado', 'error');
}
