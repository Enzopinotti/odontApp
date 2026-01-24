// frontend/src/features/odontograma/components/FaceMenu.js
import { useEffect, useRef, useState } from 'react';
import { COLORS } from '../constants';
import { FaTimes, FaThList, FaTrashAlt, FaTooth, FaUserMd, FaHistory, FaBolt, FaBookMedical, FaChevronLeft } from 'react-icons/fa';

import ModernSelect from '../../../components/ModernSelect';

export default function FaceMenu({
  open, diente, initialFaces = [],
  onAction, onOpenCatalog, onClose,
  dentists = [], clinicalUserId, onUserChange,
  pendingTreatment = null, onClearPending
}) {
  const ref = useRef(null);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (open) setSelected(initialFaces);
  }, [open, initialFaces]);

  useEffect(() => {
    if (!open) return;
    const outside = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose?.(); };
    window.addEventListener('mousedown', outside, true);
    return () => window.removeEventListener('mousedown', outside, true);
  }, [open, onClose]);

  if (!open) return null;

  const pieza = diente?._fdi || '';
  const dentistOptions = dentists.map(d => ({ id: d.id, label: `${d.apellido}, ${d.nombre}` }));

  // Mapa de caras con intervenciones (para el dibujo)
  const markedFaces = (diente?.CaraTratadas || []).reduce((acc, curr) => {
    acc[curr.simbolo] = curr.colorHex || (typeof curr.colorEstado === 'number' ? '#1d4ed8' : curr.color);
    return acc;
  }, {});

  // Historial mejorado con nombres
  const existing = [
    ...(diente?.CaraTratadas || []).map(c => ({
      id: `c-${c.id}`,
      label: c.Tratamiento?.nombre ? `${c.Tratamiento.nombre}` : `Intervención Cara ${c.simbolo}`,
      zona: c.simbolo,

      estado: c.estadoCara,
      color: c.colorHex || '#1d4ed8',
      isCara: true
    })),
    ...(diente?.DienteTratamientos || []).map(t => ({
      id: `t-${t.id}`,
      label: t.Tratamiento?.nombre || 'Pieza Completa',
      zona: 'TODAS',
      estado: t.estado,
      color: t.color,
      isCara: false
    })),
    ...(diente?.TratamientosAplicados || []).map(t => ({
      id: `ta-${t.id}`,
      label: t.Tratamiento?.nombre || 'Pieza Completa',
      zona: 'TODAS',
      estado: t.estado,
      color: t.color,
      isCara: false
    }))
  ];

  const toggleFace = (key) => {
    if (pendingTreatment) return;
    setSelected(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const handleApply = (stateData) => {
    onAction({ ...stateData, faces: selected });
  };

  const isSel = (k) => selected.includes(k);

  // Color logic for SVG paths
  const getFill = (k) => {
    if (isSel(k)) return '#1d4ed8'; // Active blue
    return markedFaces[k] || 'white';
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="face-popover-pro admin-modal-card compact-flow" ref={ref} onClick={(e) => e.stopPropagation()}>
        <header className="am-head">
          <div className="am-title">
            <FaTooth />
            <div>
              <h3>Pieza FDI {pieza}</h3>
              <p>{selected.length === 0 ? 'Sin selección' : `${selected.length} caras elegidas`}</p>
            </div>
          </div>
          <button className="close-x" onClick={onClose}><FaTimes /></button>
        </header>

        <div className="am-body">
          {pendingTreatment ? (
            /* MODO CONFIRMACIÓN EXCLUSIVO */
            <div className="exclusive-confirm-view animate-fade-in">
              <div className="confirm-indicator">
                <FaBookMedical /> Confirmar tratamiento seleccionado
              </div>

              <div className="tooth-display-box active">
                <svg viewBox="0 0 100 100" className="tooth-svg large">
                  <defs><clipPath id="confirmClip"><path d="M20,10 Q50,2 80,10 Q92,16 92,28 L92,72 Q92,90 50,92 Q8,90 8,72 L8,28 Q8,16 20,10 Z" /></clipPath></defs>
                  <path d="M20,10 Q50,2 80,10 Q92,16 92,28 L92,72 Q92,90 50,92 Q8,90 8,72 L8,28 Q8,16 20,10 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                  <g clipPath="url(#confirmClip)">
                    {['B', 'L', 'M', 'D', 'O'].map(k => (
                      <path key={k} d={k === 'B' ? "M30 0 h40 v30 h-40 z" : k === 'L' ? "M30 70 h40 v30 h-40 z" : k === 'M' ? "M0 30 h30 v40 h-30 z" : k === 'D' ? "M70 30 h30 v40 h-30 z" : "M30 30 h40 v40 h-40 z"} fill={getFill(k)} stroke="#e2e8f0" strokeWidth="0.5" />
                    ))}
                  </g>
                </svg>
                <div className="sel-faces-badge">Zona: {selected.join(', ') || 'Pieza'}</div>
              </div>

              <div className="final-confirm-card">
                <div className="fc-main">
                  <h4>{pendingTreatment.nombre}</h4>
                  <span className="fc-price">${Math.round(pendingTreatment.price || pendingTreatment.precio).toLocaleString('es-AR')}</span>
                </div>
                <div className="fc-footer">
                  <button className="fc-btn-back" onClick={onClearPending}>Cancelar</button>
                  <button className="fc-btn-confirm" onClick={() => handleApply({ fromCatalog: true })}>✓ Confirmar Registro</button>
                </div>

              </div>
            </div>
          ) : (
            /* MODO EDICIÓN / SELECCIÓN */
            <>
              <div className="fp-field mb-sm">
                <ModernSelect options={dentistOptions} value={clinicalUserId} onChange={onUserChange} placeholder="Elegir profesional..." icon={<FaUserMd />} />
              </div>

              <div className="tooth-editor-box">
                <svg viewBox="0 0 100 100" className="tooth-svg">
                  <defs><clipPath id="editClip"><path d="M20,10 Q50,2 80,10 Q92,16 92,28 L92,72 Q92,90 50,92 Q8,90 8,72 L8,28 Q8,16 20,10 Z" /></clipPath></defs>
                  <path d="M20,10 Q50,2 80,10 Q92,16 92,28 L92,72 Q92,90 50,92 Q8,90 8,72 L8,28 Q8,16 20,10 Z" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1" />
                  <g clipPath="url(#editClip)">
                    {['B', 'L', 'M', 'D', 'O'].map(k => (
                      <g key={k} onClick={() => toggleFace(k)} style={{ cursor: 'pointer' }}>
                        <path d={k === 'B' ? "M30 0 h40 v30 h-40 z" : k === 'L' ? "M30 70 h40 v30 h-40 z" : k === 'M' ? "M0 30 h30 v40 h-30 z" : k === 'D' ? "M70 30 h30 v40 h-30 z" : "M30 30 h40 v40 h-40 z"} fill={getFill(k)} stroke="#e2e8f0" strokeWidth="0.5" />
                        {markedFaces[k] && !isSel(k) && <circle cx={k === 'B' ? 50 : k === 'L' ? 50 : k === 'M' ? 15 : k === 'D' ? 85 : 50} cy={k === 'B' ? 15 : k === 'L' ? 85 : k === 'M' ? 50 : k === 'D' ? 50 : 50} r="3" fill="#cbd5e1" />}
                      </g>
                    ))}
                  </g>
                </svg>
                <div className="tooth-meta">
                  <div className="faces-list">{selected.map(k => <span key={k}>{k}</span>)}</div>
                  <button className="btn-all" onClick={() => setSelected(['B', 'L', 'M', 'D', 'O'])}>Marcar Todo</button>
                </div>
              </div>

              <div className="options-grid-pro">
                <div className="opt-panel">
                  <header><FaBolt /> Marcado Rápido</header>
                  <div className="q-btns">
                    <button className="q-re" onClick={() => handleApply({ estado: 'Realizado', color: COLORS.realizado })} disabled={selected.length === 0}>Realizado</button>
                    <button className="q-pl" onClick={() => handleApply({ estado: 'Planificado', color: COLORS.planificado })} disabled={selected.length === 0}>Planificar</button>
                    <button className="q-an" onClick={() => handleApply({ estado: 'Realizado', color: COLORS.antiguo })} disabled={selected.length === 0}>Antiguo</button>
                  </div>
                </div>
                <div className="opt-panel">
                  <header><FaBookMedical /> Catálogo</header>
                  <button className="btn-cat" onClick={() => onOpenCatalog(selected)} disabled={selected.length === 0}>
                    <FaThList /> Buscar Tratamiento
                  </button>
                </div>
              </div>
            </>
          )}

          {/* HISTORIAL SIEMPRE VISIBLE SI HAY DATOS */}
          {existing.length > 0 && (
            <div className="history-section-pro">
              <header className="section-title"><FaHistory /> Intervenciones registradas</header>
              <div className="h-list">
                {existing.map(ex => (
                  <div key={ex.id} className="h-item">
                    <i className="dot" style={{ background: ex.color }}></i>
                    <div className="h-info">
                      <strong>{ex.label} <span className="z">{ex.zona}</span></strong>
                      <small>{ex.estado}</small>
                    </div>
                    <button className="h-del" onClick={() => onAction({ remove: true, targetId: ex.id, isCara: ex.isCara })}><FaTrashAlt /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
