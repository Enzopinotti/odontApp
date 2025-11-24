// Test funcional del módulo agenda
describe('Módulo Agenda - Tests Funcionales', () => {
  
  describe('Enumeraciones', () => {
    test('debe importar EstadoTurno correctamente', async () => {
      const { EstadoTurno } = await import('../src/modules/Agenda/models/enums.js');
      
      expect(EstadoTurno.PENDIENTE).toBe('PENDIENTE');
      expect(EstadoTurno.ASISTIO).toBe('ASISTIO');
      expect(EstadoTurno.AUSENTE).toBe('AUSENTE');
      expect(EstadoTurno.CANCELADO).toBe('CANCELADO');
    });

    test('debe importar TipoDisponibilidad correctamente', async () => {
      const { TipoDisponibilidad } = await import('../src/modules/Agenda/models/enums.js');
      
      expect(TipoDisponibilidad.LABORAL).toBe('LABORAL');
      expect(TipoDisponibilidad.NOLABORAL).toBe('NOLABORAL');
    });

    test('debe validar estados correctamente', async () => {
      const { esEstadoValido } = await import('../src/modules/Agenda/models/enums.js');
      
      expect(esEstadoValido('PENDIENTE')).toBe(true);
      expect(esEstadoValido('ASISTIO')).toBe(true);
      expect(esEstadoValido('AUSENTE')).toBe(true);
      expect(esEstadoValido('CANCELADO')).toBe(true);
      expect(esEstadoValido('INVALIDO')).toBe(false);
    });

    test('debe validar tipos de disponibilidad correctamente', async () => {
      const { esTipoDisponibilidadValido } = await import('../src/modules/Agenda/models/enums.js');
      
      expect(esTipoDisponibilidadValido('LABORAL')).toBe(true);
      expect(esTipoDisponibilidadValido('NOLABORAL')).toBe(true);
      expect(esTipoDisponibilidadValido('INVALIDO')).toBe(false);
    });
  });

  describe('Servicios', () => {
    test('debe importar turnoService correctamente', async () => {
      const turnoService = await import('../src/modules/Agenda/services/turnoService.js');
      
      expect(typeof turnoService.buscarConFiltros).toBe('function');
      expect(typeof turnoService.obtenerTurnoPorId).toBe('function');
      expect(typeof turnoService.crearTurno).toBe('function');
      expect(typeof turnoService.cancelarTurno).toBe('function');
      expect(typeof turnoService.marcarAsistencia).toBe('function');
      expect(typeof turnoService.marcarAusencia).toBe('function');
      expect(typeof turnoService.reprogramarTurno).toBe('function');
    });

    test('debe importar disponibilidadService correctamente', async () => {
      const disponibilidadService = await import('../src/modules/Agenda/services/disponibilidadService.js');
      
      expect(typeof disponibilidadService.buscarConFiltros).toBe('function');
      expect(typeof disponibilidadService.obtenerDisponibilidadPorId).toBe('function');
      expect(typeof disponibilidadService.crearDisponibilidad).toBe('function');
      expect(typeof disponibilidadService.eliminarDisponibilidad).toBe('function');
      expect(typeof disponibilidadService.validarDisponibilidad).toBe('function');
    });

    test('debe importar notaService correctamente', async () => {
      const notaService = await import('../src/modules/Agenda/services/notaService.js');
      
      expect(typeof notaService.buscarConFiltros).toBe('function');
      expect(typeof notaService.obtenerNotaPorId).toBe('function');
      expect(typeof notaService.crearNota).toBe('function');
    });
  });

  describe('Controladores', () => {
    test('debe importar turnoController correctamente', async () => {
      const turnoController = await import('../src/modules/Agenda/controllers/turnoController.js');
      
      expect(typeof turnoController.obtenerTurnos).toBe('function');
      expect(typeof turnoController.crearTurno).toBe('function');
      expect(typeof turnoController.obtenerTurnoPorId).toBe('function');
      expect(typeof turnoController.cancelarTurno).toBe('function');
      expect(typeof turnoController.marcarAsistencia).toBe('function');
      expect(typeof turnoController.marcarAusencia).toBe('function');
      expect(typeof turnoController.reprogramarTurno).toBe('function');
      expect(typeof turnoController.obtenerAgendaPorFecha).toBe('function');
      expect(typeof turnoController.obtenerSlotsDisponibles).toBe('function');
    });

    test('debe importar disponibilidadController correctamente', async () => {
      const disponibilidadController = await import('../src/modules/Agenda/controllers/disponibilidadController.js');
      
      expect(typeof disponibilidadController.obtenerDisponibilidades).toBe('function');
      expect(typeof disponibilidadController.crearDisponibilidad).toBe('function');
      expect(typeof disponibilidadController.obtenerDisponibilidadPorId).toBe('function');
      expect(typeof disponibilidadController.eliminarDisponibilidad).toBe('function');
      expect(typeof disponibilidadController.validarDisponibilidad).toBe('function');
    });
  });

  describe('Repositorios', () => {
    test('debe importar turnoRepository correctamente', async () => {
      const turnoRepository = await import('../src/modules/Agenda/repositories/turnoRepository.js');
      
      expect(typeof turnoRepository.findPaginated).toBe('function');
      expect(typeof turnoRepository.findById).toBe('function');
      expect(typeof turnoRepository.create).toBe('function');
      expect(typeof turnoRepository.update).toBe('function');
      expect(typeof turnoRepository.remove).toBe('function');
      expect(typeof turnoRepository.verificarSolapamiento).toBe('function');
      expect(typeof turnoRepository.obtenerTurnosPorFecha).toBe('function');
    });

    test('debe importar disponibilidadRepository correctamente', async () => {
      const disponibilidadRepository = await import('../src/modules/Agenda/repositories/disponibilidadRepository.js');
      
      expect(typeof disponibilidadRepository.findPaginated).toBe('function');
      expect(typeof disponibilidadRepository.findById).toBe('function');
      expect(typeof disponibilidadRepository.create).toBe('function');
      expect(typeof disponibilidadRepository.update).toBe('function');
      expect(typeof disponibilidadRepository.remove).toBe('function');
      expect(typeof disponibilidadRepository.verificarSolapamiento).toBe('function');
      expect(typeof disponibilidadRepository.validarDisponibilidad).toBe('function');
    });
  });

  describe('Validación de Casos de Uso', () => {
    test('CU-AG01.1: Registrar Asistencia - Funciones disponibles', async () => {
      const turnoService = await import('../src/modules/Agenda/services/turnoService.js');
      
      // Verificar que existen las funciones para registrar asistencia
      expect(typeof turnoService.marcarAsistencia).toBe('function');
      expect(typeof turnoService.marcarAusencia).toBe('function');
    });

    test('CU-AG01.2: Crear Turno - Funciones disponibles', async () => {
      const turnoService = await import('../src/modules/Agenda/services/turnoService.js');
      
      // Verificar que existen las funciones para crear turno
      expect(typeof turnoService.crearTurno).toBe('function');
      expect(typeof turnoService.obtenerSlotsDisponibles).toBe('function');
    });

    test('CU-AG01.3: Reprogramar Turno - Funciones disponibles', async () => {
      const turnoService = await import('../src/modules/Agenda/services/turnoService.js');
      
      // Verificar que existe la función para reprogramar turno
      expect(typeof turnoService.reprogramarTurno).toBe('function');
    });

    test('CU-AG01.4: Cancelar Turno - Funciones disponibles', async () => {
      const turnoService = await import('../src/modules/Agenda/services/turnoService.js');
      
      // Verificar que existe la función para cancelar turno
      expect(typeof turnoService.cancelarTurno).toBe('function');
    });

    test('CU-AG01.5: Ver Agenda - Funciones disponibles', async () => {
      const turnoService = await import('../src/modules/Agenda/services/turnoService.js');
      
      // Verificar que existen las funciones para ver agenda
      expect(typeof turnoService.obtenerAgendaPorFecha).toBe('function');
      expect(typeof turnoService.buscarConFiltros).toBe('function');
    });

    test('CU-AG02: Gestionar Disponibilidad - Funciones disponibles', async () => {
      const disponibilidadService = await import('../src/modules/Agenda/services/disponibilidadService.js');
      
      // Verificar que existen todas las funciones CRUD
      expect(typeof disponibilidadService.crearDisponibilidad).toBe('function');
      expect(typeof disponibilidadService.obtenerDisponibilidadPorId).toBe('function');
      expect(typeof disponibilidadService.actualizarDisponibilidad).toBe('function');
      expect(typeof disponibilidadService.eliminarDisponibilidad).toBe('function');
      expect(typeof disponibilidadService.validarDisponibilidad).toBe('function');
    });
  });

  describe('Validación de Reglas de Negocio', () => {
    test('RN-AG01: Estados de turno definidos correctamente', async () => {
      const { EstadoTurno } = await import('../src/modules/Agenda/models/enums.js');
      
      const estados = Object.values(EstadoTurno);
      expect(estados).toContain('PENDIENTE');
      expect(estados).toContain('ASISTIO');
      expect(estados).toContain('AUSENTE');
      expect(estados).toContain('CANCELADO');
      expect(estados.length).toBe(4);
    });

    test('RN-AG02: Tipos de disponibilidad definidos correctamente', async () => {
      const { TipoDisponibilidad } = await import('../src/modules/Agenda/models/enums.js');
      
      const tipos = Object.values(TipoDisponibilidad);
      expect(tipos).toContain('LABORAL');
      expect(tipos).toContain('NOLABORAL');
      expect(tipos.length).toBe(2);
    });
  });
});


