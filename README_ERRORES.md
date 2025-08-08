# ❗️ReadMe – Manejo de Errores Globales en OdontApp

Este archivo explica cómo manejar errores de forma consistente en OdontApp, desde la creación de errores personalizados en el backend hasta cómo mostrarlos correctamente en el frontend con modales, toasts y mensajes por campo.

---

## 🔧 ¿Dónde se definen los errores?

### 📍 Backend – Clase `ApiError`

Ubicación: `/src/utils/ApiError.js`

```js
export default class ApiError extends Error {
  constructor(message, status = 400, details = null, code = null) {
    super(message);
    this.status  = status;
    this.details = details;
    this.code    = code;
  }
}
```

---

## 🚨 Cómo lanzar un error desde un controlador

### ✅ Ejemplo simple

```js
throw new ApiError('Correo no verificado', 403, null, 'EMAIL_NO_VERIFICADO');
```

### ✅ Con `details` para errores por campo

```js
throw new ApiError('Datos inválidos', 400, [
  { field: 'email', message: 'El email ya está en uso' }
]);
```

---

## 🧱 Middleware de errores

Ubicación: `/src/middlewares/errorMiddleware.js`

Este middleware:

- Reconoce errores `ApiError` y Sequelize.

- Responde con:

```json
{
  "success": false,
  "message": "Mensaje de error",
  "code": "OPCIONAL",
  "details": [ { field, message } ]
}
```

---

## 🌐 Frontend – `handleApiError.js`

Ubicación: `/src/utils/handleApiError.js`

Esta función centraliza la gestión de errores:

```js
handleApiError(error, showToast, setFieldErrors, showModal);
```

### 💡 Según el `code` recibido, puede

- Mostrar un **toast**
- Mostrar un **modal**
- Setear errores por campo en formularios

---

## ✅ Cómo agregar un nuevo tipo de error

### 1. Backend: lanzar error con `code`

```js
throw new ApiError('Cuenta bloqueada', 429, { retryAfterMinutes: 10 }, 'USUARIO_BLOQUEADO');
```

### 2. Frontend: manejar en `handleApiError`

```js
if (code === 'USUARIO_BLOQUEADO') {
  showModal?.({
    title: 'Cuenta bloqueada',
    message: 'Esperá unos minutos antes de volver a intentar.',
  });
  return;
}
```

---

## 🧪 Errores ya cubiertos

| Código              | Acción en frontend                     |
|---------------------|----------------------------------------|
| `EMAIL_NO_VERIFICADO` | Modal para verificar email            |
| `USUARIO_BLOQUEADO`   | Modal con tiempo de espera            |
| `LOGIN_INVALIDO`      | Toast de credenciales incorrectas     |
| `EMAIL_DUPLICADO`     | Error por campo en `email`            |
| `TOKEN_EXPIRADO`      | Toast de enlace expirado              |
| `2FA_INVALIDO`        | Toast de código 2FA incorrecto        |
| `PWD_ACTUAL_INCORRECTA` | Error por campo en contraseña actual |

---

## 📦 ¿Dónde implementar nuevos errores?

- `src/utils/ApiError.js` → Clase base de error
- `src/middlewares/errorMiddleware.js` → Middleware de captura
- `src/utils/handleApiError.js` → Lógica frontend
- `authService.js` o tu módulo → Lanzar errores desde lógica de negocio

---

## 💬 ¿Qué mostramos al usuario?

- **message**: Texto claro y directo (ej: "Este correo ya está registrado")
- **code**: Interno para manejar desde frontend (ej: `EMAIL_DUPLICADO`)
- **details**: Para mostrar errores por campo

---

Así aseguramos que todos los errores en OdontApp sean:
✔️ Claros  
✔️ Consistentes  
✔️ Fáciles de debuggear  
✔️ Útiles para el usuario final

---

> 🔐 Consejo: Usá códigos de error únicos (`code`) para que el frontend pueda responder sin ambigüedades.
