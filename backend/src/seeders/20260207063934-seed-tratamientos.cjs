'use strict';

/**
 * MASTER SEED (SIN USUARIOS)
 * - Solo actualiza Roles, Permisos y Tratamientos.
 * - No toca la tabla de usuarios.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("🚀 Iniciando SEED DE PERMISOS Y TRATAMIENTOS (Sin tocar usuarios)...");
    const now = new Date();

    // =========================================================================
    // 1️⃣ ROLES (Solo asegura que existan)
    // =========================================================================
    console.log("🔹 1. Verificando Roles...");
    const rolesData = [
      { id: 1, nombre: 'Administrador', createdAt: now, updatedAt: now },
      { id: 2, nombre: 'Odontólogo',    createdAt: now, updatedAt: now },
      { id: 3, nombre: 'Asistente',     createdAt: now, updatedAt: now },
      { id: 4, nombre: 'Recepcionista', createdAt: now, updatedAt: now },
      { id: 5, nombre: 'Paciente',      createdAt: now, updatedAt: now },
    ];
    await queryInterface.bulkInsert('roles', rolesData, { updateOnDuplicate: ['nombre'] });

    // =========================================================================
    // 2️⃣ PERMISOS (Exactos de tus rutas de Backend)
    // =========================================================================
    console.log("🔹 2. Inyectando Permisos Faltantes...");
    const permisosCodigo = [
        // Agenda y Turnos
        "('turnos', 'ver')", "('turnos', 'listar')", "('turnos', 'crear')", "('turnos', 'editar')",
        "('turnos', 'eliminar')", "('turnos', 'cancelar')", "('turnos', 'marcar_asistencia')",
        "('turnos', 'marcar_ausencia')", "('turnos', 'reprogramar')",
        "('agenda', 'ver')", 
        
        // Extras Agenda
        "('disponibilidad', 'ver')", "('disponibilidad', 'gestionar')",
        "('notas', 'ver')", "('notas', 'crear')", "('notas', 'editar')", "('notas', 'eliminar')",

        // Pacientes
        "('pacientes', 'listar')", "('pacientes', 'crear')", "('pacientes', 'editar')", "('pacientes', 'eliminar')",

        // Clínica
        "('odontograma', 'ver')", "('odontograma', 'editar')",
        "('historia_clinica', 'ver')", "('historia_clinica', 'crear')", "('historia_clinica', 'editar')", "('historia_clinica', 'eliminar')",
        
        // ✅ TRATAMIENTOS (Corregido para requirePermiso)
        "('tratamientos', 'listar')", // Importante para el Select
        "('tratamientos', 'crear')",  // Importante para Admin
        "('tratamientos', 'editar')", // Importante para Admin
        "('tratamientos', 'crearPersonalizado')", 
        "('tratamientos', 'aplicar')",

        // Finanzas y Presupuestos
        "('facturas', 'listar')", "('facturas', 'crear')", "('facturas', 'editar')", "('facturas', 'eliminar')",
        "('presupuestos', 'crear')"
    ];

    await queryInterface.sequelize.query(`
        INSERT IGNORE INTO permisos (recurso, accion) 
        VALUES ${permisosCodigo.join(', ')};
    `);

    // =========================================================================
    // 3️⃣ ASIGNACIÓN (Roles <-> Permisos)
    // =========================================================================
    console.log("🔹 3. Asignando Permisos a Roles...");

    const asignar = async (rolId, recurso, acciones) => {
        const accionesSql = acciones.map(a => `'${a}'`).join(', ');
        await queryInterface.sequelize.query(`
          INSERT IGNORE INTO rol_permisos (RolId, PermisoId)
          SELECT ${rolId}, id FROM permisos 
          WHERE recurso = '${recurso}' AND accion IN (${accionesSql});
        `);
    };

    // --- 🦷 ODONTÓLOGO (Rol 2) ---
    await asignar(2, 'turnos', ['ver', 'listar', 'crear', 'editar', 'marcar_asistencia', 'reprogramar']);
    await asignar(2, 'agenda', ['ver']);
    await asignar(2, 'disponibilidad', ['ver', 'gestionar']);
    await asignar(2, 'notas', ['ver', 'crear', 'editar']);
    await asignar(2, 'pacientes', ['listar', 'crear', 'editar']);
    await asignar(2, 'odontograma', ['ver', 'editar']);
    await asignar(2, 'historia_clinica', ['ver', 'crear', 'editar']);
    // ✅ Agregamos 'listar' para que cargue el select
    await asignar(2, 'tratamientos', ['listar', 'crearPersonalizado', 'aplicar']);
    await asignar(2, 'facturas', ['listar', 'crear']); 
    await asignar(2, 'presupuestos', ['crear']);      

    // --- 👩‍💼 RECEPCIONISTA (Rol 4) ---
    await asignar(4, 'turnos', ['ver', 'listar', 'crear', 'editar', 'eliminar', 'cancelar', 'marcar_asistencia', 'marcar_ausencia', 'reprogramar']);
    await asignar(4, 'agenda', ['ver']);
    await asignar(4, 'disponibilidad', ['ver', 'gestionar']);
    await asignar(4, 'notas', ['ver', 'crear', 'editar', 'eliminar']);
    await asignar(4, 'pacientes', ['listar', 'crear', 'editar']);
    await asignar(4, 'facturas', ['listar', 'crear', 'editar', 'eliminar']); 
    await asignar(4, 'presupuestos', ['crear']);
    // ✅ Agregamos 'listar' para que la recepcionista pueda crear órdenes cobrando tratamientos
    await asignar(4, 'tratamientos', ['listar']);

    // --- ADMIN (Rol 1) ---
    const [allPermisos] = await queryInterface.sequelize.query("SELECT id FROM permisos");
    for (const p of allPermisos) {
        await queryInterface.sequelize.query(`INSERT IGNORE INTO rol_permisos (RolId, PermisoId) VALUES (1, ${p.id})`);
    }

    // =========================================================================
    // 4️⃣ TRATAMIENTOS (VISUAL PRO)
    // =========================================================================
    console.log("🔹 4. Reseteando Tratamientos (Versión Pro)...");
    const CLINIC_BLUE = '#1d4ed8'; const CLINIC_RED = '#dc2626';

    const T = (nombre, descripcion, precio, duracion, config) => ({
      nombre, descripcion, precio, duracionMin: duracion,
      config: config ? JSON.stringify(config) : null,
      createdAt: now, updatedAt: now
    });

    // Limpiamos tratamientos anteriores para evitar duplicados visuales
    await queryInterface.bulkDelete('tratamientos', null, {});
    
    await queryInterface.bulkInsert('tratamientos', [
      T('Consulta', 'Consulta base', 35000, 30, { alcance: 'noRender', modoDibujo: 'none', sigla: 'CONS' }),
      T('RX Periapical', 'Radiografía', 22000, 10, { alcance: 'noRender', modoDibujo: 'none', sigla: 'RX' }),
      T('Obturación 1 cara', 'Resina simple', 95000, 40, { alcance: 'cara', carasPorDefecto: [], modoDibujo: 'fill', colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, sigla: 'OB1' }),
      T('Conducto (Uni)', 'Endodoncia', 250000, 90, { alcance: 'diente', modoDibujo: 'rootLine', colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, sigla: 'TC1' }),
      T('Corona Zirconio', 'Prótesis fija', 890000, 90, { alcance: 'diente', modoDibujo: 'outline', colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, sigla: 'ZIRC' }),
      T('Exodoncia', 'Extracción', 110000, 30, { alcance: 'diente', modoDibujo: 'cross', colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, sigla: 'EXT' }),
      T('Implante', 'Titanio', 1250000, 90, { alcance: 'diente', modoDibujo: 'implant', colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, sigla: 'IMP' })
    ], {});

    console.log("✅ SEEDER COMPLETADO (Usuarios intactos).");
  },

  async down(queryInterface, Sequelize) {
    // No revertir para no borrar datos importantes
  }
};