// src/features/agenda/pages/NuevoTurnoPaso1.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTratamientos, useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useSlotsDisponibles } from '../hooks/useTurnos';
import BackBar from '../../../components/BackBar';
import '../../../styles/agenda.scss';

export default function NuevoTurnoPaso1() {
  const navigate = useNavigate();
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [odontologoId, setOdontologoId] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  
  const { data: tratamientos, isLoading: tratamientosLoading } = useTratamientos();
  const { data: odontologos, isLoading: odontologosLoading } = useOdontologosPorEspecialidad(
    tratamientoSeleccionado?.especialidad
  );
  const { data: slots, isLoading: slotsLoading } = useSlotsDisponibles(
    fecha,
    odontologoId,
    tratamientoSeleccionado?.duracion || 30
  );

  // Auto-seleccionar primer odontólogo si hay disponibles
  useEffect(() => {
    if (odontologos && Array.isArray(odontologos) && odontologos.length > 0 && !odontologoId) {
      setOdontologoId(odontologos[0].userId);
    }
  }, [odontologos, odontologoId]);

  const handleSiguiente = () => {
    if (!tratamientoSeleccionado || !horarioSeleccionado || !odontologoId) {
      alert('Por favor completa todos los campos');
      return;
    }

    const fechaHora = new Date(`${fecha}T${horarioSeleccionado}`);
    
    navigate('/agenda/turnos/nuevo/paso2', {
      state: {
        fechaHora: fechaHora.toISOString(),
        tratamiento: tratamientoSeleccionado,
        odontologoId,
        duracion: tratamientoSeleccionado.duracion || 30,
      },
    });
  };

  return (
    <div className="nuevo-turno-container">
      <BackBar title="Nuevo turno" subtitle="Elegir fecha y tratamiento" to="/agenda" />
      
      <div className="nuevo-turno-steps">
        <div className="step active">
          <div className="step-circle active">1</div>
          <div className="step-label active">Fecha y Tratamiento</div>
        </div>
        <div className="step">
          <div className="step-circle">2</div>
          <div className="step-label">Datos</div>
        </div>
        <div className="step">
          <div className="step-circle">3</div>
          <div className="step-label">Confirmar</div>
        </div>
      </div>

      <div className="nuevo-turno-form">
        <div className="form-section">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="form-input"
          />
        </div>

        <div className="form-section">
          <label className="form-label">Tratamientos</label>
          {tratamientosLoading ? (
            <div>Cargando tratamientos...</div>
          ) : (
            <div className="tratamientos-grid">
              {tratamientos?.map(tratamiento => (
                <div
                  key={tratamiento.id}
                  className={`tratamiento-card ${
                    tratamientoSeleccionado?.id === tratamiento.id ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setTratamientoSeleccionado(tratamiento);
                    setOdontologoId(null); // Reset odontólogo al cambiar tratamiento
                  }}
                >
                  <div className="tratamiento-nombre">{tratamiento.nombre}</div>
                  <div className="tratamiento-duracion">
                    {tratamiento.duracion || 30} min
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {tratamientoSeleccionado && (
          <div className="form-section">
            <label className="form-label">Odontólogo</label>
            {odontologosLoading ? (
              <div>Cargando odontólogos...</div>
            ) : (
              <select
                value={odontologoId || ''}
                onChange={(e) => setOdontologoId(Number(e.target.value))}
                className="form-input"
              >
                <option value="">Seleccione un odontólogo</option>
                {odontologos?.map(odonto => (
                  <option key={odonto.userId} value={odonto.userId}>
                    {odonto.Usuario?.nombre} {odonto.Usuario?.apellido}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {odontologoId && (
          <div className="form-section">
            <label className="form-label">Horarios disponibles</label>
            {slotsLoading ? (
              <div>Cargando horarios...</div>
            ) : (
              <div className="horarios-disponibles">
                {slots?.map((slot, idx) => {
                  const slotHora = typeof slot === 'string' ? slot : slot.inicio;
                  return (
                    <div
                      key={idx}
                      className={`horario-slot ${
                        horarioSeleccionado === slotHora ? 'selected' : ''
                      }`}
                      onClick={() => setHorarioSeleccionado(slotHora)}
                    >
                      {slotHora}
                    </div>
                  );
                })}
                {(!slots || slots.length === 0) && (
                  <div className="empty-state">
                    No hay horarios disponibles para esta fecha
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="nuevo-turno-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate('/agenda')}
        >
          Volver
        </button>
        <button
          className="btn-primary"
          onClick={handleSiguiente}
          disabled={!tratamientoSeleccionado || !horarioSeleccionado || !odontologoId}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

