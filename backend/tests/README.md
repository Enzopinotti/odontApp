# Tests del Módulo Agenda - OdontApp

Este directorio contiene los tests completos para validar el funcionamiento del módulo de agenda según las especificaciones de casos de uso.

## Estructura de Tests

### `agenda.test.js`
Tests generales del módulo agenda que cubren:
- CU-AG01.1: Registrar Asistencia
- CU-AG01.2: Crear Turno
- CU-AG01.3: Reprogramar Turno
- CU-AG01.4: Cancelar Turno
- CU-AG01.5: Ver Agenda
- CU-AG02: Gestionar Disponibilidad
- Validación de Reglas de Negocio

### `casos-uso.test.js`
Tests detallados que validan cada caso de uso con:
- Escenarios principales
- Flujos alternativos
- Casos de excepción
- Validación de reglas de negocio

## Instalación de Dependencias

```bash
npm install
```

## Ejecución de Tests

### Ejecutar todos los tests
```bash
npm test
```

### Ejecutar tests específicos
```bash
# Tests del módulo agenda
npm run test:agenda

# Tests de casos de uso
npm run test:casos-uso
```

### Ejecutar tests en modo watch
```bash
npm run test:watch
```

### Ejecutar tests con cobertura
```bash
npm run test:coverage
```

## Configuración

Los tests utilizan:
- **Jest** como framework de testing
- **Supertest** para testing de APIs
- **SQLite en memoria** para la base de datos de pruebas
- **Variables de entorno** configuradas para testing

## Casos de Uso Validados

### CU-AG01.1: Registrar Asistencia
- ✅ Escenario principal: Marcar asistencia exitosa
- ✅ Flujo alternativo 5a: Llegó tarde pero asistió
- ✅ Flujo alternativo 5b: Cancelación a último momento
- ✅ Regla RN-AG06: Ausencia automática

### CU-AG01.2: Crear Turno
- ✅ Escenario principal: Crear turno exitoso
- ✅ Flujo alternativo 3a: Paciente no registrado
- ✅ Flujo alternativo 6a: Conflicto en horarios
- ✅ Reglas RN-AG01, RN-AG02, RN-AG03

### CU-AG01.3: Reprogramar Turno
- ✅ Escenario principal: Reprogramación exitosa
- ✅ Flujo alternativo 4a: Sin disponibilidad
- ✅ Regla RN-AG05: Máximo 2 reprogramaciones

### CU-AG01.4: Cancelar Turno
- ✅ Escenario principal: Cancelación exitosa
- ✅ Flujo alternativo 4a: Cancelación múltiple

### CU-AG01.5: Ver Agenda
- ✅ Escenario principal: Ver agenda del día
- ✅ Filtros: Por odontólogo, estado, fecha
- ✅ Obtener slots disponibles

### CU-AG02: Gestionar Disponibilidad
- ✅ CU-AG02.1: Crear Disponibilidad
- ✅ CU-AG02.2: Eliminar Disponibilidad
- ✅ CU-AG02.3: Modificar Disponibilidad
- ✅ CU-AG02.4: Ver Disponibilidad
- ✅ CU-AG02.5: Validar Disponibilidad
- ✅ Generar disponibilidades automáticas

## Reglas de Negocio Validadas

- **RN-AG01**: Turnos del mismo odontólogo no pueden solaparse
- **RN-AG02**: Turnos solo en bloques laborales configurados
- **RN-AG03**: Duración mínima 15 minutos
- **RN-AG05**: Máximo 2 reprogramaciones por turno
- **RN-AG06**: Ausencia automática si no hay registro 15 min después
- **RN-AG07**: No eliminar bloques con turnos futuros
- **RN-AG08**: Bloques mínimos de 1 hora
- **RN-AG09**: Días no laborables requieren motivo

## Datos de Prueba

Los tests crean automáticamente:
- Usuario recepcionista
- Usuario odontólogo
- Paciente de prueba
- Disponibilidades de prueba
- Turnos de prueba

## Configuración de Base de Datos

Los tests utilizan SQLite en memoria para:
- Ejecución rápida
- Aislamiento entre tests
- No afectar la base de datos de desarrollo

## Cobertura de Tests

Los tests cubren:
- ✅ Todos los endpoints de la API
- ✅ Validaciones de entrada
- ✅ Reglas de negocio
- ✅ Casos de error
- ✅ Flujos alternativos
- ✅ Relaciones entre entidades

## Ejecución en CI/CD

Para integrar en pipelines de CI/CD:

```bash
# Instalar dependencias
npm ci

# Ejecutar tests
npm test

# Generar reporte de cobertura
npm run test:coverage
```

## Troubleshooting

### Error de conexión a base de datos
- Verificar que las variables de entorno estén configuradas
- Asegurar que SQLite esté disponible

### Tests fallando por timeout
- Aumentar el timeout en `jest.config.js`
- Verificar que la base de datos se sincronice correctamente

### Errores de autenticación
- Verificar que el JWT_SECRET esté configurado
- Asegurar que los usuarios de prueba se creen correctamente


