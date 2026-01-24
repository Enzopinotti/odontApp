# Módulo de Agenda de Turnos

Este módulo implementa la funcionalidad completa de gestión de turnos para la aplicación odontológica, siguiendo los casos de uso definidos en CU-AG01.x y CU-AG02.x.

## Estructura del Módulo

```
Agenda/
├── models/
│   ├── enums.js              # Enumeraciones EstadoTurno y TipoDisponibilidad
│   ├── turno.js              # Modelo de Turno
│   ├── disponibilidad.js     # Modelo de Disponibilidad
│   ├── nota.js               # Modelo de Nota
│   ├── associations.js       # Asociaciones entre modelos
│   └── index.js              # Exportación de modelos
├── controllers/
│   ├── turnoController.js    # Controlador de turnos
│   ├── disponibilidadController.js # Controlador de disponibilidades
│   └── notaController.js     # Controlador de notas
├── services/
│   ├── turnoService.js       # Lógica de negocio de turnos
│   ├── disponibilidadService.js # Lógica de negocio de disponibilidades
│   └── notaService.js        # Lógica de negocio de notas
├── repositories/
│   ├── turnoRepository.js    # Acceso a datos de turnos
│   ├── disponibilidadRepository.js # Acceso a datos de disponibilidades
│   └── notaRepository.js     # Acceso a datos de notas
├── routes/
│   ├── turnoRoutes.js        # Rutas de turnos
│   ├── disponibilidadRoutes.js # Rutas de disponibilidades
│   ├── notaRoutes.js         # Rutas de notas
│   └── index.js              # Rutas principales del módulo
└── validators/
    ├── turnoValidators.js    # Validadores de turnos
    ├── disponibilidadValidators.js # Validadores de disponibilidades
    └── notaValidators.js     # Validadores de notas
```

## Endpoints Disponibles

### Turnos (`/api/agenda/turnos`)

- `GET /` - Obtener lista de turnos con filtros
- `POST /` - Crear nuevo turno
- `GET /:id` - Obtener turno por ID
- `PUT /:id` - Actualizar turno
- `DELETE /:id` - Eliminar turno
- `POST /:id/cancelar` - Cancelar turno
- `POST /:id/marcar-asistencia` - Marcar asistencia
- `POST /:id/marcar-ausencia` - Marcar ausencia
- `PUT /:id/reprogramar` - Reprogramar turno
- `GET /agenda/:fecha` - Obtener agenda por fecha
- `GET /slots-disponibles` - Obtener slots disponibles

### Disponibilidades (`/api/agenda/disponibilidades`)

- `GET /` - Obtener lista de disponibilidades
- `POST /` - Crear nueva disponibilidad
- `GET /:id` - Obtener disponibilidad por ID
- `PUT /:id` - Actualizar disponibilidad
- `DELETE /:id` - Eliminar disponibilidad
- `GET /odontologo/:odontologoId` - Obtener disponibilidades por odontólogo
- `POST /generar-automaticas` - Generar disponibilidades automáticas
- `POST /validar` - Validar disponibilidad

### Notas (`/api/agenda/notas`)

- `GET /` - Obtener lista de notas
- `POST /` - Crear nueva nota
- `GET /:id` - Obtener nota por ID
- `PUT /:id` - Actualizar nota
- `DELETE /:id` - Eliminar nota
- `GET /turno/:turnoId` - Obtener notas por turno
- `GET /recientes` - Obtener notas recientes

## Reglas de Negocio Implementadas

### RN-AG01: Turnos del mismo odontólogo no pueden solaparse
- Validación automática al crear/actualizar turnos
- Verificación de conflictos de horarios

### RN-AG02: Turnos solo en bloques laborales configurados
- Validación contra disponibilidades del odontólogo
- Verificación de horarios laborales

### RN-AG03: Duración mínima: 15 minutos
- Validación en modelo y validadores
- Rango permitido: 15-120 minutos

### RN-AG06: Ausencia automática si no hay registro 15 min después de hora fin
- Implementado en repositorio (método `marcarAusenciaAutomatica`)
- Se puede ejecutar como tarea programada

### RN-AG07: No eliminar bloques con turnos futuros
- Validación en servicio de disponibilidades
- Verificación de turnos pendientes

### RN-AG08: Bloques mínimos: 1 hora
- Validación en modelo y servicio
- Aplicado a disponibilidades

### RN-AG09: Días no laborables requieren motivo
- Validación en modelo y validadores
- Campo obligatorio para tipo NOLABORAL

## Estados de Turno

- `PENDIENTE`: Turno programado, esperando confirmación
- `ASISTIO`: Paciente asistió al turno
- `AUSENTE`: Paciente no asistió al turno
- `CANCELADO`: Turno cancelado

## Tipos de Disponibilidad

- `LABORAL`: Bloque de tiempo disponible para atención
- `NOLABORAL`: Bloque de tiempo no disponible (vacaciones, etc.)

## Permisos Requeridos

El módulo requiere los siguientes permisos:

- `ver_turnos` - Ver turnos
- `crear_turno` - Crear turnos
- `editar_turno` - Editar turnos
- `eliminar_turno` - Eliminar turnos
- `cancelar_turno` - Cancelar turnos
- `marcar_asistencia` - Marcar asistencia
- `marcar_ausencia` - Marcar ausencia
- `reprogramar_turno` - Reprogramar turnos
- `ver_agenda` - Ver agenda
- `ver_disponibilidad` - Ver disponibilidades
- `gestionar_disponibilidad` - Gestionar disponibilidades
- `ver_notas` - Ver notas
- `crear_nota` - Crear notas
- `editar_nota` - Editar notas
- `eliminar_nota` - Eliminar notas

## Migraciones

Para crear las tablas en la base de datos, ejecutar:

```bash
cd backend
npx sequelize-cli db:migrate
```

Las migraciones incluyen:
- `20250908003347-create-turnos.js`
- `20250908003354-create-disponibilidades.js`
- `20250908003357-create-notas.js`

## Ejemplos de Uso

### Crear un turno
```javascript
POST /api/agenda/turnos
{
  "fechaHora": "2025-01-15T10:00:00Z",
  "duracion": 30,
  "motivo": "Consulta general",
  "pacienteId": 1,
  "odontologoId": 2
}
```

### Marcar asistencia
```javascript
POST /api/agenda/turnos/1/marcar-asistencia
{
  "nota": "Paciente llegó 5 minutos tarde"
}
```

### Crear disponibilidad
```javascript
POST /api/agenda/disponibilidades
{
  "fecha": "2025-01-15",
  "horaInicio": "09:00",
  "horaFin": "17:00",
  "tipo": "LABORAL",
  "odontologoId": 2
}
```

## Próximos Pasos

1. **Frontend**: Crear componentes React para la interfaz de usuario
2. **Calendario**: Integrar API de calendario para visualización
3. **Notificaciones**: Implementar sistema de notificaciones
4. **Reportes**: Crear reportes de asistencia y ocupación
5. **Tareas programadas**: Implementar ausencia automática
