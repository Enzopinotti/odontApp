import { FaCheckCircle, FaHourglassHalf, FaHistory } from 'react-icons/fa';


export default function OdontogramaLegend() {
  return (
    <div className="odo-legend-chips">
      <div className="legend-chip realizado">
        <FaCheckCircle />
        <span>Tratamiento Realizado</span>
      </div>
      <div className="legend-chip planificado">
        <FaHourglassHalf />
        <span>A Realizar (Planificado)</span>
      </div>
      <div className="legend-chip antiguo">
        <FaHistory />
        <span>Pre-existente / Antiguo</span>
      </div>
    </div>
  );
}

