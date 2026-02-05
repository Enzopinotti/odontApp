// src/features/agenda/components/DetallesTurnoModal.js
import { useState, useMemo } from 'react';
import ReprogramarTurnoModal from './ReprogramarTurnoModal';
import EditarTurnoModal from './EditarTurnoModal';
import { useCrearNota, useActualizarNota, useEliminarNota } from '../hooks/useTurnos';
import { FaTimes, FaCheck, FaTrash, FaTimes as FaTimesCircle, FaCalendarAlt, FaBan, FaInfoCircle, FaEdit, FaStickyNote, FaUser, FaClock, FaSave } from 'react-icons/fa';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import * as agendaApi from '../../../api/agenda';
import { useNavigate } from 'react-router-dom';

export default function DetallesTurnoModal({ turno, onClose, onSuccess }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user } = useAuth();

  // CU-AG01.5: Verificar si el usuario es odontólogo
  const esOdontologo = useMemo(() => {
    return user?.Rol?.nombre?.toUpperCase() === 'ODONTÓLOGO';
  }, [user]);
  const [mostrandoConfirmacion, setMostrandoConfirmacion] = useState(null); // 'asistencia', 'ausencia', 'cancelar', 'nota'
  const [mostrandoModal, setMostrandoModal] = useState(null); // 'reprogramar', 'editar'
  const [motivo, setMotivo] = useState('');
  const [nota, setNota] = useState('');

  const marcarAsistencia = useMarcarAsistencia();
  const marcarAusencia = useMarcarAusencia();
  const cancelarTurno = useCancelarTurno();
  const crearNotaMutation = useCrearNota();
  const eliminarNotaMutation = useEliminarNota();
  const actualizarNotaMutation = useActualizarNota();

  const [editandoNotaId, setEditandoNotaId] = useState(null);
  const [descripcionEditada, setDescripcionEditada] = useState('');

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
          <h2 style={{ fontWeight: '850' }}>
            <FaInfoCircle style={{ marginRight: '0.5rem' }} /> Detalles del Turno
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

          {/* CU-AG01.5: Historial de notas del turno */}
          {turno.Paciente?.id && (
            <div className="info-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Notas del Turno</h3>
                {!esOdontologo && esPendiente && !mostrandoConfirmacion && (
                  <button
                    className="btn-accion btn-nota"
                    onClick={() => setMostrandoConfirmacion('nota')}
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                  >
                    <FaPlus /> Agregar Nota
                  </button>
                )}
              </div>

              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '0.5rem',
                background: '#f8f9fa',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {turno.Notas && turno.Notas.length > 0 ? (
                  turno.Notas.map((nota, idx) => {
                    const esAutor = user?.id === nota.usuarioId;
                    const autorNombre = nota.Usuario
                      ? `${nota.Usuario.nombre} ${nota.Usuario.apellido}`
                      : 'Usuario';
                    const fechaNota = new Date(nota.createdAt);
                    const fechaFormateada = fechaNota.toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    const isEditing = editandoNotaId === nota.id;

                    return (
                      <div key={nota.id || idx} style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        position: 'relative'
                      }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <textarea
                              value={descripcionEditada}
                              onChange={(e) => setDescripcionEditada(e.target.value)}
                              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #145c63' }}
                              rows="3"
                            />
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => setEditandoNotaId(null)}
                                className="btn-cancelar"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await actualizarNotaMutation.mutateAsync({ id: nota.id, descripcion: descripcionEditada });
                                    showToast('Nota actualizada', 'success');
                                    setEditandoNotaId(null);
                                    onSuccess();
                                  } catch (err) { handleApiError(err, showToast); }
                                }}
                                className="btn-confirmar"
                                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: '#145c63' }}
                              >
                                <FaSave /> Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div style={{ color: '#334155', fontWeight: '500', marginBottom: '0.75rem', fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                              {nota.descripcion}
                            </div>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              fontSize: '0.75rem',
                              color: '#94a3b8'
                            }}>
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <span><FaUser style={{ marginRight: '3px' }} /> {autorNombre}</span>
                                <span><FaClock style={{ marginRight: '3px' }} /> {fechaFormateada}</span>
                              </div>

                              {(esAutor || user?.Rol?.nombre?.toUpperCase() === 'ADMINISTRADOR') && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button
                                    onClick={() => {
                                      setEditandoNotaId(nota.id);
                                      setDescripcionEditada(nota.descripcion);
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#145c63', cursor: 'pointer' }}
                                    title="Editar"
                                  >
                                    <FaEdit size={14} />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (window.confirm('¿Desea eliminar esta nota?')) {
                                        try {
                                          await eliminarNotaMutation.mutateAsync(nota.id);
                                          showToast('Nota eliminada', 'success');
                                          onSuccess();
                                        } catch (err) { handleApiError(err, showToast); }
                                      }
                                    }}
                                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                                    title="Eliminar"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', padding: '1rem' }}>
                    No hay notas registradas para este turno.
                  </p>
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
                    onClick={() => navigate(`/pacientes/${turno.Paciente.id}`)}
                    className="btn-secondary"
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontWeight: '600'
                    }}
                  >
                    📋 Ver Ficha del Paciente
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
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                El paciente recibirá una notificación automática sobre la cancelación de su turno.
              </p>
              <label>
                Motivo *:
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Explique el motivo de la cancelación..."
                  rows="3"
                  required
                />
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#145c63' }}>
                <input type="checkbox" checked readOnly id="notifyPatient" />
                <label htmlFor="notifyPatient" style={{ fontWeight: '600', margin: 0 }}>Notificar al paciente por email/WhatsApp</label>
              </div>

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
                    await crearNotaMutation.mutateAsync({ turnoId: turno.id, descripcion: nota });
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

      {(marcarAsistencia.isLoading || marcarAusencia.isLoading || cancelarTurno.isLoading || crearNotaMutation.isPending || eliminarNotaMutation.isPending || actualizarNotaMutation.isPending) && (
        <div className="pacientes-loader" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10001,
          backdropFilter: 'blur(3px)'
        }}>
          <Lottie animationData={loadingAnim} loop autoplay style={{ width: 180 }} />
          <p>Actualizando...</p>
        </div>
      )}
    </div>
  );
}

