// src/features/agenda/pages/NuevoTurnoPaso3.js
import { useLocation, useNavigate } from 'react-router-dom';
import { useCrearTurno } from '../hooks/useTurnos';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import BackBar from '../../../components/BackBar';
import '../../../styles/agenda.scss';

export default function NuevoTurnoPaso3() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const { fechaHora, tratamiento, odontologoId, duracion, paciente, datosPaciente } = location.state || {};
  
  const crearTurno = useCrearTurno();

  // Si no hay datos de los pasos anteriores, redirigir
  if (!fechaHora || !tratamiento || !odontologoId || !paciente) {
    navigate('/agenda/turnos/nuevo');
    return null;
  }

  const fecha = new Date(fechaHora);
  const fechaFormateada = fecha.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const horaFormateada = fecha.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleConfirmar = async () => {
    try {
      await crearTurno.mutateAsync({
        fechaHora: fechaHora,
        duracion: duracion || 30,
        motivo: tratamiento.nombre,
        pacienteId: paciente.id,
        odontologoId: odontologoId,
        generarRecordatorio: datosPaciente?.generarRecordatorio || false,
      });
      
      showToast('Turno creado exitosamente', 'success');
      navigate('/agenda');
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  return (
    <div className="nuevo-turno-container">
      <BackBar 
        title="Nuevo turno" 
        subtitle="Visualización de datos" 
        to="/agenda/turnos/nuevo/paso2" 
      />
      
      <div className="nuevo-turno-steps">
        <div className="step completed">
          <div className="step-circle completed">✓</div>
          <div className="step-label">Fecha y Tratamiento</div>
        </div>
        <div className="step completed">
          <div className="step-circle completed">✓</div>
          <div className="step-label">Datos</div>
        </div>
        <div className="step active">
          <div className="step-circle active">3</div>
          <div className="step-label active">Confirmar</div>
        </div>
      </div>

      <div className="nuevo-turno-form">
        <h2>Resumen del turno</h2>
        
        <div className="resumen-turno">
          <div className="resumen-card">
            <div className="resumen-title">Datos de la atención</div>
            <div className="resumen-item">
              <div className="resumen-label">Tratamiento</div>
              <div className="resumen-value">{tratamiento.nombre}</div>
            </div>
            <div className="resumen-item">
              <div className="resumen-label">Duración</div>
              <div className="resumen-value">{duracion || 30} minutos</div>
            </div>
          </div>

          <div className="resumen-card">
            <div className="resumen-title">Datos de fecha</div>
            <div className="resumen-item">
              <div className="resumen-label">Fecha</div>
              <div className="resumen-value">{fechaFormateada}</div>
            </div>
            <div className="resumen-item">
              <div className="resumen-label">Hora</div>
              <div className="resumen-value">{horaFormateada}</div>
            </div>
          </div>

          <div className="resumen-card">
            <div className="resumen-title">Datos paciente</div>
            <div className="resumen-item">
              <div className="resumen-label">Nombre</div>
              <div className="resumen-value">
                {paciente.nombre} {paciente.apellido}
              </div>
            </div>
            <div className="resumen-item">
              <div className="resumen-label">DNI</div>
              <div className="resumen-value">{paciente.dni}</div>
            </div>
            {datosPaciente?.telefono && (
              <div className="resumen-item">
                <div className="resumen-label">Teléfono</div>
                <div className="resumen-value">{datosPaciente.telefono}</div>
              </div>
            )}
            {datosPaciente?.email && (
              <div className="resumen-item">
                <div className="resumen-label">Email</div>
                <div className="resumen-value">{datosPaciente.email}</div>
              </div>
            )}
            {datosPaciente?.seguro && (
              <div className="resumen-item">
                <div className="resumen-label">Seguro</div>
                <div className="resumen-value">{datosPaciente.seguro}</div>
              </div>
            )}
            {datosPaciente?.generarRecordatorio && (
              <div className="resumen-item">
                <div className="resumen-label">Recordatorio</div>
                <div className="resumen-value">Sí</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="nuevo-turno-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate('/agenda/turnos/nuevo/paso2')}
        >
          Volver
        </button>
        <button
          className="btn-primary"
          onClick={handleConfirmar}
          disabled={crearTurno.isLoading}
        >
          {crearTurno.isLoading ? 'Creando...' : 'Confirmar'}
        </button>
      </div>
    </div>
  );
}

