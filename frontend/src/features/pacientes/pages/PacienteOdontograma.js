// src/features/pacientes/pages/PacienteOdontograma.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import BackBar from '../../../components/BackBar';
import usePaciente from '../hooks/usePaciente';
import useOdontograma from '../hooks/useOdontograma';
import useToast from '../../../hooks/useToast';
import {
  registrarCaraTratada,
  actualizarCaraTratada,
  eliminarCaraTratada,
} from '../../../api/clinica';
import { FaPlusCircle } from 'react-icons/fa';

/* -------------------- Helpers & Constantes -------------------- */

// Normaliza key de cara del backend
const caraKey = (c) => (c?.simbolo || '').toUpperCase(); // 'O' | 'M' | 'D' | 'B' | 'L'
const toInt = (hex) => parseInt(String(hex).replace('#', ''), 16);

// Paleta base (coincide con leyenda)
const COLORS = {
  realizado: '#22c55e',   // verde
  planificado: '#f59e0b', // naranja
  antiguo: '#ef4444',     // rojo
};
const COLOR_SWATCHES = [
  '#22c55e', '#f59e0b', '#ef4444', '#0ea5e9', '#8b5cf6', '#94a3b8'
];

const FACE_LABELS = {
  O: 'Oclusal/Incisal',
  B: 'Bucal/vestibular',
  L: 'Lingual/Palatino',
  M: 'Mesial',
  D: 'Distal',
};

// Orden FDI por cuadrante (8 dientes por cuadrante)
const FDI_ORDER = {
  1: [18,17,16,15,14,13,12,11], // sup. derecha
  2: [21,22,23,24,25,26,27,28], // sup. izquierda
  3: [38,37,36,35,34,33,32,31], // inf. izquierda
  4: [41,42,43,44,45,46,47,48], // inf. derecha
};

// Util para posicionar el popover dentro del viewport
function clamp(n, min, max) { return Math.max(min, Math.min(n, max)); }

/* -------------------- Menú contextual de cara -------------------- */

function FaceMenu({ open, x, y, diente, faceKey, current, onAction, onClose }) {
  const ref = useRef(null);

  // Cerrar al clickear afuera o con ESC
  useEffect(() => {
    if (!open) return;
    const handleDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.();
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('mousedown', handleDown, true);
    window.addEventListener('touchstart', handleDown, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('mousedown', handleDown, true);
      window.removeEventListener('touchstart', handleDown, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const header = diente?._fdi ? `FDI ${diente._fdi} · ${FACE_LABELS[faceKey]}` : FACE_LABELS[faceKey];

  return (
    <div
      className="face-popover"
      ref={ref}
      style={{ top: y, left: x }}
      role="menu"
    >
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

/* -------------------- Diente (SVG clásico 5 superficies) -------------------- */
/**
 * Geometría clásica:
 *  - B (arriba), L (abajo), M (izquierda), D (derecha) como trapecios/rectángulos
 *  - O (centro) rombo
 *  - Líneas hacia el centro marcando vértices internos
 * Sólo las 5 superficies son "clickables".
 */
function ToothCell({ diente, onOpenMenu }) {
  const facesByKey = useMemo(() => {
    const map = {};
    (diente?.CaraTratadas || []).forEach((c) => { map[caraKey(c)] = c; });
    return map;
  }, [diente]);

  // Convierte color de BD (int) a hex
  const colorFromCara = (c) => {
    if (!c) return 'transparent';
    if (typeof c.colorEstado === 'number') {
      return `#${c.colorEstado.toString(16).padStart(6, '0')}`;
    }
    return COLORS.planificado;
  };

  const fillFor = (key) => colorFromCara(facesByKey[key]);

  // Long-press para mobile (abre el menú)
  const timerRef = useRef(null);
  const startPress = (e, k) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onOpenMenu(e, diente, k, facesByKey[k]), 420);
  };
  const cancelPress = () => { clearTimeout(timerRef.current); };

  // Handlers por cara (click, right-click, long-press)
  const bind = (k) => ({
    onClick: (e) => onOpenMenu(e, diente, k, facesByKey[k]),
    onContextMenu: (e) => { e.preventDefault(); onOpenMenu(e, diente, k, facesByKey[k]); },
    onPointerDown: (e) => startPress(e, k),
    onPointerUp: cancelPress,
    onPointerLeave: cancelPress,
    onPointerCancel: cancelPress,
  });

  return (
    <div className="tooth-cell" title={`Diente FDI ${diente?._fdi ?? ''}`}>
      {/* SVG reducida (el tamaño real lo maneja el CSS con variables) */}
      <svg viewBox="0 0 100 100" className="tooth-svg" aria-hidden>
        {/* Borde exterior */}
        <rect x="3" y="3" width="94" height="94" rx="10" fill="none" stroke="#d7dbe5" strokeWidth="2" pointerEvents="none"/>

        {/* Superficies – ordenadas para que el rombo quede arriba */}
        {/* B (arriba) */}
        <path d="M35 6 L65 6 L65 35 L50 35 L35 35 Z"
              fill={fillFor('B')} className="face area-b" {...bind('B')} />
        {/* L (abajo) */}
        <path d="M35 65 L50 65 L65 65 L65 94 L35 94 Z"
              fill={fillFor('L')} className="face area-l" {...bind('L')} />
        {/* M (izq) */}
        <path d="M6 35 L35 35 L35 65 L6 65 Z"
              fill={fillFor('M')} className="face area-m" {...bind('M')} />
        {/* D (der) */}
        <path d="M65 35 L94 35 L94 65 L65 65 Z"
              fill={fillFor('D')} className="face area-d" {...bind('D')} />
        {/* O (rombo centro) */}
        <polygon points="50,35 65,50 50,65 35,50"
                 fill={fillFor('O')} className="face area-o" {...bind('O')} />

        {/* Vértices internos hacia el centro (clásico) */}
        <line x1="35" y1="35" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
        <line x1="65" y1="35" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
        <line x1="35" y1="65" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
        <line x1="65" y1="65" x2="50" y2="50" stroke="#cfd3dd" strokeWidth="1.2" pointerEvents="none"/>
      </svg>
      <div className="tooth-num">{diente?._fdi ?? ''}</div>
    </div>
  );
}

/* -------------------- Página -------------------- */

export default function PacienteOdontograma() {
  const { id } = useParams();
  const pid = Number(id);
  const { showToast } = useToast();
  const qc = useQueryClient();

  const { data: paciente } = usePaciente(pid, true);
  const { data: odo, isLoading, isError, crear } = useOdontograma(pid);

  const title = useMemo(() => {
    if (paciente) return `Odontograma · ${paciente.apellido || ''} ${paciente.nombre || ''}`.trim();
    return 'Odontograma';
  }, [paciente]);

  // --- ORDEN CLÁSICO (Fila 1: Q1|Q2, Fila 2: Q4|Q3) ---
  const dientesFDI = useMemo(() => {
    if (!odo?.Dientes?.length) return [];

    const pickQ = (baseIndex, fdiList) =>
      fdiList
        .map((fdiNum, idx) => {
          const d = odo.Dientes[baseIndex + idx];
          return d ? { ...d, _fdi: fdiNum } : null;
        })
        .filter(Boolean);

    const q1 = pickQ(0,  FDI_ORDER[1]);  // 0..7
    const q2 = pickQ(8,  FDI_ORDER[2]);  // 8..15
    const q3 = pickQ(16, FDI_ORDER[3]);  // 16..23
    const q4 = pickQ(24, FDI_ORDER[4]);  // 24..31

    return [...q1, ...q2, ...q4, ...q3];
  }, [odo]);

  // ---------------- Mutations (caras) ----------------
  const addCara = useMutation({
    mutationFn: ({ dienteId, simbolo, estadoCara, colorEstado, tipoTrazo }) =>
      registrarCaraTratada(dienteId, {
        simbolo,
        tipoTrazo: tipoTrazo || 'Continuo',
        colorEstado: toInt(colorEstado),
        estadoCara,
        tratamientoId: null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paciente', pid, 'odontograma'] });
    },
  });

  const updateCara = useMutation({
    mutationFn: ({ caraId, simbolo, estadoCara, colorEstado, tipoTrazo }) =>
      actualizarCaraTratada(caraId, {
        simbolo,
        tipoTrazo: tipoTrazo || 'Continuo',
        colorEstado: toInt(colorEstado),
        estadoCara,
        tratamientoId: null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paciente', pid, 'odontograma'] });
    },
  });

  const deleteCara = useMutation({
    mutationFn: ({ caraId }) => eliminarCaraTratada(caraId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['paciente', pid, 'odontograma'] });
    },
  });

  // ---------------- Menú contextual (estado) ----------------
  const [menu, setMenu] = useState({
    open: false,
    x: 0,
    y: 0,
    diente: null,
    faceKey: null,
    current: null,
  });

  const crearOdonto = () => {
    crear.mutate(
      { observaciones: '' },
      { onSuccess: () => showToast('Odontograma creado', 'success') }
    );
  };

  const openMenu = useCallback((e, diente, faceKey, currentCara) => {
    // Posicionar cerca del cursor (limitado al viewport)
    const vw = window.innerWidth, vh = window.innerHeight;
    const PAD = 8, MENU_W = 280, MENU_H = 160;
    const x = clamp(e.clientX + PAD, 8, vw - MENU_W - 8);
    const y = clamp(e.clientY + PAD, 8, vh - MENU_H - 8);

    setMenu({ open: true, x, y, diente, faceKey, current: currentCara || null });
  }, []);

  const closeMenu = useCallback(() => setMenu((m) => ({ ...m, open: false })), []);

  const onMenuAction = async ({ estado, color, tipoTrazo, remove }) => {
    try {
      const target = menu;
      if (!target.diente || !target.faceKey) return;

      // si solo cambian trazo/color sin estado, usamos el estado actual (o planificado)
      const current = target.current;
      const finalEstado = estado || current?.estadoCara || 'Planificado';
      const finalColor  = color  || (current ? `#${current.colorEstado?.toString(16).padStart(6,'0')}` : COLORS.planificado);
      const finalTrazo  = tipoTrazo || current?.tipoTrazo || 'Continuo';

      if (remove && current) {
        await deleteCara.mutateAsync({ caraId: current.id });
        showToast('Cara eliminada', 'success');
      } else if (current) {
        await updateCara.mutateAsync({
          caraId: current.id,
          simbolo: target.faceKey,
          estadoCara: finalEstado,
          colorEstado: finalColor,
          tipoTrazo: finalTrazo,
        });
        showToast('Cara actualizada', 'success');
      } else {
        await addCara.mutateAsync({
          dienteId: target.diente.id,
          simbolo: target.faceKey,
          estadoCara: finalEstado,
          colorEstado: finalColor,
          tipoTrazo: finalTrazo,
        });
        showToast('Cara marcada', 'success');
      }
    } catch {
      showToast('No se pudo guardar la cara', 'error');
    } finally {
      closeMenu();
    }
  };

  // Evitar menú nativo del navegador en toda el área del odontograma
  const preventNativeContext = useCallback((e) => e.preventDefault(), []);

  return (
    <div className="paciente-odo-page">
      <BackBar
        title={title}
        to={-1}
        right={odo || isError ? null : (
          <button className="btn create" onClick={crearOdonto} disabled={crear.isLoading}>
            <FaPlusCircle /> <span>{crear.isLoading ? 'Creando…' : 'Crear odontograma'}</span>
          </button>
        )}
      />

      {isLoading && (
        <section className="card">
          <div className="odo-loader">Cargando odontograma…</div>
        </section>
      )}

      {isError && !isLoading && (
        <section className="card empty-odo">
          <h3>Error</h3>
          <p className="muted">No se pudo cargar el odontograma. Intentá nuevamente.</p>
        </section>
      )}

      {!isLoading && !isError && !odo && (
        <section className="card empty-odo">
          <h3>Sin odontograma</h3>
          <p>Este paciente aún no tiene odontograma registrado.</p>
          <button className="btn create" onClick={crearOdonto} disabled={crear.isLoading}>
            <FaPlusCircle /> <span>{crear.isLoading ? 'Creando…' : 'Crear odontograma'}</span>
          </button>
        </section>
      )}

      {odo && (
        <section className="card odo-wrap has-classic-line" onContextMenu={preventNativeContext}>
          <header className="odo-head">
            <div className="badge">Creado: {new Date(odo.fechaCreacion).toLocaleDateString()}</div>
            {odo.estadoGeneral && <div className="badge alt">{odo.estadoGeneral}</div>}
          </header>

          <div className="odo-grid">
            {dientesFDI.map((d) => (
              <ToothCell
                key={d.id}
                diente={d}
                onOpenMenu={openMenu}
              />
            ))}
          </div>

          <footer className="odo-legend">
            <span className="dot" style={{ background: COLORS.realizado }} /> Realizado
            <span className="dot" style={{ background: COLORS.planificado }} /> A realizar
            <span className="dot" style={{ background: COLORS.antiguo }} /> Antiguo
          </footer>

          {/* Menú contextual */}
          <FaceMenu
            open={menu.open}
            x={menu.x}
            y={menu.y}
            diente={menu.diente}
            faceKey={menu.faceKey}
            current={menu.current}
            onAction={onMenuAction}
            onClose={closeMenu}
          />
        </section>
      )}
    </div>
  );
}
