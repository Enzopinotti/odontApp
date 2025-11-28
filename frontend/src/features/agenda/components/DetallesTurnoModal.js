// src/features/agenda/components/DetallesTurnoModal.js
import { useState, useMemo } from 'react';
import { FaTimes, FaCheck, FaTimes as FaTimesCircle, FaCalendarAlt, FaBan, FaInfoCircle, FaEdit, FaStickyNote } from 'react-icons/fa';
import { useMarcarAsistencia, useMarcarAusencia, useCancelarTurno } from '../hooks/useTurnos';
import useToast from '../../../hooks/useToast';
import useAuth from '../../../features/auth/hooks/useAuth';
import { handleApiError } from '../../../utils/handleApiError';
import ReprogramarTurnoModal from './ReprogramarTurnoModal';
import EditarTurnoModal from './EditarTurnoModal';
import * as agendaApi from '../../../api/agenda';

export default function DetallesTurnoModal({ turno, onClose, onSuccess }) {
  const { showToast } = useToast();
  const { user } = useAuth();
  
  // CU-AG01.5: Verificar si el usuario es odontólogo
  const esOdontologo = useMemo(() => {
    return user?.rol?.id === 2 || user?.RolId === 2 || user?.rol?.nombre === 'Odontólogo';
  }, [user]);
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(null); // 'asistencia', 'ausencia', 'cancelar', 'nota'
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

        {/* Acciones Principales - Arriba para fácil acceso */}
        {/* CU-AG01.5: Solo recepcionista puede realizar acciones sobre turnos */}
        {esPendiente && !mostrandoConfirmacion && !esOdontologo && (
          <div className="modal-acciones-principales">
            <div className="acciones-botones">
              <div className="acciones-fila-1">
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
              <div className="acciones-fila-2">
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
                <button 
                  className="btn-accion btn-nota"
                  onClick={() => setMostrandoConfirmacion('nota')}
                >
                  <FaStickyNote /> Agregar Nota
                </button>
              </div>
            </div>
          </div>
        )}

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

          {/* CU-AG01.5: Historial de turnos del paciente */}
          {turno.Paciente?.id && (
            <div className="info-section">
              <h3>Historial de Turnos</h3>
              <div style={{ 
                maxHeight: '200px', 
                overflowY: 'auto', 
                padding: '0.5rem',
                background: '#f8f9fa',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}>
                <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
                  El historial completo de turnos del paciente se puede ver en su perfil.
                </p>
                {turno.Notas && turno.Notas.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong>Notas del turno:</strong>
                    <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                      {turno.Notas.map((nota, idx) => {
                        const autorNombre = nota.Usuario 
                          ? `${nota.Usuario.nombre} ${nota.Usuario.apellido}`
                          : 'Usuario desconocido';
                        const fechaNota = new Date(nota.createdAt);
                        const fechaFormateada = fechaNota.toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        
                        return (
                          <li key={idx} style={{ marginBottom: '0.75rem', paddingBottom: '0.75rem', borderBottom: idx < turno.Notas.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                            <div style={{ color: '#2c3e50', marginBottom: '0.25rem' }}>
                              {nota.descripcion}
                            </div>
                            <div style={{ 
                              color: '#7f8c8d', 
                              fontSize: '0.8rem',
                              display: 'flex',
                              gap: '0.5rem',
                              alignItems: 'center'
                            }}>
                              <span>👤 {autorNombre}</span>
                              <span>•</span>
                              <span>📅 {fechaFormateada}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CU-AG01.5: Documentos */}
          <div className="info-section">
            <h3>Documentos</h3>
            <div style={{ 
              padding: '0.5rem',
              background: '#f8f9fa',
              borderRadius: '6px',
              fontSize: '0.9rem'
            }}>
              <p style={{ color: '#7f8c8d', fontStyle: 'italic', marginBottom: '0.75rem' }}>
                Los documentos del paciente se pueden ver en su historia clínica.
              </p>
              {turno.Paciente?.id && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => window.location.href = `/pacientes/${turno.Paciente.id}/historia-clinica`}
                    style={{
                      padding: '0.5rem 1rem',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    📋 Ver Historia Clínica
                  </button>
                </div>
              )}
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

          {mostrandoConfirmacion === 'nota' && (
            <div className="confirmacion-form">
              <h4>Agregar Nota</h4>
              <label>
                Nota *:
                <textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  placeholder="Ingrese notas sobre la consulta, observaciones, recomendaciones, etc..."
                  rows="4"
                  required
                />
              </label>
              <div className="form-actions">
                <button className="btn-cancelar" onClick={() => {
                  setMostrandoConfirmacion(null);
                  setNota('');
                }}>
                  Cancelar
                </button>
                <button className="btn-confirmar" onClick={async () => {
                  if (!nota.trim()) {
                    showToast('Por favor ingrese una nota', 'error');
                    return;
                  }
                  try {
                    await agendaApi.crearNota(turno.id, nota);
                    showToast('Nota agregada correctamente', 'success');
                    setNota('');
                    setMostrandoConfirmacion(null);
                    onSuccess(); // Refrescar los datos
                  } catch (error) {
                    handleApiError(error, showToast);
                  }
                }}>
                  Guardar Nota
                </button>
              </div>
            </div>
          )}
        </div>

        {/* CU-AG01.5: Mensaje informativo para odontólogos */}
        {esPendiente && esOdontologo && (
          <div className="modal-footer-info">
            <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
              Como odontólogo, puedes ver los detalles del turno pero no puedes modificarlo. 
              Contacta a recepción para realizar cambios.
            </p>
          </div>
        )}

        {!esPendiente && !esOdontologo && (
          <div className="modal-footer-info">
            <p>Este turno ya no está pendiente y no puede ser modificado.</p>
          </div>
        )}
        
        {!esPendiente && esOdontologo && (
          <div className="modal-footer-info">
            <p>Este turno ya no está pendiente.</p>
          </div>
        )}
      </div>
    </div>
  );
}

