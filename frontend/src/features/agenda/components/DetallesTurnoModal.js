// src/features/agenda/components/DetallesTurnoModal.js
import { useState } from 'react';
import { FaTimes, FaCheck, FaTimes as FaTimesCircle, FaCalendarAlt, FaBan, FaInfoCircle, FaEdit } from 'react-icons/fa';
import { useMarcarAsistencia, useMarcarAusencia, useCancelarTurno } from '../hooks/useTurnos';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import ReprogramarTurnoModal from './ReprogramarTurnoModal';
import EditarTurnoModal from './EditarTurnoModal';

export default function DetallesTurnoModal({ turno, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(null); // 'asistencia', 'ausencia', 'cancelar'
  const [mostrandoModal, setMostrandoModal] = useState(null); // 'reprogramar', 'editar'
  const [motivo, setMotivo] = useState('');
  const [nota, setNota] = useState('');

  const marcarAsistencia = useMarcarAsistencia();
  const marcarAusencia = useMarcarAusencia();
  const cancelarTurno = useCancelarTurno();

  const formatearFechaHora = (fechaHora) => {
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarcarAsistencia = async () => {
    try {
      await marcarAsistencia.mutateAsync({ id: turno.id, nota });
      showToast('Asistencia marcada correctamente', 'success');
      onSuccess();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  const handleMarcarAusencia = async () => {
    if (!motivo.trim()) {
      showToast('Por favor ingrese un motivo para la ausencia', 'error');
      return;
    }

    try {
      await marcarAusencia.mutateAsync({ id: turno.id, motivo });
      showToast('Ausencia registrada correctamente', 'success');
      onSuccess();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  const handleCancelar = async () => {
    if (!motivo.trim()) {
      showToast('Por favor ingrese un motivo para la cancelación', 'error');
      return;
    }

    try {
      await cancelarTurno.mutateAsync({ id: turno.id, motivo });
      showToast('Turno cancelado correctamente', 'success');
      onSuccess();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  const estadoClasses = {
    'PENDIENTE': 'estado-pendiente',
    'ASISTIO': 'estado-asistio',
    'AUSENTE': 'estado-ausente',
    'CANCELADO': 'estado-cancelado'
  };

  const estadoLabels = {
    'PENDIENTE': 'Pendiente',
    'ASISTIO': 'Asistió',
    'AUSENTE': 'Ausente',
    'CANCELADO': 'Cancelado'
  };

  // Solo mostrar acciones si el turno está pendiente
  const esPendiente = turno.estado === 'PENDIENTE';

  // Si hay un modal secundario abierto, renderizarlo
  if (mostrandoModal === 'reprogramar') {
    return (
      <ReprogramarTurnoModal
        turno={turno}
        onClose={() => setMostrandoModal(null)}
        onSuccess={() => {
          setMostrandoModal(null);
          onSuccess();
        }}
      />
    );
  }

  if (mostrandoModal === 'editar') {
    return (
      <EditarTurnoModal
        turno={turno}
        onClose={() => setMostrandoModal(null)}
        onSuccess={() => {
          setMostrandoModal(null);
          onSuccess();
        }}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-detalles-turno" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <FaInfoCircle /> Detalles del Turno
          </h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Estado del turno */}
          <div className={`turno-estado ${estadoClasses[turno.estado]}`}>
            {estadoLabels[turno.estado]}
          </div>

          {/* Información del paciente */}
          <div className="info-section">
            <h3>Paciente</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Nombre:</span>
                <span className="info-value">
                  {turno.Paciente?.nombre} {turno.Paciente?.apellido}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">DNI:</span>
                <span className="info-value">{turno.Paciente?.dni || 'N/A'}</span>
              </div>
              {turno.Paciente?.obraSocial && (
                <div className="info-item">
                  <span className="info-label">Obra Social:</span>
                  <span className="info-value">{turno.Paciente.obraSocial}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información del turno */}
          <div className="info-section">
            <h3>Información del Turno</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Fecha y Hora:</span>
                <span className="info-value">{formatearFechaHora(turno.fechaHora)}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Duración:</span>
                <span className="info-value">{turno.duracion} minutos</span>
              </div>
              <div className="info-item">
                <span className="info-label">Odontólogo:</span>
                <span className="info-value">
                  Dr. {turno.Odontologo?.Usuario?.nombre} {turno.Odontologo?.Usuario?.apellido}
                </span>
              </div>
              <div className="info-item full-width">
                <span className="info-label">Motivo:</span>
                <span className="info-value">{turno.motivo}</span>
              </div>
            </div>
          </div>

          {/* Formulario de confirmación si está activo */}
          {mostrandoConfirmacion === 'asistencia' && (
            <div className="confirmacion-form">
              <h4>Marcar Asistencia</h4>
              <label>
                Nota (opcional):
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Observaciones sobre la consulta..."
                  rows="3"
                />
              </label>
              <div className="form-actions">
                <button className="btn-cancelar" onClick={() => setMostrandoConfirmacion(null)}>
                  Cancelar
                </button>
                <button className="btn-confirmar" onClick={handleMarcarAsistencia}>
                  Confirmar Asistencia
                </button>
              </div>
            </div>
          )}

          {mostrandoConfirmacion === 'ausencia' && (
            <div className="confirmacion-form">
              <h4>Marcar Ausencia</h4>
              <label>
                Motivo *:
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo de la ausencia..."
                  rows="3"
                  required
                />
              </label>
              <div className="form-actions">
                <button className="btn-cancelar" onClick={() => setMostrandoConfirmacion(null)}>
                  Cancelar
                </button>
                <button className="btn-confirmar btn-ausencia" onClick={handleMarcarAusencia}>
                  Confirmar Ausencia
                </button>
              </div>
            </div>
          )}

          {mostrandoConfirmacion === 'cancelar' && (
            <div className="confirmacion-form">
              <h4>Cancelar Turno</h4>
              <label>
                Motivo *:
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Motivo de la cancelación..."
                  rows="3"
                  required
                />
              </label>
              <div className="form-actions">
                <button className="btn-cancelar" onClick={() => setMostrandoConfirmacion(null)}>
                  Volver
                </button>
                <button className="btn-confirmar btn-danger" onClick={handleCancelar}>
                  Confirmar Cancelación
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        {esPendiente && !mostrandoConfirmacion && (
          <>
            <div className="modal-footer-section">
              <h4 className="footer-section-title">Acciones Principales</h4>
              <div className="modal-footer">
                <button 
                  className="btn-accion btn-asistencia"
                  onClick={() => setMostrandoConfirmacion('asistencia')}
                >
                  <FaCheck /> Marcar Asistencia
                </button>
                <button 
                  className="btn-accion btn-ausencia"
                  onClick={() => setMostrandoConfirmacion('ausencia')}
                >
                  <FaTimesCircle /> Marcar Ausencia
                </button>
                <button 
                  className="btn-accion btn-cancelar-turno"
                  onClick={() => setMostrandoConfirmacion('cancelar')}
                >
                  <FaBan /> Cancelar Turno
                </button>
              </div>
            </div>
            
            <div className="modal-footer-section">
              <h4 className="footer-section-title">Modificar Turno</h4>
              <div className="modal-footer">
                <button 
                  className="btn-accion btn-reprogramar"
                  onClick={() => setMostrandoModal('reprogramar')}
                >
                  <FaCalendarAlt /> Reprogramar
                </button>
                <button 
                  className="btn-accion btn-editar"
                  onClick={() => setMostrandoModal('editar')}
                >
                  <FaEdit /> Editar Detalles
                </button>
              </div>
            </div>
          </>
        )}

        {!esPendiente && (
          <div className="modal-footer-info">
            <p>Este turno ya no está pendiente y no puede ser modificado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

