// src/features/agenda/components/CancelarTurnosMultipleModal.js
import { useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useCancelarTurnosMultiple } from '../hooks/useTurnos';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import '../../../styles/agenda.scss';

export default function CancelarTurnosMultipleModal({ 
  isOpen, 
  onClose, 
  turnosSeleccionados,
  onSuccess 
}) {
  const { showToast } = useToast();
  const cancelarTurnosMultiple = useCancelarTurnosMultiple();
  const [motivo, setMotivo] = useState('');
  const [mostrandoResultados, setMostrandoResultados] = useState(false);
  const [resultados, setResultados] = useState(null);

  if (!isOpen) return null;

  const cantidadTurnos = turnosSeleccionados?.length || 0;

  const handleConfirmar = async () => {
    if (!motivo.trim()) {
      showToast('Por favor ingrese un motivo para la cancelación', 'error');
      return;
    }

    if (cantidadTurnos === 0) {
      showToast('Debe seleccionar al menos un turno', 'error');
      return;
    }

    try {
      const turnoIds = turnosSeleccionados.map(t => t.id);
      const resultado = await cancelarTurnosMultiple.mutateAsync({
        turnoIds,
        motivo: motivo.trim()
      });

      setResultados(resultado);
      setMostrandoResultados(true);
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  const handleCerrar = () => {
    setMotivo('');
    setMostrandoResultados(false);
    setResultados(null);
    onClose();
    if (resultados) {
      onSuccess();
    }
  };

  const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return '';
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={handleCerrar}>
      <div className="modal-content conflicto-turno-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaExclamationTriangle /> Cancelación Múltiple
          </h2>
          <button className="modal-close" onClick={handleCerrar}>×</button>
        </div>

        <div className="modal-body">
          {!mostrandoResultados ? (
            <>
              <div className="conflicto-mensaje">
                <p className="conflicto-texto">
                  Está a punto de cancelar <strong>{cantidadTurnos} turno(s)</strong>.
                </p>
              </div>

              <div className="turnos-lista-preview">
                <h4>Turnos a cancelar:</h4>
                <div className="turnos-preview-list">
                  {turnosSeleccionados.map((turno) => (
                    <div key={turno.id} className="turno-preview-item">
                      <div className="turno-preview-info">
                        <strong>
                          {turno.Paciente?.nombre} {turno.Paciente?.apellido}
                        </strong>
                        <span className="turno-preview-fecha">
                          {formatearFechaHora(turno.fechaHora)}
                        </span>
                        <span className="turno-preview-motivo">
                          {turno.motivo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label htmlFor="motivo-cancelacion-multiple">
                  Motivo de cancelación *:
                </label>
                <textarea
                  id="motivo-cancelacion-multiple"
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ingrese el motivo de la cancelación..."
                  rows="4"
                  required
                  className="form-input"
                  style={{ width: '100%', padding: '0.75rem' }}
                />
                <small style={{ color: '#7f8c8d', marginTop: '0.5rem', display: 'block' }}>
                  Este motivo se aplicará a todos los turnos seleccionados.
                </small>
              </div>
            </>
          ) : (
            <div className="resultados-cancelacion">
              <h3>Resultados de la cancelación</h3>
              
              <div className="resultado-item resultado-exitoso">
                <strong>✅ Cancelados exitosamente:</strong> {resultados?.cancelados || 0}
              </div>
              
              {resultados?.fallidos > 0 && (
                <div className="resultado-item resultado-fallido">
                  <strong>❌ Fallidos:</strong> {resultados.fallidos}
                </div>
              )}

              {resultados?.errores && resultados.errores.length > 0 && (
                <div className="errores-lista">
                  <h4>Errores:</h4>
                  <ul>
                    {resultados.errores.map((error, index) => (
                      <li key={index}>
                        Turno ID {error.turnoId}: {error.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resultados?.turnos && resultados.turnos.length > 0 && (
                <div className="turnos-cancelados-lista">
                  <h4>Turnos cancelados:</h4>
                  <div className="turnos-cancelados-preview">
                    {resultados.turnos.map((turno) => (
                      <div key={turno.id} className="turno-cancelado-item">
                        <strong>
                          {turno.Paciente?.nombre} {turno.Paciente?.apellido}
                        </strong>
                        <span>{formatearFechaHora(turno.fechaHora)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleCerrar}>
            {mostrandoResultados ? 'Cerrar' : 'Cancelar'}
          </button>
          {!mostrandoResultados && (
            <button
              className="btn-danger"
              onClick={handleConfirmar}
              disabled={!motivo.trim() || cancelarTurnosMultiple.isPending}
            >
              {cancelarTurnosMultiple.isPending ? 'Cancelando...' : `Cancelar ${cantidadTurnos} turno(s)`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

