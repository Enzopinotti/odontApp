// src/features/agenda/components/EditarTurnoModal.js
import { useState, useEffect } from 'react';
import { FaTimes, FaEdit, FaClock, FaFileAlt } from 'react-icons/fa';
import { useActualizarTurno } from '../hooks/useTurnos';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';

export default function EditarTurnoModal({ turno, onClose, onSuccess }) {
  const { showToast } = useToast();
  const actualizarTurno = useActualizarTurno();

  // Estado del formulario
  const [motivo, setMotivo] = useState('');
  const [duracion, setDuracion] = useState(30);
  const [observaciones, setObservaciones] = useState('');

  useEffect(() => {
    // Pre-cargar datos del turno
    if (turno) {
      setMotivo(turno.motivo || '');
      setDuracion(turno.duracion || 30);
      setObservaciones(turno.observaciones || '');
    }
  }, [turno]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!motivo.trim()) {
      showToast('El motivo es obligatorio', 'error');
      return;
    }

    if (duracion < 15 || duracion > 120) {
      showToast('La duración debe estar entre 15 y 120 minutos', 'error');
      return;
    }

    try {
      await actualizarTurno.mutateAsync({
        id: turno.id,
        data: {
          motivo: motivo.trim(),
          duracion: parseInt(duracion),
          observaciones: observaciones.trim()
        }
      });

      showToast('Turno actualizado exitosamente', 'success');
      onSuccess();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  const duracionesComunes = [15, 30, 45, 60, 90, 120];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-editar" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <FaEdit /> Editar Turno
          </h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Información del turno */}
          <div className="info-turno-actual">
            <h4>Turno de:</h4>
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
            <p>
              <strong>Odontólogo:</strong> Dr. {turno?.Odontologo?.Usuario?.nombre} {turno?.Odontologo?.Usuario?.apellido}
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="form-editar">
            {/* Motivo */}
            <div className="form-group">
              <label htmlFor="motivo">
                <FaFileAlt /> Motivo de la Consulta: *
              </label>
              <input
                type="text"
                id="motivo"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ej: Control general, limpieza, dolor de muela..."
                required
                maxLength={200}
              />
            </div>

            {/* Duración */}
            <div className="form-group">
              <label htmlFor="duracion">
                <FaClock /> Duración (minutos): *
              </label>
              <div className="duracion-controls">
                <select
                  id="duracion"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  required
                >
                  {duracionesComunes.map((min) => (
                    <option key={min} value={min}>
                      {min} minutos
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={duracion}
                  onChange={(e) => setDuracion(e.target.value)}
                  min="15"
                  max="120"
                  step="5"
                  className="duracion-input-custom"
                />
              </div>
              <small className="form-hint">Entre 15 y 120 minutos</small>
            </div>

            {/* Observaciones */}
            <div className="form-group">
              <label htmlFor="observaciones">
                <FaFileAlt /> Observaciones (opcional):
              </label>
              <textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales sobre el turno..."
                rows="4"
                maxLength={500}
              />
              <small className="form-hint">{observaciones.length}/500 caracteres</small>
            </div>

            {/* Botones de acción */}
            <div className="modal-footer">
              <button type="button" className="btn-cancelar" onClick={onClose}>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-confirmar"
                disabled={actualizarTurno.isPending}
              >
                {actualizarTurno.isPending ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

