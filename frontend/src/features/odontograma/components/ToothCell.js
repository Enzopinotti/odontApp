/**
 * @typedef {Object} CaraTratada
 * @property {number} id
 * @property {string} simbolo   // 'O' | 'M' | 'D' | 'B' | 'L'
 * @property {number} colorEstado // int RGB (db)
 * @property {string} estadoCara  // 'Planificado' | 'Realizado' | ...
 * @property {string} tipoTrazo   // 'Continuo' | 'Punteado'
 */

/**
 * @typedef {Object} Diente
 * @property {number} id
 * @property {number} _fdi
 * @property {CaraTratada[]} [CaraTratadas]
 */

import { intToHex } from '../utils/color';

/**
 * @param {{ diente: Diente, onOpenMenu: (e:MouseEvent, diente:Diente, faceKey:string, current?:CaraTratada)=>void }} props
 */
export default function ToothCell({ diente, onOpenMenu }) {
  const facesByKey = {};
  (diente?.CaraTratadas || []).forEach((c) => {
    facesByKey[c?.simbolo?.toUpperCase()] = c;
  });

  const fillFor = (key) => {
    const c = facesByKey[key];
    if (!c) return 'transparent';
    if (typeof c.colorEstado === 'number') return intToHex(c.colorEstado);
    return 'transparent';
  };

  const bind = (k) => ({
    onClick: (e) => onOpenMenu(e, diente, k, facesByKey[k] || null),
    onContextMenu: (e) => { e.preventDefault(); onOpenMenu(e, diente, k, facesByKey[k] || null); },
  });

  return (
    <div className="tooth-cell" title={`FDI ${diente?._fdi ?? ''}`}>
      <svg viewBox="0 0 100 100" className="tooth-svg" aria-hidden>
        <rect x="3" y="3" width="94" height="94" rx="10" fill="none" stroke="#d7dbe5" strokeWidth="2" pointerEvents="none"/>
        <path d="M35 6 L65 6 L65 35 L50 35 L35 35 Z"  fill={fillFor('B')} className="face area-b" {...bind('B')} />
        <path d="M35 65 L50 65 L65 65 L65 94 L35 94 Z" fill={fillFor('L')} className="face area-l" {...bind('L')} />
        <path d="M6 35 L35 35 L35 65 L6 65 Z"         fill={fillFor('M')} className="face area-m" {...bind('M')} />
        <path d="M65 35 L94 35 L94 65 L65 65 Z"       fill={fillFor('D')} className="face area-d" {...bind('D')} />
        <polygon points="50,35 65,50 50,65 35,50"    fill={fillFor('O')} className="face area-o" {...bind('O')} />
        <line x1="35" y1="35" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
        <line x1="65" y1="35" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
        <line x1="35" y1="65" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
        <line x1="65" y1="65" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
      </svg>
      <div className="tooth-num">{diente?._fdi ?? ''}</div>
    </div>
  );
}
