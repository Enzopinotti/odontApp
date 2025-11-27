# 🔐 Permisos y Vistas por Rol - Módulo Agenda

## 📋 Resumen Ejecutivo

### Recepcionista
- ✅ **Puede ver TODO**: Agenda completa de todos los odontólogos
- ✅ **Puede manipular TODO**: Crear, editar, reprogramar, cancelar turnos
- ✅ **Puede gestionar disponibilidades**: Crear, editar, eliminar bloques de disponibilidad
- ✅ **Acceso completo** a todas las funcionalidades del módulo

### Odontólogo
- ✅ **Solo puede VER su propia agenda**: Filtrado automático por odontólogo autenticado
- ❌ **NO puede crear turnos**: Botón "Nuevo turno" oculto
- ❌ **NO puede editar turnos**: Botón "Editar" oculto en modal de detalles
- ❌ **NO puede reprogramar turnos**: Botón "Reprogramar" oculto
- ❌ **NO puede cancelar turnos**: Botón "Cancelar" oculto
- ❌ **NO puede gestionar disponibilidades**: Acceso bloqueado
- ✅ **Puede ver detalles**: Modal de detalles con información completa
- ✅ **Puede ver indicadores**: Amarillo (próximos 30 min), Rojo (retraso)
- ✅ **Puede ver historial y documentos**: Enlaces a historia clínica y odontograma

---

## 🔍 Detalle por Funcionalidad

### 1. Vista de Agenda del Día (`/agenda/diaria`)

#### Recepcionista
- ✅ Ver agenda de **todos los odontólogos** (columnas múltiples)
- ✅ Ver agenda de **cualquier fecha** (pasado, presente, futuro)
- ✅ Filtros completos: Estado, Paciente, Odontólogo, Tratamiento
- ✅ Vista diaria y semanal
- ✅ Métricas de ocupación
- ✅ Click en slot libre → Crear turno
- ✅ Click en turno → Ver/Editar/Reprogramar/Cancelar

#### Odontólogo
- ✅ Ver agenda **solo propia** (una sola columna)
- ✅ Ver agenda de **cualquier fecha** (pasado, presente, futuro)
- ✅ Filtros limitados: Estado, Paciente, Tratamiento (sin filtro de odontólogo)
- ✅ Vista diaria y semanal
- ❌ **NO ve métricas** de ocupación
- ❌ **NO puede crear turnos** desde slots libres
- ✅ Click en turno → Solo ver detalles (sin acciones de edición)

---

### 2. Página Principal de Agenda (`/agenda`)

#### Recepcionista
- ✅ Ver todas las acciones rápidas:
  - Agenda del Día
  - **Nuevo turno** ✅
  - Gestionar disponibilidades ✅
  - Pasar a consulta
  - Atender siguiente
  - Buscar turno ✅
- ✅ Ver métricas: Pendientes, Tiempo de espera, Pacientes en espera
- ✅ Ver lista de pacientes

#### Odontólogo
- ✅ Ver acciones limitadas:
  - Agenda del Día ✅
  - **NO "Nuevo turno"** ❌
  - **NO "Gestionar disponibilidades"** ❌
  - Pasar a consulta ✅
  - Atender siguiente ✅
  - Buscar turno ✅ (solo ve sus turnos)
- ✅ Ver métricas: Pendientes, Tiempo de espera, Pacientes en espera
- ✅ Ver lista de pacientes (solo de sus turnos)

---

### 3. Modal de Detalles del Turno

#### Recepcionista
- ✅ Ver toda la información del turno
- ✅ Botones disponibles:
  - **Marcar Asistencia** ✅
  - **Marcar Ausencia** ✅
  - **Reprogramar** ✅
  - **Editar** ✅
  - **Cancelar** ✅
- ✅ Ver historial completo
- ✅ Ver documentos (Historia Clínica, Odontograma)
- ✅ Agregar notas de la visita

#### Odontólogo
- ✅ Ver toda la información del turno
- ❌ **NO puede Marcar Asistencia** (solo recepcionista)
- ❌ **NO puede Marcar Ausencia** (solo recepcionista)
- ❌ **NO puede Reprogramar** ❌
- ❌ **NO puede Editar** ❌
- ❌ **NO puede Cancelar** ❌
- ✅ Ver historial completo
- ✅ Ver documentos (Historia Clínica, Odontograma)
- ✅ Agregar notas de la visita (solo lectura o limitado)

---

### 4. Crear Turno (`/agenda/turnos/nuevo`)

#### Recepcionista
- ✅ Acceso completo al flujo de creación
- ✅ Paso 1: Seleccionar paciente (crear rápido disponible)
- ✅ Paso 2: Seleccionar fecha/hora y odontólogo
- ✅ Paso 3: Confirmar y crear turno

#### Odontólogo
- ❌ **Acceso bloqueado**: Ruta protegida, redirige o muestra error
- ❌ **NO puede crear turnos**

---

### 5. Gestionar Disponibilidades (`/agenda/disponibilidades`)

#### Recepcionista
- ✅ Acceso completo
- ✅ Crear bloques laborales
- ✅ Crear bloques no laborales
- ✅ Editar disponibilidades
- ✅ Eliminar disponibilidades
- ✅ Vista diaria, semanal, mensual

#### Odontólogo
- ❌ **Acceso bloqueado**: Ruta protegida, redirige o muestra error
- ❌ **NO puede gestionar disponibilidades**

---

### 6. Buscar Turnos (Modal)

#### Recepcionista
- ✅ Buscar en **todos los turnos** del sistema
- ✅ Filtros completos: Odontólogo, Fechas, Estado, Tratamiento, Paciente
- ✅ Ver resultados de cualquier odontólogo

#### Odontólogo
- ✅ Buscar en **solo sus turnos** (filtrado automático)
- ✅ Filtros limitados: Fechas, Estado, Tratamiento, Paciente (sin filtro de odontólogo)
- ❌ **NO puede ver turnos de otros odontólogos**

---

### 7. Cancelación Múltiple

#### Recepcionista
- ✅ Modo selección múltiple disponible
- ✅ Seleccionar múltiples turnos
- ✅ Cancelar múltiples turnos con motivo único

#### Odontólogo
- ❌ **NO disponible**: Botón de selección múltiple oculto
- ❌ **NO puede cancelar turnos**

---

## 🔒 Implementación Backend

### Restricciones Automáticas

1. **Filtrado por Odontólogo** (CU-AG01.5):
   - Endpoint: `GET /api/agenda/turnos`
   - Endpoint: `GET /api/agenda/turnos/agenda/:fecha`
   - Si `req.user.roleId === 2` (Odontólogo):
     - Filtra automáticamente por `odontologoId` del usuario autenticado
     - No puede ver turnos de otros odontólogos

2. **Permisos por Acción**:
   - `turnos:crear` → Solo Recepcionista
   - `turnos:editar` → Solo Recepcionista
   - `turnos:reprogramar` → Solo Recepcionista
   - `turnos:cancelar` → Solo Recepcionista
   - `turnos:marcar_asistencia` → Solo Recepcionista
   - `turnos:marcar_ausencia` → Solo Recepcionista
   - `turnos:ver` → Recepcionista y Odontólogo (con filtrado)
   - `disponibilidad:gestionar` → Solo Recepcionista
   - `disponibilidad:ver` → Solo Recepcionista

---

## 🎨 Implementación Frontend

### Verificación de Rol

```javascript
const esOdontologo = useMemo(() => {
  return user?.rol?.id === 2 || user?.RolId === 2 || user?.rol?.nombre === 'Odontólogo';
}, [user]);
```

### Elementos a Ocultar para Odontólogos

1. **Botón "Nuevo turno"** en `/agenda`
2. **Botón "Gestionar disponibilidades"** en `/agenda`
3. **Botones de acción en modal de detalles**:
   - Reprogramar
   - Editar
   - Cancelar
4. **Modo selección múltiple** en agenda del día
5. **Métricas de ocupación** (solo recepcionista)
6. **Filtro de odontólogos** (solo recepcionista)
7. **Click en slots libres** para crear turno

### Elementos Visibles para Odontólogos

1. ✅ Agenda del día (solo propia)
2. ✅ Vista semanal (solo propia)
3. ✅ Filtros: Estado, Paciente, Tratamiento
4. ✅ Indicadores: Amarillo (próximos 30 min), Rojo (retraso)
5. ✅ Modal de detalles (solo lectura)
6. ✅ Historial y documentos
7. ✅ Buscar turnos (solo propios)

---

## 📝 Checklist de Implementación

### Backend ✅
- [x] Filtrado automático por odontólogo en `obtenerTurnos`
- [x] Filtrado automático por odontólogo en `obtenerAgendaPorFecha`
- [x] Permisos configurados en rutas
- [x] Validación de permisos en middlewares

### Frontend ✅ (Completado)
- [x] Detección de rol odontólogo
- [x] Filtrado automático de odontólogos mostrados
- [x] Ocultar botón "Nuevo turno" para odontólogos ✅
- [x] Ocultar botón "Gestionar disponibilidades" para odontólogos ✅
- [x] Ocultar botones de acción en modal de detalles para odontólogos ✅
- [x] Ocultar modo selección múltiple para odontólogos ✅
- [x] Bloquear click en slots libres para odontólogos ✅
- [x] Bloquear acceso a rutas de creación/edición ✅
  - [x] Protección en `NuevoTurnoPaso1.js`
  - [x] Protección en `GestionDisponibilidades.js`

---

## 🚀 Próximos Pasos

1. **Ocultar botones/acciones** en frontend según rol
2. **Proteger rutas** en frontend (redirección si odontólogo intenta acceder)
3. **Validar permisos** en componentes antes de mostrar acciones
4. **Testing** con usuarios de ambos roles

