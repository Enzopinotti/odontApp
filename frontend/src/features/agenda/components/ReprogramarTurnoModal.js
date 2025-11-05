// src/features/agenda/components/ReprogramarTurnoModal.js
import { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { useReprogramarTurno, useSlotsDisponibles } from '../hooks/useTurnos';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';

export default function ReprogramarTurnoModal({ turno, onClose, onSuccess }) {
  const { showToast } = useToast();
  const reprogramarTurno = useReprogramarTurno();

  // Estado del formulario
  const [fecha, setFecha] = useState('');
  const [horaSeleccionada, setHoraSeleccionada] = useState('');
  const [odontologoId, setOdontologoId] = useState(turno?.odontologoId || '');

  // Queries
  const { data: odontologos = [], isLoading: loadingOdontologos } = useOdontologosPorEspecialidad();
  const { data: slots = [], isLoading: loadingSlots } = useSlotsDisponibles(
    fecha,
    odontologoId,
    turno?.duracion || 30
  );

  useEffect(() => {
    // Pre-cargar fecha y odontólogo del turno original
    if (turno) {
      const fechaOriginal = new Date(turno.fechaHora);
      setFecha(fechaOriginal.toISOString().split('T')[0]);
      setOdontologoId(turno.odontologoId);
    }
  }, [turno]);

  const formatearHora = (hora) => {
    return hora.substring(0, 5); // HH:MM
  };

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
      handleApiError(error, showToast);
    }
  };

  const obtenerFechaMinima = () => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-reprogramar" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <FaCalendarAlt /> Reprogramar Turno
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
                  setOdontologoId(e.target.value);
                  setHoraSeleccionada(''); // Reset hora al cambiar odontólogo
                }}
                required
                disabled={loadingOdontologos}
              >
                <option value="">Seleccione un odontólogo</option>
                {odontologos.map((odontologo) => (
                  <option key={odontologo.id} value={odontologo.id}>
                    Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                  </option>
                ))}
              </select>
            </div>

            {/* Selección de fecha */}
            <div className="form-group">
              <label htmlFor="fecha">
                <FaCalendarAlt /> Nueva Fecha:
              </label>
              <input
                type="date"
                id="fecha"
                value={fecha}
                onChange={(e) => {
                  setFecha(e.target.value);
                  setHoraSeleccionada(''); // Reset hora al cambiar fecha
                }}
                min={obtenerFechaMinima()}
                required
              />
            </div>

            {/* Selección de hora (slots disponibles) */}
            {fecha && odontologoId && (
              <div className="form-group">
                <label htmlFor="hora">
                  <FaClock /> Horarios Disponibles:
                </label>
                {loadingSlots ? (
                  <p className="loading-text">Cargando horarios...</p>
                ) : slots.length > 0 ? (
                  <div className="slots-grid">
                    {slots.map((slot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`slot-btn ${horaSeleccionada === slot.horaInicio ? 'selected' : ''}`}
                        onClick={() => setHoraSeleccionada(slot.horaInicio)}
                      >
                        {formatearHora(slot.horaInicio)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="no-slots-text">No hay horarios disponibles para esta fecha</p>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="modal-footer">
              <button type="button" className="btn-cancelar" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-confirmar"
                disabled={!horaSeleccionada || reprogramarTurno.isPending}
              >
                {reprogramarTurno.isPending ? 'Reprogramando...' : 'Reprogramar Turno'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

