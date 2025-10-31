import { useMemo, useState } from 'react';
import useTratamientosQuery from '../hooks/useTratamientosQuery';
import useApplyTratamiento from '../hooks/useApplyTratamiento';
import { COLORS } from '../constants';


export default function TreatmentPicker({ pacienteId, dienteSeleccionado, onApplied, onClose }) {
  const { data: tratamientos, isLoading } = useTratamientosQuery();
  const { apply, apply: { isLoading: isApplying } } = useApplyTratamiento(pacienteId);
  const [estado, setEstado] = useState('Planificado');

  const list = useMemo(() => tratamientos || [], [tratamientos]);

  const onApply = async (t) => {
    if (!dienteSeleccionado) return;
    await apply.mutateAsync({
      dienteId: dienteSeleccionado?.id,
      payload: {
        tratamientoId: t.id,
        estado,
        color: estado === 'Realizado'
          ? (t.config?.colorRealizado)
          : (t.config?.colorPlanificado || t.config?.colorRealizado || COLORS.planificado),
      },
    });
    onApplied?.();
  };

  if (!dienteSeleccionado) {
    return (
      <aside className="tpicker-panel muted">
        Seleccioná un diente para aplicar tratamientos
        <div style={{ marginTop: 8 }}>
          <button className="chip" onClick={onClose}>Cerrar</button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="tpicker-panel">
      <header className="tpicker-head" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div className="title">Aplicar tratamiento</div>
          <div className="sub">Diente FDI {dienteSeleccionado._fdi}</div>
        </div>
        <button className="chip" onClick={onClose}>Cerrar</button>
      </header>

      <div className="tpicker-state">
        <label><input type="radio" name="st" checked={estado==='Planificado'} onChange={()=>setEstado('Planificado')} /> A realizar</label>
        <label><input type="radio" name="st" checked={estado==='Realizado'} onChange={()=>setEstado('Realizado')} /> Realizado</label>
      </div>

      <div className="tpicker-list">
        {isLoading && <div className="muted">Cargando tratamientos…</div>}
        {!isLoading && list.map((t) => (
          <button key={t.id} className="tp-item" disabled={isApplying} onClick={() => onApply(t)}>
            <div className="name">{t.nombre}</div>
            {t.config?.sigla && <div className="sigla">{t.config.sigla}</div>}
            {typeof t.precio === 'number' && <div className="price">${Math.round(t.precio).toLocaleString('es-AR')}</div>}
          </button>
        ))}
      </div>
    </aside>
  );
}
