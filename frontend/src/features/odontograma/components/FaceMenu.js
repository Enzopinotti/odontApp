import { useEffect, useRef } from 'react';
import { FACE_LABELS, COLORS, COLOR_SWATCHES } from '../constants';

/**
 * @param {{
 *  open:boolean, x:number, y:number,
 *  diente?:any, faceKey?:'O'|'M'|'D'|'B'|'L',
 *  current?:any,
 *  onAction: (opts:{estado?:string,color?:string,tipoTrazo?:string,remove?:boolean})=>void,
 *  onClose: ()=>void
 * }} props
 */
export default function FaceMenu({ open, x, y, diente, faceKey, current, onAction, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('mousedown', outside, true);
    window.addEventListener('touchstart', outside, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', outside, true);
      window.removeEventListener('touchstart', outside, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  const header = diente?._fdi ? `FDI ${diente._fdi} · ${FACE_LABELS[faceKey]}` : FACE_LABELS[faceKey];

  return (
    <div className="face-popover" ref={ref} style={{ top: y, left: x }} role="menu">
      <div className="fp-head">{header}</div>

      <div className="fp-group">
        <div className="fp-title">Marcar estado</div>
        <button className="chip" onClick={() => onAction({ estado: 'Planificado', color: COLORS.planificado })}>
          <span className="dot" style={{ background: COLORS.planificado }} />
          A realizar
        </button>
        <button className="chip" onClick={() => onAction({ estado: 'Realizado', color: COLORS.realizado })}>
          <span className="dot" style={{ background: COLORS.realizado }} />
          Realizado (hoy)
        </button>
        <button className="chip" onClick={() => onAction({ estado: 'Realizado', color: COLORS.antiguo })}>
          <span className="dot" style={{ background: COLORS.antiguo }} />
          Antiguo
        </button>
      </div>

      <div className="fp-group">
        <div className="fp-title">Trazo</div>
        <button className="chip" onClick={() => onAction({ tipoTrazo: 'Continuo' })}>Continuo</button>
        <button className="chip" onClick={() => onAction({ tipoTrazo: 'Punteado' })}>Punteado</button>
      </div>

      <div className="fp-group">
        <div className="fp-title">Color rápido</div>
        <div className="fp-swatches">
          {COLOR_SWATCHES.map((c) => (
            <button key={c} className="swatch" title={c} onClick={() => onAction({ color: c })}>
              <span style={{ background: c }} />
            </button>
          ))}
        </div>
      </div>

      {current && (
        <div className="fp-actions">
          <button className="chip danger" onClick={() => onAction({ remove: true })}>
            Quitar marca
          </button>
        </div>
      )}
    </div>
  );
}
