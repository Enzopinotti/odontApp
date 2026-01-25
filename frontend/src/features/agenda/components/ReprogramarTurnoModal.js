// src/features/agenda/components/ReprogramarTurnoModal.js
import { useState, useEffect, useMemo } from 'react';
import { FaTimes, FaCalendarAlt, FaClock, FaExclamationTriangle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useReprogramarTurno, useSlotsDisponibles, useCancelarTurno, useTurnosPorFecha } from '../hooks/useTurnos';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import useToast from '../../../hooks/useToast';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import { handleApiError } from '../../../utils/handleApiError';
import ConflictoTurnoModal from './ConflictoTurnoModal';

export default function ReprogramarTurnoModal({ turno, onClose, onSuccess }) {
  const { showToast } = useToast();
  const reprogramarTurno = useReprogramarTurno();
  const cancelarTurno = useCancelarTurno();
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Estado del formulario
  const [mesActual, setMesActual] = useState(new Date());
  const [fecha, setFecha] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [odontologoId, setOdontologoId] = useState(turno?.odontologoId || '');

  // CU-AG01.3: Estado para manejar conflictos y opción "Paciente no acepta"
  const [conflicto, setConflicto] = useState(null);
  const [mostrarModalConflicto, setMostrarModalConflicto] = useState(false);
  const [mostrarOpcionRechazo, setMostrarOpcionRechazo] = useState(false);

  const fechaInicioMes = useMemo(() => {
    const inicio = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    return inicio.toISOString().split('T')[0];
  }, [mesActual]);

  const fechaFinMes = useMemo(() => {
    const fin = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    return fin.toISOString().split('T')[0];
  }, [mesActual]);

  // Queries
  const { data: odontologos = [], isLoading: loadingOdontologos } = useOdontologosPorEspecialidad();
  const { data: slots = [], isLoading: loadingSlots } = useSlotsDisponibles(
    fecha,
    odontologoId,
    turno?.duracion || 30
  );
  const { data: disponibilidadesMes } = useDisponibilidadesSemanal(fechaInicioMes, fechaFinMes);
  const { data: disponibilidadesDia } = useDisponibilidadesSemanal(
    fecha || fechaInicioMes,
    fecha || fechaInicioMes
  );
  const { data: turnosDiaData } = useTurnosPorFecha(
    fecha && odontologoId ? fecha : null,
    fecha && odontologoId ? odontologoId : null
  );

  const diasConDisponibilidad = useMemo(() => {
    if (!disponibilidadesMes || !odontologoId) return new Set();
    const dias = new Set();
    disponibilidadesMes.forEach((disp) => {
      const odontId = disp.odontologoId ?? disp.odontologo?.id ?? disp.odontologo?.userId;
      if (
        odontId === Number(odontologoId) &&
        disp.tipo === 'LABORAL' &&
        disp.fecha
      ) {
        const fechaLocal = parseFechaSinTZ(disp.fecha);
        if (fechaLocal) {
          dias.add(fechaLocal.getDate());
        }
      }
    });
    return dias;
  }, [disponibilidadesMes, odontologoId]);

  const diasDelMes = useMemo(() => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();
    const dias = [];

    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }

    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaCompleta = new Date(año, mes, dia);
      const añoStr = String(año);
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaStr = `${añoStr}-${mesStr}-${diaStr}`;
      const esPasado = fechaCompleta < new Date(new Date().setHours(0, 0, 0, 0));

      dias.push({
        numero: dia,
        fecha: fechaStr,
        esPasado,
        esSeleccionado: fecha === fechaStr,
        tieneDisponibilidad: diasConDisponibilidad.has(dia)
      });
    }

    return dias;
  }, [mesActual, diasConDisponibilidad, fecha]);

  const turnosDelDia = useMemo(() => {
    if (!fecha) return [];
    if (!turnosDiaData) return [];
    if (Array.isArray(turnosDiaData)) return turnosDiaData;
    if (turnosDiaData.data) return Array.isArray(turnosDiaData.data) ? turnosDiaData.data : [];
    if (turnosDiaData.rows) return turnosDiaData.rows;
    return [];
  }, [turnosDiaData]);

  const horariosOcupados = useMemo(() => {
    return turnosDelDia
      .filter(turnoItem => turnoItem.estado !== 'CANCELADO')
      .map(turnoItem => {
        const inicio = new Date(turnoItem.fechaHora).toTimeString().slice(0, 5);
        const fin = new Date(new Date(turnoItem.fechaHora).getTime() + (turnoItem.duracion || 30) * 60000)
          .toTimeString()
          .slice(0, 5);
        return {
          inicio,
          fin,
          id: turnoItem.id
        };
      });
  }, [turnosDelDia]);

  const slotsDisponibles = useMemo(() => {
    if (!fecha) return [];
    return slots
      .filter(slot => {
        const inicio = slot.horaInicio || slot.inicio;
        const inicioMin = horaStringToMinutes(inicio);
        return !horariosOcupados.some(
          (ocupado) =>
            inicioMin >= horaStringToMinutes(ocupado.inicio) &&
            inicioMin < horaStringToMinutes(ocupado.fin)
        );
      })
      .map(slot => ({
        inicio: slot.horaInicio || slot.inicio,
        fin: slot.horaFin || slot.fin || null
      }));
  }, [slots, horariosOcupados]);

  useEffect(() => {
    // Pre-cargar fecha y odontólogo del turno original
    if (turno) {
      const fechaOriginal = new Date(turno.fechaHora);
      setFecha(fechaOriginal.toISOString().split('T')[0]);
      setOdontologoId(turno.odontologoId || '');
      setMesActual(new Date(fechaOriginal.getFullYear(), fechaOriginal.getMonth(), 1));
    }
  }, [turno]);

  const formatearHora = (hora) => {
    if (!hora || typeof hora !== 'string') return '';
    return hora.substring(0, 5); // HH:MM
  };

  function horaStringToMinutes(hora) {
    if (!hora) return 0;
    const [h, m] = hora.split(':');
    return parseInt(h, 10) * 60 + parseInt(m, 10);
  }

  function parseFechaSinTZ(fechaStr) {
    if (!fechaStr || typeof fechaStr !== 'string') return null;
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return null;
    const [anio, mes, dia] = partes.map(Number);
    if (Number.isNaN(anio) || Number.isNaN(mes) || Number.isNaN(dia)) return null;
    return new Date(anio, mes - 1, dia, 12, 0, 0, 0);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fecha || !horaSeleccionada) {
      showToast('Por favor selecciona fecha y hora', 'error');
      return;
    }

    try {
      // Construir nueva fecha-hora
      const nuevaFechaHora = `${fecha}T${horaSeleccionada}:00`;

      await reprogramarTurno.mutateAsync({
        id: turno.id,
        nuevaFechaHora
      });

      showToast('Turno reprogramado exitosamente', 'success');
      onSuccess();
    } catch (error) {
      // CU-AG01.3: Manejar conflictos de horario
      const res = error?.response;
      if (res?.status === 409) {
        const { code, message, metadata } = res.data || {};
        if ((code === 'SOLAPAMIENTO_TURNO' || code === 'HORARIO_NO_DISPONIBLE') && metadata) {
          setConflicto({
            message: message || 'Conflicto de horario',
            ...metadata
          });
          setMostrarModalConflicto(true);
          return;
        }
      }

      // Otros errores se manejan normalmente
      handleApiError(error, showToast);
    }
  };

  // CU-AG01.3: Manejar cambio de odontólogo desde conflicto
  const handleCambiarOdontologo = async (nuevoOdontologo) => {
    if (!fecha || !horaSeleccionada) {
      showToast('Por favor selecciona fecha y hora', 'error');
      return;
    }

    try {
      const nuevaFechaHora = `${fecha}T${horaSeleccionada}:00`;

      // Reprogramar con el nuevo odontólogo
      await reprogramarTurno.mutateAsync({
        id: turno.id,
        nuevaFechaHora,
        odontologoId: nuevoOdontologo.userId
      });

      showToast('Turno reprogramado con el odontólogo alternativo', 'success');
      onSuccess();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  // CU-AG01.3: Manejar reprogramación con slot alternativo
  const handleReprogramarConSlot = async (slot) => {
    try {
      await reprogramarTurno.mutateAsync({
        id: turno.id,
        nuevaFechaHora: slot.fechaHora
      });

      showToast('Turno reprogramado exitosamente', 'success');
      onSuccess();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  // CU-AG01.3 Flujo Alternativo 5a: Paciente rechaza reprogramación
  const handlePacienteNoAcepta = () => {
    setMostrarOpcionRechazo(true);
  };

  const handleMantenerTurno = () => {
    showToast('El turno se mantiene en su fecha original', 'info');
    onClose();
  };

  const handleCancelarTurno = async () => {
    try {
      await cancelarTurno.mutateAsync({
        id: turno.id,
        motivo: 'Paciente no aceptó la reprogramación'
      });
      showToast('Turno cancelado', 'success');
      onSuccess();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  const cambiarMes = (direccion) => {
    setMesActual((prev) => {
      const nueva = new Date(prev);
      nueva.setMonth(prev.getMonth() + direccion);
      return nueva;
    });
  };

  const irMesActual = () => {
    setMesActual(new Date());
  };

  const handleSeleccionDia = (dia) => {
    if (!dia || dia.esPasado || !dia.tieneDisponibilidad) return;
    setFecha(dia.fecha);
    setHoraSeleccionada('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-reprogramar" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ fontWeight: '850' }}>
            <FaCalendarAlt style={{ marginRight: '0.5rem' }} /> Reprogramar Turno
          </h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Información del turno actual */}
          <div className="info-turno-actual">
            <h4>Turno actual:</h4>
            <p><strong>Paciente:</strong> {turno?.Paciente?.nombre} {turno?.Paciente?.apellido}</p>
            <p>
              <strong>Fecha/Hora:</strong>{' '}
              {new Date(turno?.fechaHora).toLocaleString('es-AR', {
                day: '2-digit',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            <p><strong>Duración:</strong> {turno?.duracion} minutos</p>
            <p><strong>Motivo:</strong> {turno?.motivo}</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="form-reprogramar">
            {/* Selección de odontólogo */}
            <div className="form-group">
              <label htmlFor="odontologo">
                <FaClock /> Odontólogo:
              </label>
              <select
                id="odontologo"
                value={odontologoId}
                onChange={(e) => {
                  const value = e.target.value;
                  setOdontologoId(value ? Number(value) : '');
                  setHoraSeleccionada(''); // Reset hora al cambiar odontólogo
                }}
                required
                disabled={loadingOdontologos}
              >
                <option value="">Seleccione un odontólogo</option>
                {odontologos.map((odontologo) => (
                  <option key={odontologo.userId} value={odontologo.userId}>
                    Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                  </option>
                ))}
              </select>
            </div>

            {odontologoId && (
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Calendario similar a crear turno */}
                <div style={{ background: '#fff', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => cambiarMes(-1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#145c63', fontSize: '1.1rem' }}
                    >
                      <FaChevronLeft />
                    </button>
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
                      {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
                    </h3>
                    <button
                      type="button"
                      onClick={() => cambiarMes(1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#145c63', fontSize: '1.1rem' }}
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={irMesActual}
                    style={{
                      width: '100%',
                      padding: '0.35rem 0.5rem',
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: '#f9fafb',
                      fontSize: '0.85rem',
                      marginBottom: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    Ir al mes actual
                  </button>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.5rem' }}>
                    {nombresDias.map((dia) => (
                      <div key={dia} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280' }}>
                        {dia}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
                    {diasDelMes.map((dia, idx) => {
                      if (!dia) return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />;
                      const isDisabled = dia.esPasado || !dia.tieneDisponibilidad;
                      return (
                        <button
                          key={dia.fecha}
                          type="button"
                          onClick={() => handleSeleccionDia(dia)}
                          disabled={isDisabled}
                          style={{
                            aspectRatio: '1',
                            borderRadius: '6px',
                            border: dia.esSeleccionado ? '2px solid #145c63' : '1px solid #e5e7eb',
                            background: dia.esSeleccionado ? '#145c63' : dia.tieneDisponibilidad ? '#e0f2f7' : '#f9fafb',
                            color: dia.esSeleccionado ? 'white' : isDisabled ? '#9ca3af' : '#111827',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            fontWeight: dia.esSeleccionado ? 600 : 500,
                            fontSize: '0.9rem'
                          }}
                        >
                          {dia.numero}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Horarios disponibles */}
                <div>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    <FaClock /> Horarios disponibles
                  </label>
                  {!fecha ? (
                    <p style={{ color: '#6b7280' }}>Selecciona primero una fecha en el calendario.</p>
                  ) : loadingSlots ? (
                    <div className="pacientes-loader" style={{ padding: '1rem', minHeight: '150px' }}>
                      <Lottie animationData={loadingAnim} loop autoplay style={{ width: 100 }} />
                      <p style={{ marginTop: '0.5rem', fontWeight: '850', color: '#145c63', fontSize: '0.9rem' }}>
                        Cargando horarios...
                      </p>
                    </div>
                  ) : slotsDisponibles.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.5rem' }}>
                      {slotsDisponibles.map((slot, idx) => (
                        <button
                          key={`${slot.inicio}-${idx}`}
                          type="button"
                          className={`slot-btn ${horaSeleccionada === slot.inicio ? 'selected' : ''}`}
                          onClick={() => setHoraSeleccionada(slot.inicio)}
                        >
                          {slot.fin ? `${formatearHora(slot.inicio)} - ${formatearHora(slot.fin)}` : formatearHora(slot.inicio)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="no-slots-text">No hay horarios disponibles para esta fecha.</p>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="modal-footer">
              {/* CU-AG01.3 Flujo Alternativo 5a: Opción "Paciente no acepta" */}
              {!mostrarOpcionRechazo ? (
                <>
                  <button type="button" className="btn-cancelar" onClick={onClose}>
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handlePacienteNoAcepta}
                    style={{ marginRight: 'auto' }}
                  >
                    <FaExclamationTriangle /> Paciente no acepta
                  </button>
                  <button
                    type="submit"
                    className="btn-confirmar"
                    disabled={!horaSeleccionada || reprogramarTurno.isPending}
                  >
                    {reprogramarTurno.isPending ? 'Reprogramando...' : 'Reprogramar Turno'}
                  </button>
                </>
              ) : (
                <>
                  <div className="rechazo-opciones">
                    <h4>El paciente no acepta la reprogramación. ¿Qué deseas hacer?</h4>
                    <div className="rechazo-botones">
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={handleMantenerTurno}
                      >
                        Mantener turno original
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={handleCancelarTurno}
                        disabled={cancelarTurno.isPending}
                      >
                        {cancelarTurno.isPending ? 'Cancelando...' : 'Cancelar turno'}
                      </button>
                    </div>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() => setMostrarOpcionRechazo(false)}
                      style={{ marginTop: '1rem' }}
                    >
                      Volver
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* CU-AG01.3: Modal de conflicto con sugerencias */}
      <ConflictoTurnoModal
        isOpen={mostrarModalConflicto}
        onClose={() => {
          setMostrarModalConflicto(false);
          setConflicto(null);
        }}
        conflicto={conflicto}
        onCambiarOdontologo={handleCambiarOdontologo}
        onReprogramar={handleReprogramarConSlot}
        fechaHoraOriginal={turno?.fechaHora}
        duracion={turno?.duracion || 30}
      />

      {(reprogramarTurno.isPending || cancelarTurno.isPending) && (
        <div className="pacientes-loader" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.7)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <Lottie animationData={loadingAnim} loop autoplay style={{ width: 180 }} />
          <p style={{ marginTop: '1rem', fontWeight: '850', color: '#145c63' }}>Procesando...</p>
        </div>
      )}
    </div>
  );
}

