# 🔐 README – Manejo de Permisos y Roles en OdontApp

Este archivo documenta cómo aplicar y verificar permisos por rol en el backend de OdontApp, utilizando middleware personalizado para proteger recursos según los accesos definidos.

---

## 🎭 ¿Cómo funciona el sistema de roles y permisos?

Cada usuario tiene un `RolId`, y cada rol está asociado a múltiples permisos a través de la tabla intermedia `rol_permisos`.  
Cada permiso define una combinación de:

- `recurso` (ej: "pacientes", "turnos")
- `accion` (ej: "listar", "editar")

---

## 🧱 Estructura de datos

### 📌 Tabla `roles`

```json
[
  { "id": 1, "nombre": "Administrador" },
  { "id": 2, "nombre": "Odontólogo" },
  { "id": 3, "nombre": "Asistente" },
  { "id": 4, "nombre": "Recepcionista" }
]
```

### 📌 Tabla `permisos`

```json
{ recurso: 'pacientes', accion: 'listar' }
```

### 📌 Tabla intermedia `rol_permisos`

Relaciona `RolId` con `PermisoId`

---

## 🧩 Middleware `requirePermiso()`

Ubicación: `/src/middlewares/permisoMiddleware.js`

```js
import ApiError from '../utils/ApiError.js';
import { Permiso, Rol } from '../modules/Usuarios/models/index.js';

export const requirePermiso = (recurso, accion) => async (req, _res, next) => {
  try {
    const roleId = req.user.roleId;
    if (!roleId) throw new ApiError('Rol no definido en token', 403);

    const tiene = await Permiso.findOne({
      where: { recurso, accion },
      include: {
        model: Rol,
        where: { id: roleId },
        through: { attributes: [] },
      },
    });

    if (!tiene) throw new ApiError('No tienes permiso para esta acción', 403, null, 'PERMISO_DENEGADO');
    return next();
  } catch (err) {
    return next(err);
  }
};
```

---

## 🔐 Cómo usar en rutas

### ✅ Paso 1: Importar y proteger

```js
import { requirePermiso } from '../../../middlewares/permisoMiddleware.js';

router.get('/', requirePermiso('pacientes', 'listar'), listarPacientes);
router.post('/', requirePermiso('pacientes', 'crear'), crearPaciente);
router.put('/:id', requirePermiso('pacientes', 'editar'), actualizarPaciente);
router.delete('/:id', requirePermiso('pacientes', 'eliminar'), eliminarPaciente);
```

---

## 📋 Reglas recomendadas por módulo

| Módulo       | Recurso        | Acciones típicas                |
|--------------|----------------|----------------------------------|
| Usuarios     | usuarios       | crear, listar, editar, eliminar |
| Pacientes    | pacientes      | crear, listar, editar, eliminar |
| Odontograma  | odontograma    | ver, editar                     |
| Turnos       | turnos         | crear, ver, editar, cancelar    |
| Tratamientos | tratamientos   | listar, crearPersonalizado      |
| Reportes     | reportes       | ver                             |

---

## 🎯 Cómo llega al frontend

Si un usuario accede a una ruta sin permiso, se lanza:

```json
{
  "success": false,
  "message": "No tienes permiso para esta acción",
  "code": "PERMISO_DENEGADO"
}
```

El frontend puede usar `handleApiError` para mostrar un modal o toast.

---

## 🧪 Debug

Verificá desde el frontend el `roleId` en `auth/me`, y desde la base de datos qué `PermisoId` tiene ese rol en `rol_permisos`.

---

## 🛠 ¿Qué más podés hacer?

- Exportar permisos al frontend si querés ocultar botones según rol
- Agregar logs o auditoría de accesos denegados

---

> 🧠 Consejo: Usá nombres de recurso y acción simples y consistentes (`pacientes:listar`, `turnos:crear`) para facilitar el mantenimiento.
