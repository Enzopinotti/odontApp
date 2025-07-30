# Plantillas de correo (emailTemplates.js)

Este módulo contiene las plantillas HTML utilizadas para enviar correos desde OdontApp (registro, recuperación, etc).

## 📦 Estructura

- `colors`: se importa la paleta usada en SCSS para coherencia visual.
- `baseLayout(content)`: estructura base compartida para todos los correos.
- `templates.confirmEmail()`: correo de verificación.
- `templates.resetPassword()`: correo de recuperación.

## 🎨 Paleta actual

| Nombre   | Color    | Uso               |
|----------|----------|------------------|
| primary  | #145C63  | Botones, títulos |
| light    | #F3F4F6  | Fondo general     |
| dark     | #1C1C1E  | Texto principal   |
| white    | #ffffff  | Fondo contenedor  |
| accent   | #C1C1C1  | Texto secundario  |

## 🧪 Cómo probar

1. Establecer `SMTP_*` en `.env` y `NODE_ENV=development`.
2. Registrar usuario → se enviará `confirmEmail`.
3. Usar "Olvidé mi contraseña" → se enviará `resetPassword`.

## ➕ Agregar nueva plantilla

1. Crear una entrada en `templates`:
   ```js
   nueva: ({ name, link }) => baseLayout(`
     ...contenido aquí...
   `)
