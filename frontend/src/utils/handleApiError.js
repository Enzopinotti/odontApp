/**
 * Maneja errores de API (Axios) y opcionalmente setea errores por campo
 * @param {Error} error - Objeto de error de Axios
 * @param {Function} showToast - Función para mostrar toast
 * @param {Function} [setFieldErrors] - Setter opcional para errores por campo
 * @param {Function} [showModal] - Función para mostrar modal personalizado
 */
export function handleApiError(error, showToast, setFieldErrors, showModal) {
  const res = error.response;
  if (!res) {
    showToast('Error de conexión con el servidor', 'error');
    return;
  }

  const { message, code, details } = res.data;

  // 🔒 ERRORES EN LOGIN
  if (code === 'EMAIL_NO_VERIFICADO') {
    console.log('⚠️ Código recibido:', code);
    showModal?.({
      title: 'Cuenta no verificada',
      message: 'Debes verificar tu correo antes de iniciar sesión. Revisa tu bandeja de entrada o solicitá un nuevo correo.',
      email: res?.config?.data ? JSON.parse(res.config.data).email : '',
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

  // 📋 ERRORES DE VALIDACIÓN POR CAMPO
  if (details && Array.isArray(details) && typeof setFieldErrors === 'function') {
    const fieldErrors = {};
    for (const err of details) {
      fieldErrors[err.field] = err.message;
    }
    setFieldErrors(fieldErrors);
  }

  // 🧯 Fallback general
  showToast(message || 'Ocurrió un error inesperado', 'error');
}
