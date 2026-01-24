/**
 * ToothCell.js - VERSIÓN PRO
 * Representación SVG de un diente con overlays clínicos refinados.
 */

import { intToHex } from '../utils/color';

function parseCfg(cfg) {
  try { return typeof cfg === 'string' ? JSON.parse(cfg) : (cfg || {}); }
  catch { return {}; }
}

function readStyleFrom(item, cfg) {
  const color =
    typeof item?.colorEstado === 'number' ? intToHex(item.colorEstado) :
      typeof item?.color === 'string' ? item.color :
        cfg?.colorRealizado || '#1d4ed8';
  const dash =
    item?.tipoTrazo === 'Punteado' || cfg?.trazoSugerido === 'Punteado' ? '4 3' : '0';
  return { color, dash };
}

function rootCountBySigla(sigla) {
  if (!sigla) return 1;
  const s = sigla.toUpperCase();
  if (s.includes('TC3')) return 3;
  if (s.includes('TC2')) return 2;
  return 1;
}

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

export default function ToothCell({ diente, onOpenMenu }) {
  const facesByKey = {};
  (diente?.CaraTratadas || []).forEach((c) => {
    facesByKey[c?.simbolo?.toUpperCase()] = c;
  });

  const getColorFrom = (target) => {
    if (!target) return 'transparent';
    if (target.colorHex) return target.colorHex;
    if (typeof target.colorEstado === 'number') return intToHex(target.colorEstado);
    if (typeof target.color === 'string') return target.color;
    return 'transparent';
  };

  const fillFor = (key) => {
    const specificFace = facesByKey[key];
    if (specificFace) return getColorFrom(specificFace);

    const globalFace = facesByKey['TODAS'];
    if (globalFace) return getColorFrom(globalFace);

    const toothTreatments = [
      ...(diente?.DienteTratamientos || []),
      ...(diente?.TratamientosAplicados || []),
      ...(diente?.Tratamientos || [])
    ];

    for (const t of toothTreatments) {
      const cfg = parseCfg(t.config);
      if (!cfg.modoDibujo || cfg.modoDibujo === 'fill') {
        return t.color || cfg.colorRealizado || cfg.colorPlanificado || '#1d4ed8';
      }
    }
    return 'transparent';
  };

  const overlays = collectToothTreatments(diente);

  const bind = (k) => ({
    onClick: (e) => onOpenMenu(e, diente, k, facesByKey[k] || null),
    onContextMenu: (e) => { e.preventDefault(); onOpenMenu(e, diente, k, facesByKey[k] || null); },
  });


  const clipId = `toothClip-${diente?.id ?? diente?._fdi ?? Math.random()}`;
  const TOOTH_PATH = `
    M20,10 
    Q50,2 80,10 
    Q92,16 92,28 
    L92,72 
    Q92,90 50,92 
    Q8,90 8,72 
    L8,28 
    Q8,16 20,10 
    Z
  `;

  return (
    <div className="tooth-cell" title={`FDI ${diente?._fdi ?? ''}`}>
      <svg viewBox="0 0 100 100" className="tooth-svg" aria-hidden>
        <defs>
          <clipPath id={clipId}>
            <path d={TOOTH_PATH} />
          </clipPath>
        </defs>

        {/* FONDO Y SILUETA BASE */}
        <path
          d={TOOTH_PATH}
          fill={facesByKey['TODAS'] ? fillFor('TODAS') : 'white'}
          stroke={facesByKey['TODAS'] ? 'transparent' : '#e2e8f0'}
          strokeWidth="1.6"
          className="tooth-bg-click"
          onClick={(e) => onOpenMenu(e, diente, 'TODAS', facesByKey['TODAS'])}
        />

        {/* CONTENIDO CLÍNICO RECORTADO */}
        <g clipPath={`url(#${clipId})`}>
          <path d="M30 5 L70 5 L70 30 L50 30 L30 30 Z" fill={fillFor('B')} className="face area-b" {...bind('B')} />
          <path d="M30 70 L50 70 L70 70 L70 95 L30 95 Z" fill={fillFor('L')} className="face area-l" {...bind('L')} />
          <path d="M5 30 L30 30 L30 70 L5 70 Z" fill={fillFor('M')} className="face area-m" {...bind('M')} />
          <path d="M70 30 L95 30 L95 70 L70 70 Z" fill={fillFor('D')} className="face area-d" {...bind('D')} />
          <rect x="30" y="30" width="40" height="40" fill={fillFor('O')} className="face area-o" {...bind('O')} />

          {/* LÍNEAS DIVISORIAS PERMANENTES (GRILLA COMPLETA) */}
          <g fill="none" stroke="#e2e8f0" strokeWidth="0.8" pointerEvents="none">
            <line x1="30" y1="0" x2="30" y2="100" />
            <line x1="70" y1="0" x2="70" y2="100" />
            <line x1="0" y1="30" x2="100" y2="30" />
            <line x1="0" y1="70" x2="100" y2="70" />
          </g>


          {/* -------- overlays refinados -------- */}

          {overlays.map(({ cfg, raw }, i) => {
            const { color, dash } = readStyleFrom(raw, cfg);

            if (cfg.modoDibujo === 'cross') {
              return (
                <g key={i}>
                  <line x1="15" y1="15" x2="85" y2="85" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={dash} opacity="0.8" />
                  <line x1="85" y1="15" x2="15" y2="85" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={dash} opacity="0.8" />
                </g>
              );
            }

            if (cfg.modoDibujo === 'outline') {
              return <rect key={i} x="6" y="6" width="88" height="88" rx="8" fill="none" stroke={color} strokeWidth="4" strokeDasharray={dash} />;
            }

            if (cfg.modoDibujo === 'rootLine') {
              const n = rootCountBySigla(cfg.sigla || raw.sigla);
              const xOff = n === 1 ? [50] : n === 2 ? [42, 58] : [38, 50, 62];
              return (
                <g key={i}>
                  {xOff.map((x, j) => <line key={j} x1={x} y1="10" x2={x} y2="90" stroke={color} strokeWidth="4" strokeLinecap="round" strokeDasharray={dash} />)}
                </g>
              );
            }

            if (cfg.modoDibujo === 'implant') {
              return (
                <g key={i}>
                  <rect x="44" y="15" width="12" height="70" rx="3" fill={color} />
                  {[30, 45, 60].map(y => <line key={y} x1="40" y1={y} x2="60" y2={y + 5} stroke="white" strokeWidth="2" />)}
                </g>
              );
            }

            if (cfg.modoDibujo === 'fractureLine') {
              return <path key={i} d="M20 40 L40 60 L60 40 L80 60" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />;
            }

            if (cfg.modoDibujo === 'connector') {
              return <line key={i} x1="0" y1="50" x2="100" y2="50" stroke={color} strokeWidth="9" opacity="0.5" />;
            }

            return null;
          })}
        </g>

        {/* LÍNEA DE COSTURA INTERNA (REFINAMIENTO VISUAL) */}
        <path d={TOOTH_PATH} fill="none" stroke="#dbe4ee" strokeWidth="0.8" pointerEvents="none" />
      </svg>
      <div className="tooth-num">{diente?._fdi ?? ''}</div>
    </div>
  );


}
