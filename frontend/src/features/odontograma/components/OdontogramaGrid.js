import ToothCell from './ToothCell';
import { FDI_ORDER } from '../constants';

/**
 * Renderiza 32 piezas en el orden clínico (FDI) clásico.
 * Visualización: fila sup → Q1+Q2 ; fila inf → Q4+Q3 (16 columnas en total).
 */
export default function OdontogramaGrid({ odo, onOpenMenu }) {
  if (!odo?.Dientes?.length) return null;

  const pickQ = (baseIndex, fdiList) =>
    fdiList.map((fdiNum, idx) => {
      const d = odo.Dientes[baseIndex + idx];
      return d ? { ...d, _fdi: fdiNum } : null;
    }).filter(Boolean);

  const upperRow = [...pickQ(0, FDI_ORDER[1]), ...pickQ(8, FDI_ORDER[2])];
  const lowerRow = [...pickQ(24, FDI_ORDER[4]), ...pickQ(16, FDI_ORDER[3])];

  return (
    <div className="odo-grid-viewport" onContextMenu={(e) => e.preventDefault()}>
      <div className="odo-grid">
        {upperRow.map(d => <ToothCell key={d.id} diente={d} onOpenMenu={onOpenMenu} />)}
        {lowerRow.map(d => <ToothCell key={d.id} diente={d} onOpenMenu={onOpenMenu} />)}
      </div>
    </div>
  );
}


