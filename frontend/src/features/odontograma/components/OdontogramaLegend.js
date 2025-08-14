import { COLORS } from '../constants';

export default function OdontogramaLegend() {
  return (
    <footer className="odo-legend">
      <span className="dot" style={{ background: COLORS.realizado }} /> Realizado
      <span className="dot" style={{ background: COLORS.planificado }} /> A realizar
      <span className="dot" style={{ background: COLORS.antiguo }} /> Antiguo
    </footer>
  );
}
