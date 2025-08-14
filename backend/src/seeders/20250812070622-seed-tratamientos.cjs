'use strict';

/**
 * Catálogo base de tratamientos (adultos)
 * - Precios en ARS con dólar de referencia 1300 ARS/USD
 * - `config` guía el dibujo en el odontograma y la UX:
 *    - alcance: 'cara' | 'diente' | 'multi' | 'cuadrante' | 'arcada' | 'boca' | 'noRender'
 *    - carasPorDefecto: ['O','M','D','B','L'] (si aplica)
 *    - colorRealizado / colorPlanificado: Hex
 *    - trazoSugerido: 'Continuo' | 'Punteado'
 *    - modoDibujo: 'fill' | 'outline' | 'cross' | 'rootLine' | 'implant' | 'fractureLine' | 'connector' | 'none'
 *    - sigla: abreviatura clínica (ej: TC, CR, IMP, SE)
 *    - planificable: bool (si permite estado planificado)
 *    - aplicaMultiplesPiezas: bool (puente, ferulización)
 *    - precioUSD (referencia), para auditorías futuras
 */

const now = new Date();

// 👇 clave: para bulkInsert en MySQL/MariaDB serializamos el JSON
const T = (nombre, descripcion, precioARS, duracionMin, config) => ({
  nombre,
  descripcion,
  precio: precioARS,
  duracionMin,
  config: config ? JSON.stringify(config) : null,
  createdAt: now,
  updatedAt: now,
});

// Paleta estandarizada (convención clínica)
const BLUE = '#2563eb';   // realizado/instalado
const RED  = '#ef4444';   // patología/pendiente
const YEL  = '#f59e0b';   // preventivo
const GRN  = '#22c55e';   // temporal/en observación

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tratamientos', [
      // === Diagnóstico / Imagen ===
      T('Consulta y diagnóstico', 'Evaluación clínica y planificación', 26000, 20, {
        alcance: 'noRender', modoDibujo: 'none', sigla: 'CONS', planificable: false, precioUSD: 20
      }),
      T('Radiografía periapical', 'Rx intraoral por pieza', 19500, 10, {
        alcance: 'noRender', modoDibujo: 'none', sigla: 'RX', planificable: false, precioUSD: 15
      }),
      T('Radiografía panorámica (OPG)', 'Ortopantomografía', 78000, 10, {
        alcance: 'noRender', modoDibujo: 'none', sigla: 'OPG', planificable: false, precioUSD: 60
      }),

      // === Preventivo ===
      T('Limpieza (profilaxis)', 'Profilaxis con ultrasonido y pulido', 52000, 30, {
        alcance: 'arcada', modoDibujo: 'none', sigla: 'PRO', colorRealizado: BLUE, planificable: true, precioUSD: 40
      }),
      T('Fluoración tópica', 'Aplicación de flúor', 32500, 15, {
        alcance: 'arcada', modoDibujo: 'none', sigla: 'FLR', colorRealizado: YEL, planificable: true, precioUSD: 25
      }),
      T('Sellante de fosas y fisuras (por pieza)', 'Sellado preventivo en cara oclusal', 32500, 20, {
        alcance: 'cara', carasPorDefecto: ['O'], modoDibujo: 'fill',
        colorRealizado: YEL, colorPlanificado: YEL, trazoSugerido: 'Continuo',
        sigla: 'SE', planificable: true, precioUSD: 25
      }),

      // === Operatoria (Resinas) ===
      T('Obturación resina 1 cara', 'Restauración en una superficie', 91000, 40, {
        alcance: 'cara', carasPorDefecto: [], modoDibujo: 'fill',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'R1', planificable: true, precioUSD: 70
      }),
      T('Obturación resina 2 caras (MO/DO)', 'Restauración en dos superficies', 130000, 60, {
        alcance: 'cara', carasPorDefecto: ['M','O'], modoDibujo: 'fill',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'R2', planificable: true, precioUSD: 100
      }),
      T('Obturación resina 3 caras (MOD)', 'Restauración en tres superficies', 169000, 75, {
        alcance: 'cara', carasPorDefecto: ['M','O','D'], modoDibujo: 'fill',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'R3', planificable: true, precioUSD: 130
      }),
      T('Tratamiento de fractura coronal con resina', 'Reconstrucción estética por fractura', 156000, 60, {
        alcance: 'cara', carasPorDefecto: [], modoDibujo: 'fractureLine',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'FR', planificable: true, precioUSD: 120
      }),
      T('Incrustación / inlay / onlay', 'Restauración indirecta parcial', 455000, 90, {
        alcance: 'cara', carasPorDefecto: ['O'], modoDibujo: 'fill',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'IN', planificable: true, precioUSD: 350
      }),

      // === Endodoncia ===
      T('Endodoncia unirradicular (incisivo/canino)', 'Tratamiento de conducto pieza unirradicular', 234000, 90, {
        alcance: 'diente', modoDibujo: 'rootLine',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'TC-1', planificable: true, precioUSD: 180
      }),
      T('Endodoncia birradicular (premolar)', 'Tratamiento de conducto pieza birradicular', 299000, 110, {
        alcance: 'diente', modoDibujo: 'rootLine',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'TC-2', planificable: true, precioUSD: 230
      }),
      T('Endodoncia multirradicular (molar)', 'Tratamiento de conducto pieza multirradicular', 390000, 130, {
        alcance: 'diente', modoDibujo: 'rootLine',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'TC-3', planificable: true, precioUSD: 300
      }),
      T('Retratamiento endodóntico', 'Retratamiento de conductos', 364000, 130, {
        alcance: 'diente', modoDibujo: 'rootLine',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Punteado',
        sigla: 'RTC', planificable: true, precioUSD: 280
      }),
      T('Poste y núcleo', 'Colocación de poste con reconstrucción de núcleo', 156000, 60, {
        alcance: 'diente', modoDibujo: 'rootLine',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'PN', planificable: true, precioUSD: 120
      }),

      // === Prótesis fija / estética ===
      T('Corona metal-porcelana', 'Funda ceramo-metálica', 585000, 90, {
        alcance: 'diente', modoDibujo: 'outline',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'CR-MP', planificable: true, precioUSD: 450
      }),
      T('Corona totalmente cerámica (zirconio/porcelana)', 'Funda libre de metal', 845000, 90, {
        alcance: 'diente', modoDibujo: 'outline',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'CR-CER', planificable: true, precioUSD: 650
      }),
      T('Corona provisional', 'Funda provisoria', 78000, 30, {
        alcance: 'diente', modoDibujo: 'outline',
        colorRealizado: GRN, colorPlanificado: RED, trazoSugerido: 'Punteado',
        sigla: 'CR-PROV', planificable: true, precioUSD: 60
      }),
      T('Carilla de porcelana (veneer)', 'Lámina estética anterior', 715000, 90, {
        alcance: 'diente', modoDibujo: 'outline',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'VEN', planificable: true, precioUSD: 550
      }),
      T('Puente (por unidad)', 'Precio por diente en puente fijo', 585000, 90, {
        alcance: 'multi', aplicaMultiplesPiezas: true, modoDibujo: 'connector',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'PU', planificable: true, precioUSD: 450
      }),
      T('Recementado de corona', 'Retiro y recementado de corona', 65000, 20, {
        alcance: 'diente', modoDibujo: 'outline',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'RC', planificable: true, precioUSD: 50
      }),

      // === Implantes ===
      T('Implante (colocación del implante)', 'Colocación de fixture (sin prótesis)', 1170000, 90, {
        alcance: 'diente', modoDibujo: 'implant',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'IMP', planificable: true, precioUSD: 900
      }),
      T('Pilar + corona sobre implante', 'Rehabilitación del implante', 910000, 90, {
        alcance: 'diente', modoDibujo: 'outline',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'ABT+CR', planificable: true, precioUSD: 700
      }),

      // === Cirugía ===
      T('Extracción simple', 'Exodoncia simple', 104000, 30, {
        alcance: 'diente', modoDibujo: 'cross',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'EX', planificable: true, precioUSD: 80
      }),
      T('Extracción quirúrgica / tercer molar', 'Exodoncia con colgajo/osteotomía', 260000, 60, {
        alcance: 'diente', modoDibujo: 'cross',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'EXQ', planificable: true, precioUSD: 200
      }),

      // === Periodoncia ===
      T('Raspado y alisado radicular (por cuadrante)', 'SRP por cuadrante', 195000, 60, {
        alcance: 'cuadrante', modoDibujo: 'none',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Punteado',
        sigla: 'SRP', planificable: true, precioUSD: 150
      }),
      T('Ferulización periodontal', 'Férula de contención en sector anterior', 234000, 60, {
        alcance: 'multi', aplicaMultiplesPiezas: true, modoDibujo: 'connector',
        colorRealizado: BLUE, colorPlanificado: RED, trazoSugerido: 'Continuo',
        sigla: 'FER', planificable: true, precioUSD: 180
      }),

      // === Estética / Oclusión ===
      T('Blanqueamiento en consultorio', 'Peróxido en consultorio', 325000, 60, {
        alcance: 'arcada', modoDibujo: 'none', sigla: 'BLQ',
        colorRealizado: BLUE, planificable: true, precioUSD: 250
      }),
      T('Placa de bruxismo (férula)', 'Placa Michigan o similar', 286000, 60, {
        alcance: 'arcada', modoDibujo: 'none', sigla: 'FERU',
        colorRealizado: BLUE, planificable: true, precioUSD: 220
      }),
      T('Protector dental deportivo', 'Protección termoformada', 208000, 45, {
        alcance: 'arcada', modoDibujo: 'none', sigla: 'PROT',
        colorRealizado: BLUE, planificable: true, precioUSD: 160
      }),
    ], {});
  },

  async down(queryInterface, Sequelize) {
    const Op = Sequelize.Op;
    await queryInterface.bulkDelete('tratamientos', {
      nombre: {
        [Op.in]: [
          'Consulta y diagnóstico',
          'Radiografía periapical',
          'Radiografía panorámica (OPG)',
          'Limpieza (profilaxis)',
          'Fluoración tópica',
          'Sellante de fosas y fisuras (por pieza)',
          'Obturación resina 1 cara',
          'Obturación resina 2 caras (MO/DO)',
          'Obturación resina 3 caras (MOD)',
          'Tratamiento de fractura coronal con resina',
          'Incrustación / inlay / onlay',
          'Endodoncia unirradicular (incisivo/canino)',
          'Endodoncia birradicular (premolar)',
          'Endodoncia multirradicular (molar)',
          'Retratamiento endodóntico',
          'Poste y núcleo',
          'Corona metal-porcelana',
          'Corona totalmente cerámica (zirconio/porcelana)',
          'Corona provisional',
          'Carilla de porcelana (veneer)',
          'Puente (por unidad)',
          'Recementado de corona',
          'Implante (colocación del implante)',
          'Pilar + corona sobre implante',
          'Extracción simple',
          'Extracción quirúrgica / tercer molar',
          'Raspado y alisado radicular (por cuadrante)',
          'Ferulización periodontal',
          'Blanqueamiento en consultorio',
          'Placa de bruxismo (férula)',
          'Protector dental deportivo',
        ],
      },
    }, {});
  },
};
