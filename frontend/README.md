# 🎨 Frontend odontApp

Interfaz web de OdontApp construida con React 19 + SCSS + React Router 7.

## 📁 Estructura

```bash
frontend/
├── public/
├── src/
│   ├── api/                 # llamadas a endpoints (auth, pacientes, etc.)
│   ├── assets/              # fuentes, logos, imágenes estáticas
│   ├── components/          # componentes globales y layouts
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── PublicLayout.jsx
│   │   │   └── ...
│   ├── context/             # auth, toasts, modals
│   ├── hooks/               # hooks personalizados
│   ├── pages/               # vistas por ruta (Login, Register, Pacientes, etc.)
│   ├── routes/              # definición de rutas y rutas protegidas
│   ├── styles/              # estilos globales y parciales
│   ├── App.js
│   └── index.js
```

## 🧠 Layouts

- `AppLayout.jsx`: Layout privado (usuarios logueados). Incluye `<Header />`, `<SideBar />`, y contenido principal con `<Outlet />`.
- `PublicLayout.jsx`: Layout público para login, registro, etc.

## 🧩 Contextos

- `AuthProvider`: Manejo de sesión, datos del usuario actual y logout.
- `ModalProvider`: Sistema de modales reutilizable (`resend`, `google`, etc.)
- `ToastProvider`: Sistema de toasts centralizado.

## 🚀 Scripts

```bash
npm install      # instalar dependencias
npm start        # entorno de desarrollo
npm run build    # build de producción
```

## 📦 Dependencias principales

- `react` 19
- `react-router-dom` 7
- `axios`
- `react-icons`
- `@tanstack/react-query`
- `sass`

---

Listo para integrar el **módulo Clínica** con las pantallas necesarias 🎯.
