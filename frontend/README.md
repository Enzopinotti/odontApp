# 🎨 Frontend — OdontApp

Interfaz web de **OdontApp** construida con **React 19**, **React Router 7**, **@tanstack/react-query**, y **SCSS**.  
Este README documenta la arquitectura, el patrón de **CRUD por feature** (ejemplo: *Pacientes*), y cómo **agregar nuevos módulos** de forma escalable.

---

## 🧱 Stack & librerías

- **React 19** + **Vite** (recomendado) o **CRA**
- **React Router 7** — rutas públicas/privadas y navegación con estado
- **@tanstack/react-query** — cache, prefetch, reintentos, invalidations
- **Axios** — cliente HTTP con interceptores
- **Sass (SCSS)** — design tokens y estilos modulares por feature
- **react-icons** — íconos
- **Lottie** — loaders animados
- **ESLint / Prettier** — reglas y buenas prácticas
- **React Query Devtools** (sólo dev)

> Nota: los ejemplos usan Vite. Si usás CRA, ajustá scripts y variables `REACT_APP_*`.

---

## 📁 Estructura general (por capas + por feature)

```bash
frontend/
├── public/
├── src/
│   ├── api/                     # llamadas a endpoints (auth, clinica, etc.)
│   │   ├── axios.js
│   │   └── clinica.js           # API clínica (pacientes, tratamientos, etc.)
│   ├── assets/                  # fuentes, logos, imágenes estáticas
│   ├── components/              # componentes globales y layouts
│   │   ├── layout/
│   │   │   ├── AppLayout.jsx
│   │   │   ├── PublicLayout.jsx
│   │   │   └── ...
│   │   └── BackBar.jsx          # barra volver con soporte de `state.from`
│   ├── context/                 # providers (Auth, Toasts, Modal, ReactQuery)
│   │   ├── AuthProvider.jsx
│   │   ├── ModalProvider.jsx
│   │   ├── ReactQueryProvider.jsx
│   │   └── ToastProvider.jsx
│   ├── features/                # módulos por dominio (pattern escalable)
│   │   └── pacientes/
│   │       ├── api/
│   │       │   └── index.js     # (opcional) reexports de api/clinica.js
│   │       ├── hooks/
│   │       │   ├── usePacientes.js
│   │       │   ├── usePaciente.js
│   │       │   ├── usePacienteExtra.js
│   │       │   ├── usePacienteMutations.js
│   │       │   └── usePrefetchPaciente.js
│   │       ├── components/
│   │       │   ├── PacienteForm.jsx
│   │       │   ├── PacientesHeader.jsx
│   │       │   └── PacienteRow.jsx
│   │       ├── pages/
│   │       │   ├── Pacientes.jsx
│   │       │   ├── PacienteNuevo.jsx
│   │       │   ├── PacienteEditar.jsx
│   │       │   └── PacienteDetalle.jsx
│   │       └── styles/
│   │           └── _pacienteDetalle.scss
│   ├── hooks/                   # hooks compartidos
│   │   ├── useDebouncedValue.js
│   │   └── useToast.js
│   ├── pages/                   # otras páginas globales (auth, perfil, etc.)
│   ├── router/
│   │   └── AppRouter.jsx
│   ├── styles/
│   │   ├── _variables.scss      # design tokens (colores, radios, sombras)
│   │   └── main.scss            # import global + parciales
│   ├── App.jsx
│   └── main.jsx
```

---

## ⚙️ Requisitos y Setup

- **Node.js** 18+ (ideal 20+)
- **pnpm** (recomendado) o npm/yarn

1) Clonar e instalar:

```bash
pnpm install
# o
npm install
```

2)Variables de entorno:

Crear `.env` en la raíz del frontend:

```ini
VITE_API_BASE_URL=http://localhost:4000
VITE_APP_NAME=OdontApp
VITE_ENABLE_RQ_DEVTOOLS=true
```

## 🔌 Axios — cliente HTTP con interceptores

`src/api/axios.js`

```js
// src/api/axios.js
import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // cookies HttpOnly si backend las usa
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor de request (agregar Bearer opcionalmente si aplica)
api.interceptors.request.use((config) => {
  // Si en algún entorno usás token no-HttpOnly (no recomendado):
  const token = sessionStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalizar errores para el frontend
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const { response } = error || {};
    const data = response?.data || {};
    const normalized = {
      status: response?.status || 0,
      code: data.code || 'ERROR_DESCONOCIDO',
      message: data.message || 'Error inesperado',
      errors: data.errors || null, // errores por campo
    };
    return Promise.reject(normalized);
  }
);
```

> Tip: Consumí `api` desde módulos dedicados (p. ej., `src/api/clinica.js`) para mantener endpoints versionados y tipados.

---

## 🧭 Router — públicas, privadas y layout

`src/router/AppRouter.jsx`

```jsx
// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import PublicLayout from '../components/layout/PublicLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import { Pacientes, PacienteNuevo, PacienteEditar, PacienteDetalle } from '../features/pacientes/pages';
import { useAuth } from '../context/AuthProvider';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // o Loader Lottie
  return user ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clinica/pacientes" element={<Pacientes />} />
          <Route path="/clinica/pacientes/nuevo" element={<PacienteNuevo />} />
          <Route path="/clinica/pacientes/:id/editar" element={<PacienteEditar />} />
          <Route path="/clinica/pacientes/:id" element={<PacienteDetalle />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🌐 Providers (Auth, Query, Toasts, Modales)

`src/context/ReactQueryProvider.jsx`

```jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: { retry: 0 },
  },
});

export default function ReactQueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {import.meta.env.VITE_ENABLE_RQ_DEVTOOLS === 'true' && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}

export { queryClient };
```

En `main.jsx` envolver con todos los providers:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ReactQueryProvider from './context/ReactQueryProvider.jsx';
import { AuthProvider } from './context/AuthProvider.jsx';
import { ToastProvider } from './context/ToastProvider.jsx';
import { ModalProvider } from './context/ModalProvider.jsx';
import './styles/main.scss';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ReactQueryProvider>
      <AuthProvider>
        <ToastProvider>
          <ModalProvider>
            <App />
          </ModalProvider>
        </ToastProvider>
      </AuthProvider>
    </ReactQueryProvider>
  </React.StrictMode>
);
```

---

## 🧩 API Clínica — endpoints (ej. Pacientes)

`src/api/clinica.js`

```js
import { api } from './axios';

/* Listado con paginación, orden y filtros */
export async function getPacientes(params = {}) {
  const res = await api.get('/clinica/pacientes', { params });
  return res.data; // { items, total, page, pageSize }
}

/* Detalle */
export async function getPaciente(id) {
  const res = await api.get(`/clinica/pacientes/${id}`);
  return res.data;
}

/* Crear / Actualizar / Eliminar */
export async function createPaciente(payload) {
  const res = await api.post('/clinica/pacientes', payload);
  return res.data;
}
export async function updatePaciente(id, payload) {
  const res = await api.put(`/clinica/pacientes/${id}`, payload);
  return res.data;
}
export async function deletePaciente(id) {
  const res = await api.delete(`/clinica/pacientes/${id}`);
  return res.data;
}
```

---

## 🪝 Hooks React Query — CRUD por feature

### 1) Listado con filtros y `keepPreviousData`

`src/features/pacientes/hooks/usePacientes.js`

```js
import { useQuery } from '@tanstack/react-query';
import { getPacientes } from '../../../api/clinica';

export function usePacientes(params) {
  return useQuery({
    queryKey: ['pacientes', params],
    queryFn: () => getPacientes(params),
    keepPreviousData: true,
    select: (data) => ({
      items: data.items,
      total: data.total,
      page: data.page,
      pageSize: data.pageSize,
    }),
  });
}
```

### 2) Detalle + Prefetch

`src/features/pacientes/hooks/usePaciente.js`

```js
import { useQuery } from '@tanstack/react-query';
import { getPaciente } from '../../../api/clinica';

export function usePaciente(id) {
  return useQuery({
    queryKey: ['paciente', id],
    queryFn: () => getPaciente(id),
    enabled: !!id,
  });
}
```

`src/features/pacientes/hooks/usePrefetchPaciente.js`

```js
import { useQueryClient } from '@tanstack/react-query';
import { getPaciente } from '../../../api/clinica';

export function usePrefetchPaciente() {
  const qc = useQueryClient();
  return (id) =>
    qc.prefetchQuery({
      queryKey: ['paciente', id],
      queryFn: () => getPaciente(id),
      staleTime: 60_000,
    });
}
```

### 3) Mutations con invalidación + optimistic updates

`src/features/pacientes/hooks/usePacienteMutations.js`

```js
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../../../context/ReactQueryProvider';
import { createPaciente, updatePaciente, deletePaciente } from '../../../api/clinica';

export function useCreatePaciente() {
  return useMutation({
    mutationFn: (payload) => createPaciente(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });
}

export function useUpdatePaciente() {
  return useMutation({
    mutationFn: ({ id, payload }) => updatePaciente(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['paciente', id] });
      const prev = queryClient.getQueryData(['paciente', id]);
      queryClient.setQueryData(['paciente', id], (old) => ({ ...old, ...payload }));
      return { prev };
    },
    onError: (_err, { id }, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['paciente', id], ctx.prev);
    },
    onSettled: (_data, _err, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['paciente', id] });
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });
}

export function useDeletePaciente() {
  return useMutation({
    mutationFn: (id) => deletePaciente(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['pacientes'] });
      const prevList = queryClient.getQueryData(['pacientes']);
      queryClient.setQueryData(['pacientes'], (old) => {
        if (!old) return old;
        return { ...old, items: old.items.filter((p) => p.id !== id) };
      });
      return { prevList };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.prevList) queryClient.setQueryData(['pacientes'], ctx.prevList);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] });
    },
  });
}
```

---

## 🗂️ Páginas y componentes (ejemplo Pacientes)

### Listado con filtros, paginación y prefetch on-hover

`src/features/pacientes/pages/Pacientes.jsx`

```jsx
import { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePacientes } from '../hooks/usePacientes';
import { usePrefetchPaciente } from '../hooks/usePrefetchPaciente';
import PacientesHeader from '../components/PacientesHeader';

export default function Pacientes() {
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [orderBy, setOrderBy] = useState('-createdAt');
  const params = useMemo(() => ({ page, pageSize, search, orderBy }), [page, pageSize, search, orderBy]);

  const { data, isFetching } = usePacientes(params);
  const prefetch = usePrefetchPaciente();

  return (
    <section className="card">
      <PacientesHeader
        search={search}
        onSearch={setSearch}
        orderBy={orderBy}
        onOrderBy={setOrderBy}
        isLoading={isFetching}
      />

      <div className="table">
        <div className="table__head">
          <span>Nombre</span>
          <span>Documento</span>
          <span>Teléfono</span>
          <span>Acciones</span>
        </div>

        <div className="table__body">
          {data?.items?.map((p) => (
            <div
              key={p.id}
              className="table__row"
              onMouseEnter={() => prefetch(p.id)}
            >
              <span>{p.nombre}</span>
              <span>{p.documento}</span>
              <span>{p.telefono}</span>
              <span className="actions">
                <Link to={`/clinica/pacientes/${p.id}`} state={{ from: location.pathname }}>Ver</Link>
                <Link to={`/clinica/pacientes/${p.id}/editar`} state={{ from: location.pathname }}>Editar</Link>
              </span>
            </div>
          ))}
        </div>
      </div>

      <footer className="pagination">
        <button disabled={page === 1} onClick={() => setPage((x) => x - 1)}>Anterior</button>
        <span>{page}</span>
        <button disabled={(page * pageSize) >= (data?.total || 0)} onClick={() => setPage((x) => x + 1)}>Siguiente</button>
      </footer>
    </section>
  );
}
```

### Form reutilizable para crear/editar

`src/features/pacientes/components/PacienteForm.jsx`

```jsx
import { useEffect, useState } from 'react';

export default function PacienteForm({ initialValues, onSubmit, disabled }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  useEffect(() => setValues(initialValues), [initialValues]);

  const validate = () => {
    const e = {};
    if (!values.nombre?.trim()) e.nombre = 'El nombre es obligatorio';
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(values);
  };

  const bind = (name) => (ev) => setValues((v) => ({ ...v, [name]: ev.target.value }));

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="field">
        <label>Nombre</label>
        <input name="nombre" value={values.nombre || ''} onChange={bind('nombre')} />
        {errors.nombre && <small className="error">{errors.nombre}</small>}
      </div>

      <div className="field">
        <label>Email</label>
        <input name="email" value={values.email || ''} onChange={bind('email')} />
        {errors.email && <small className="error">{errors.email}</small>}
      </div>

      <div className="actions">
        <button type="submit" disabled={disabled}>Guardar</button>
      </div>
    </form>
  );
}
```

### Crear / Editar

`src/features/pacientes/pages/PacienteNuevo.jsx`

```jsx
import { useNavigate } from 'react-router-dom';
import PacienteForm from '../components/PacienteForm';
import { useCreatePaciente } from '../hooks/usePacienteMutations';
import useToast from '../../../hooks/useToast';

const EMPTY = { nombre: '', email: '' };

export default function PacienteNuevo() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { mutateAsync, isPending } = useCreatePaciente();

  const handleSubmit = async (values) => {
    await mutateAsync(values);
    showToast('Paciente creado', 'success');
    navigate('/clinica/pacientes');
  };

  return <PacienteForm initialValues={EMPTY} onSubmit={handleSubmit} disabled={isPending} />;
}
```

`src/features/pacientes/pages/PacienteEditar.jsx`

```jsx
import { useParams } from 'react-router-dom';
import PacienteForm from '../components/PacienteForm';
import { usePaciente } from '../hooks/usePaciente';
import { useUpdatePaciente } from '../hooks/usePacienteMutations';
import useToast from '../../../hooks/useToast';

export default function PacienteEditar() {
  const { id } = useParams();
  const { data } = usePaciente(id);
  const { mutateAsync, isPending } = useUpdatePaciente();
  const { showToast } = useToast();

  const handleSubmit = async (values) => {
    await mutateAsync({ id, payload: values });
    showToast('Paciente actualizado', 'success');
  };

  if (!data) return null; // o Loader
  return <PacienteForm initialValues={data} onSubmit={handleSubmit} disabled={isPending} />;
}
```

---

## ↩️ BackBar — volver respetando el origen

`src/components/BackBar.jsx`

```jsx
import { useLocation, Link } from 'react-router-dom';

export default function BackBar({ fallback = '/' }) {
  const { state } = useLocation();
  const to = state?.from || fallback;
  return (
    <div className="backbar">
      <Link to={to}>← Volver</Link>
    </div>
  );
}
```

Usar en `PacienteDetalle`/`PacienteEditar` para regresar al listado desde donde el usuario llegó.

---

```scss
$color-primary: #0ea5e9;
$color-bg: #0b1220;
$color-surface: #0f172a;
$color-text: #e2e8f0;

$radius: 14px;
$shadow: 0 8px 22px rgba(0,0,0,0.08);
```

---

## 🧪 Manejo de errores (UX)

- Centralizar en `handleApiError()` si tenés helper, o usar el normalizado del interceptor.
- Mostrar toasts para errores generales y mensajes por campo en formularios.
- Para 401/403, redirigir a `/login` o mostrar mensaje de permisos insuficientes.

---

## ➕ Cómo agregar un **nuevo módulo** (paso a paso)

Suponiendo módulo **Tratamientos**:

1. **API**
   - Crear/usar `src/api/clinica.js` con endpoints: `getTratamientos`, `getTratamiento`, `createTratamiento`, etc.
2. **Feature**
   - Carpeta `src/features/tratamientos/` con subcarpetas `hooks`, `components`, `pages`, `styles`.
   - Implementar hooks como en Pacientes: `useTratamientos`, `useTratamiento`, `useTratamientoMutations`, `usePrefetchTratamiento`.
3. **Pages**
   - `Tratamientos.jsx`, `TratamientoNuevo.jsx`, `TratamientoEditar.jsx`, `TratamientoDetalle.jsx`.
4. **Router**
   - Agregar rutas en `AppRouter.jsx` bajo `AppLayout` y protegerlas con `PrivateRoute`.
5. **UI**
   - Reutilizar componentes (Tabla, BackBar, Form genérico si aplica).
6. **Permisos (opcional)**
   - Render condicional según rol del usuario (si backend provee claims de rol).
7. **Estilos**
   - `_tratamientos.scss` importado desde `main.scss` o desde el index del feature.
8. **React Query**
   - Definir `queryKey`s únicos (`['tratamientos', params]`, `['tratamiento', id]`), invalidaciones y optimistic updates.

> Consejo: copiá la estructura de **Pacientes** como plantilla y renombrá.

---

## 🚀 Performance & DX

- **Code splitting**: `React.lazy` / `Suspense` para páginas pesadas.
- **Prefetch**: hover de filas para anticipar detalles (ver `usePrefetchPaciente`).
- **Memoization**: `useMemo` / `useCallback` en listas con filtros complejos.
- **Devtools**: habilitar `React Query Devtools` sólo en desarrollo.
- **Accesibilidad**: labels asociados, foco gestionado al abrir modales, etc.

---

## 📦 Deploy

1) Generar build:

```bash
pnpm build
```

2)Publicar `dist/` en un hosting estático (Netlify, Vercel, S3 + CloudFront, etc.).
3)Configurar variables de entorno del hosting (`VITE_API_BASE_URL`) y rewrites si se usan rutas cliente (`/* -> /index.html`).

---

## 🧰 Troubleshooting

- **CORS / Cookies**: asegurar `withCredentials: true` en Axios y `Access-Control-Allow-Credentials` en backend.
- **404 al refrescar**: faltan rewrites a `index.html` en el servidor.
- **Estados que no refrescan**: revisar `queryKey` y `invalidateQueries`.
- **Errores silenciosos**: loggear en el `onError` de mutations/queries y mostrar `toast`.

---

## 📝 Convenciones

- **Nombres**: `PascalCase` para componentes, `camelCase` para funciones/vars.
- **Carpetas**: `features/<modulo>` con `hooks/`, `components/`, `pages/`, `styles/`.
- **Query Keys**: `['recurso', params]` para listas; `['recurso', id]` para detalle.
- **Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.

---

¡Listo! Con este patrón podés sumar features sin romper nada, mantener el código ordenado y optimizar la DX. Si algo no cierra, abrís un issue… o me escribís 😉
