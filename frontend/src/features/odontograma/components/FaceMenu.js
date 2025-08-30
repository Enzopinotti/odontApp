import { useEffect, useRef } from 'react';
import { FACE_LABELS, COLORS, COLOR_SWATCHES } from '../constants';

/**
 * Popover simple: estado + trazo + color rápido + abrir catálogo
 */
export default function FaceMenu({ open, x, y, diente, faceKey, current, onAction, onOpenCatalog, onClose }) {
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

      <div className="fp-actions" style={{ marginTop: '.5rem' }}>
        <button className="chip" onClick={onOpenCatalog}>Abrir catálogo…</button>
        {current && (
          <button className="chip danger" style={{ marginLeft: '.35rem' }} onClick={() => onAction({ remove: true })}>
            Quitar marca
          </button>
        )}
      </div>
    </div>
  );
}
