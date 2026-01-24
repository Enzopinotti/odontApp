'use strict';

/**
 * Catálogo base de tratamientos (adultos) - VERSIÓN SUPER PRO
 * - config guía el dibujo en el odontograma y la UX:
 *    - alcance: 'cara' | 'diente' | 'multi' | 'cuadrante' | 'arcada' | 'boca' | 'noRender'
 *    - carasPorDefecto: ['O','M','D','B','L']
 *    - colorRealizado / colorPlanificado: Colores clínicos estándar
 *    - trazoSugerido: 'Continuo' | 'Punteado'
 *    - modoDibujo: 'fill' | 'outline' | 'cross' | 'rootLine' | 'implant' | 'fractureLine' | 'connector' | 'none'
 */

const now = new Date();

const T = (nombre, descripcion, precioARS, duracionMin, config) => ({
  nombre,
  descripcion,
  precio: precioARS,
  duracionMin,
  config: config ? JSON.stringify(config) : null,
  createdAt: now,
  updatedAt: now,
});

// Paleta clínica premium
const CLINIC_BLUE = '#1d4ed8'; // Realizado sólido
const CLINIC_RED = '#dc2626'; // Patología / A realizar
const CLINIC_GOLD = '#d97706'; // Preventivo / Sellador
const CLINIC_GREY = '#4b5563'; // Antiguos/Provisorios

module.exports = {
  async up(queryInterface, Sequelize) {
    // Primero limpiamos los anteriores para evitar duplicados si se corre de nuevo
    await queryInterface.bulkDelete('tratamientos', null, {});

    await queryInterface.bulkInsert('tratamientos', [
      // === Diagnóstico / Imagen ===
      T('Consulta y Diagnóstico', 'Evaluación clínica completa y planificación inicial', 35000, 30, {
        alcance: 'noRender', modoDibujo: 'none', sigla: 'CONS', planificable: false
      }),
      T('Radiografía Periapical Digital', 'Imagen intraoral de alta definición', 22000, 10, {
        alcance: 'noRender', modoDibujo: 'none', sigla: 'RX', planificable: false
      }),

      // === Operatoria (Resinas) - ESTILO LÍNEAS PROFESIONALES ===
      T('Caries / Obturación (1 cara)', 'Restauración con resina microhíbrida de alta estética', 95000, 40, {
        alcance: 'cara', carasPorDefecto: [], modoDibujo: 'fill',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'OB1'
      }),
      T('Caries / Obturación (2 caras)', 'Restauración compleja (MO/DO)', 135000, 60, {
        alcance: 'cara', carasPorDefecto: ['O'], modoDibujo: 'fill',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'OB2'
      }),
      T('Caries / Obturación (3 caras)', 'Reconstrucción MOD con técnica estratificada', 175000, 75, {
        alcance: 'cara', carasPorDefecto: ['M', 'O', 'D'], modoDibujo: 'fill',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'OB3'
      }),
      T('Sellador de Fosas y Fisuras', 'Prevención con sellantes fotopolimerizables', 35000, 20, {
        alcance: 'cara', carasPorDefecto: ['O'], modoDibujo: 'fill',
        colorRealizado: CLINIC_GOLD, colorPlanificado: CLINIC_GOLD, trazoSugerido: 'Continuo',
        sigla: 'SE'
      }),

      // === Endodoncia ===
      T('Tratamiento de Conducto (Uni)', 'Endodoncia en piezas de 1 conducto', 250000, 90, {
        alcance: 'diente', modoDibujo: 'rootLine',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'TC1'
      }),
      T('Tratamiento de Conducto (Multi)', 'Endodoncia en molares (3+ conductos)', 410000, 130, {
        alcance: 'diente', modoDibujo: 'rootLine',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'TC3'
      }),

      // === Rehabilitación / Prótesis Fija ===
      T('Corona de Zirconio Pura', 'Prótesis fija CAD-CAM libre de metal', 890000, 90, {
        alcance: 'diente', modoDibujo: 'outline',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'ZIRC'
      }),
      T('Perno y Reconstrucción', 'Poste de fibra de vidrio y núcleo de resina', 160000, 60, {
        alcance: 'diente', modoDibujo: 'rootLine',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'PYR'
      }),
      T('Puente Fijo (tramo)', 'Unidad de puente cerámico', 600000, 90, {
        alcance: 'multi', aplicaMultiplesPiezas: true, modoDibujo: 'connector',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'PT'
      }),

      // === Implantes ===
      T('Implante Dental (Fase 1)', 'Colocación quirúrgica de fixture de titanio', 1250000, 90, {
        alcance: 'diente', modoDibujo: 'implant',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'IMP'
      }),

      // === Cirugía ===
      T('Exodoncia Simple', 'Extracción dental atraumática', 110000, 30, {
        alcance: 'diente', modoDibujo: 'cross',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'EXT'
      }),
      T('Exodoncia Quirúrgica / Tercer Molar', 'Extracción compleja de tercer molar', 280000, 60, {
        alcance: 'diente', modoDibujo: 'cross',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'EXTQ'
      }),

      // === Rehabilitación / Estética ===
      T('Carilla E-Max', 'Lámina de porcelana inyectada de alta estética', 750000, 90, {
        alcance: 'diente', modoDibujo: 'outline',
        colorRealizado: CLINIC_BLUE, colorPlanificado: CLINIC_RED, trazoSugerido: 'Continuo',
        sigla: 'VEN'
      }),
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tratamientos', null, {});
  },
};
