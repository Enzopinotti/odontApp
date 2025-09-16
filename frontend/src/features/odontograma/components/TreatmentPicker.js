import { useMemo, useState } from 'react';
import useTratamientosQuery from '../hooks/useTratamientosQuery';
import useApplyTratamiento from '../hooks/useApplyTratamiento';
import { COLORS } from '../constants';

/**
 * @param {{ pacienteId:number, dienteSeleccionado?:any, onApplied?:()=>void }} props
 */
export default function TreatmentPicker({ pacienteId, dienteSeleccionado, onApplied }) {
  const { data: tratamientos, isLoading } = useTratamientosQuery();
  const { apply, apply: { isLoading: isApplying } } = useApplyTratamiento(pacienteId);
  const [estado, setEstado] = useState('Planificado');

  const list = useMemo(() => tratamientos || [], [tratamientos]);

  const onApply = async (t) => {
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
    return <aside className="tpicker-panel muted">Seleccioná un diente para aplicar tratamientos</aside>;
  }

  return (
    <aside className="tpicker-panel">
      <header className="tpicker-head">
        <div className="title">Aplicar tratamiento</div>
        <div className="sub">Diente FDI {dienteSeleccionado._fdi}</div>
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
