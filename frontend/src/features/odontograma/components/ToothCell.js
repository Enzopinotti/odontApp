/**
 * Representación SVG de un diente con overlays clínicos.
 * Dibuja:
 *  - Caras (fill) tomadas de CaraTratadas
 *  - Overlays de Tratamientos por diente (cross/outline/rootLine/implant/fractureLine/connector)
 *
 * Admite distintos shapes de API para tratamientos de diente:
 *   diente.Tratamientos || diente.DienteTratamientos || diente.TratamientosAplicados
 * y también Tratamiento asociado dentro de CaraTratadas (por si el backend lo trae así).
 */

import { intToHex } from '../utils/color';

function parseCfg(cfg) {
  try { return typeof cfg === 'string' ? JSON.parse(cfg) : (cfg || {}); }
  catch { return {}; }
}

/** Normaliza color/estado/trazo desde distintos orígenes */
function readStyleFrom(item, cfg) {
  const color =
    typeof item?.colorEstado === 'number' ? intToHex(item.colorEstado) :
    typeof item?.color === 'string' ? item.color :
    cfg?.colorRealizado || '#ef4444';
  const dash =
    item?.tipoTrazo === 'Punteado' || cfg?.trazoSugerido === 'Punteado' ? '4 3' : '0';
  return { color, dash };
}

/** Número de líneas radiculares sugeridas por sigla */
function rootCountBySigla(sigla) {
  if (!sigla) return 1;
  if (/TC-3/i.test(sigla)) return 3;
  if (/TC-2/i.test(sigla)) return 2;
  return 1;
}

/** Extrae tratamientos a nivel diente desde varias posibles props */
function collectToothTreatments(diente) {
  const pools = [
    diente?.Tratamientos,
    diente?.DienteTratamientos,
    diente?.TratamientosAplicados,
  ].filter(Array.isArray);

  const fromFaces = (diente?.CaraTratadas || [])
    .map((c) => (c?.Tratamiento ? { ...c.Tratamiento, colorEstado: c.colorEstado, tipoTrazo: c.tipoTrazo } : null))
    .filter(Boolean);

  return [...pools.flat(), ...fromFaces]
    .map((t) => {
      const cfg = parseCfg(t?.config);
      return { cfg, raw: t };
    })
    .filter(({ cfg }) => cfg?.modoDibujo && cfg.modoDibujo !== 'fill' && cfg.modoDibujo !== 'none');
}

/**
 * @param {{ diente: any, onOpenMenu: (e:MouseEvent, diente:any, faceKey:'O'|'M'|'D'|'B'|'L', current?:any)=>void }} props
 */
export default function ToothCell({ diente, onOpenMenu }) {
  // Caras (fill)
  const facesByKey = {};
  (diente?.CaraTratadas || []).forEach((c) => {
    facesByKey[c?.simbolo?.toUpperCase()] = c;
  });

  const fillFor = (key) => {
    const c = facesByKey[key];
    if (!c) return 'transparent';
    if (typeof c.colorEstado === 'number') return intToHex(c.colorEstado);
    if (typeof c.color === 'string') return c.color;
    return 'transparent';
  };

  // Overlays a nivel diente
  const overlays = collectToothTreatments(diente);

  const bind = (k) => ({
    onClick: (e) => onOpenMenu(e, diente, k, facesByKey[k] || null),
    onContextMenu: (e) => { e.preventDefault(); onOpenMenu(e, diente, k, facesByKey[k] || null); },
  });

  return (
    <div className="tooth-cell" title={`FDI ${diente?._fdi ?? ''}`}>
      <svg viewBox="0 0 100 100" className="tooth-svg" aria-hidden>
        {/* marco base */}
        <rect x="3" y="3" width="94" height="94" rx="10"
              fill="none" stroke="#d7dbe5" strokeWidth="2" pointerEvents="none"/>

        {/* caras clicables */}
        <path d="M35 6 L65 6 L65 35 L50 35 L35 35 Z"  fill={fillFor('B')} className="face area-b" {...bind('B')} />
        <path d="M35 65 L50 65 L65 65 L65 94 L35 94 Z" fill={fillFor('L')} className="face area-l" {...bind('L')} />
        <path d="M6 35 L35 35 L35 65 L6 65 Z"         fill={fillFor('M')} className="face area-m" {...bind('M')} />
        <path d="M65 35 L94 35 L94 65 L65 65 Z"       fill={fillFor('D')} className="face area-d" {...bind('D')} />
        <polygon points="50,35 65,50 50,65 35,50"    fill={fillFor('O')} className="face area-o" {...bind('O')} />

        {/* líneas guía internas */}
        <line x1="35" y1="35" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
        <line x1="65" y1="35" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
        <line x1="35" y1="65" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
        <line x1="65" y1="65" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>

        {/* -------- overlays por tratamiento (modoDibujo) -------- */}
        {overlays.map(({ cfg, raw }, i) => {
          const { color, dash } = readStyleFrom(raw, cfg);

          // 1) EXTRACCIÓN (X)
          if (cfg.modoDibujo === 'cross') {
            return (
              <g key={`x-${i}`} pointerEvents="none">
                <line x1="10" y1="10" x2="90" y2="90" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={dash}/>
                <line x1="90" y1="10" x2="10" y2="90" stroke={color} strokeWidth="7" strokeLinecap="round" strokeDasharray={dash}/>
              </g>
            );
          }

          // 2) CORONA COMPLETA (contorno grueso)
          if (cfg.modoDibujo === 'outline') {
            return (
              <rect key={`ol-${i}`} x="8" y="8" width="84" height="84" rx="10"
                    fill="none" stroke={color} strokeWidth="6" strokeDasharray={dash} pointerEvents="none" />
            );
          }

          // 3) ENDODONCIA (líneas radiculares)
          if (cfg.modoDibujo === 'rootLine') {
            const n = rootCountBySigla(raw?.sigla);
            const offsets = (n === 1 ? [0] : n === 2 ? [-8, 8] : [-10, 0, 10]);
            return (
              <g key={`rt-${i}`} pointerEvents="none">
                {offsets.map((ox, j) => (
                  <line key={j}
                        x1={50+ox} y1="15" x2={50+ox} y2="85"
                        stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={dash}/>
                ))}
              </g>
            );
          }

          // 4) IMPLANTE (poste con roscas estilizadas)
          if (cfg.modoDibujo === 'implant') {
            return (
              <g key={`imp-${i}`} pointerEvents="none">
                <line x1="50" y1="18" x2="50" y2="82" stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={dash}/>
                {/* roscas (pequeños hachazos diagonales) */}
                {[28,38,48,58,68].map((y, k) => (
                  <line key={k} x1="46" y1={y} x2="54" y2={y+6} stroke={color} strokeWidth="3" strokeLinecap="round" />
                ))}
              </g>
            );
          }

          // 5) FRACTURA (zig-zag diagonal en corona)
          if (cfg.modoDibujo === 'fractureLine') {
            return (
              <polyline key={`fx-${i}`}
                        points="20,30 35,42 50,34 65,46 80,38"
                        fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
                        strokeLinejoin="round" strokeDasharray={dash} pointerEvents="none" />
            );
          }

          // 6) CONECTOR (puente/ferulización) – barra horizontal media
          if (cfg.modoDibujo === 'connector') {
            return (
              <line key={`cn-${i}`}
                    x1="15" y1="50" x2="85" y2="50"
                    stroke={color} strokeWidth="6" strokeLinecap="round" strokeDasharray={dash} pointerEvents="none" />
            );
          }

          return null;
        })}
      </svg>
      <div className="tooth-num">{diente?._fdi ?? ''}</div>
    </div>
  );
}
