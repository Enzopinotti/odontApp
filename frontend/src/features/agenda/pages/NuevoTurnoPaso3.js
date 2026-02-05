// src/features/agenda/pages/NuevoTurnoPaso3.js
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCrearTurno } from '../hooks/useTurnos';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import BackBar from '../../../components/BackBar';
import ConflictoTurnoModal from '../components/ConflictoTurnoModal';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import { FaCheck } from 'react-icons/fa';
import '../../../styles/agenda.scss';

export default function NuevoTurnoPaso3() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { fechaHora, tratamiento, odontologoId, duracion: duracionInicial, paciente, datosPaciente } = location.state || {};

  const [motivo, setMotivo] = useState(tratamiento?.nombre || '');
  const [duracion, setDuracion] = useState(Number(duracionInicial) || 30);
  const [conflicto, setConflicto] = useState(null);
  const [mostrarModalConflicto, setMostrarModalConflicto] = useState(false);

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
    // Validar duración (múltiplos de 5 minutos, max 8hs)
    if (!duracion || duracion % 5 !== 0 || duracion > 480) {
      showToast('La duración debe ser un múltiplo de 5 minutos (máximo 8 horas)', 'error');
      return;
    }

    // Validar duración mínima según el tratamiento (RN-AG03.1)
    const duracionMinimaTratamiento = tratamiento?.duracionMin || tratamiento?.duracion || 0;
    if (duracion < duracionMinimaTratamiento) {
      showToast(`La duración para ${tratamiento?.nombre} no puede ser menor a ${duracionMinimaTratamiento} minutos`, 'error');
      return;
    }

    // Validar motivo (1-255 caracteres)
    if (!motivo || motivo.trim().length === 0 || motivo.length > 255) {
      showToast('El motivo es requerido y debe tener entre 1 y 255 caracteres', 'error');
      return;
    }

    // Log de datos a enviar
    const fechaHoraObj = new Date(fechaHora);
    const fechaStr = fechaHoraObj.toISOString().split('T')[0];
    const horaInicioStr = fechaHoraObj.toTimeString().slice(0, 5);
    const fechaFinObj = new Date(fechaHoraObj.getTime() + duracion * 60000);
    const horaFinStr = fechaFinObj.toTimeString().slice(0, 5);

    console.log('[NuevoTurnoPaso3] Datos a enviar al backend:', {
      fechaHora,
      fechaHoraObj,
      fechaStr,
      horaInicioStr,
      horaFinStr,
      duracion,
      odontologoId,
      pacienteId: paciente.id,
      motivo: motivo.trim()
    });

    try {
      await crearTurno.mutateAsync({
        fechaHora: fechaHora,
        duracion: duracion,
        motivo: motivo.trim(),
        pacienteId: paciente.id,
        odontologoId: odontologoId,
        generarRecordatorio: datosPaciente?.generarRecordatorio || false,
      });

      showToast('Turno creado exitosamente', 'success');
      navigate('/agenda');
    } catch (error) {
      // CU-AG01.2: Manejar conflictos de horario
      const res = error?.response;
      if (res?.status === 409) {
        const { code, message, metadata } = res.data || {};

        // Si el error es de horario no disponible, es un error crítico
        // porque solo mostramos horarios disponibles
        if (code === 'HORARIO_NO_DISPONIBLE') {
          console.error('[NuevoTurnoPaso3] ERROR CRÍTICO: Horario no disponible aunque se mostró como disponible:', {
            fechaHora,
            fechaStr,
            horaInicioStr,
            horaFinStr,
            duracion,
            odontologoId
          });
          showToast('Error: El horario seleccionado no está disponible. Por favor, vuelva a seleccionar fecha y horario.', 'error');
          // Redirigir al paso 1 para que seleccione nuevamente
          setTimeout(() => {
            navigate('/agenda/turnos/nuevo');
          }, 2000);
          return;
        }

        if (code === 'SOLAPAMIENTO_TURNO' && metadata) {
          console.error('[NuevoTurnoPaso3] ERROR CRÍTICO: Solapamiento aunque se validó:', {
            fechaHora,
            fechaStr,
            horaInicioStr,
            horaFinStr,
            duracion,
            odontologoId,
            metadata
          });
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

  const handleCambiarOdontologo = async (nuevoOdontologo) => {
    try {
      await crearTurno.mutateAsync({
        fechaHora: fechaHora,
        duracion: duracion,
        motivo: motivo.trim(),
        pacienteId: paciente.id,
        odontologoId: nuevoOdontologo.userId,
        generarRecordatorio: datosPaciente?.generarRecordatorio || false,
      });

      showToast('Turno creado exitosamente con el odontólogo alternativo', 'success');
      navigate('/agenda');
    } catch (error) {
      handleApiError(error, showToast);
    }
  };

  const handleReprogramar = async (nuevoSlot) => {
    try {
      await crearTurno.mutateAsync({
        fechaHora: nuevoSlot.fechaHora,
        duracion: duracion,
        motivo: motivo.trim(),
        pacienteId: paciente.id,
        odontologoId: odontologoId,
        generarRecordatorio: datosPaciente?.generarRecordatorio || false,
      });

      showToast('Turno creado exitosamente en el nuevo horario', 'success');
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
        <div className="step-item completed">
          <div className="step-circle completed"><FaCheck /></div>
          <div className="step-label">Fecha y Tratamiento</div>
        </div>
        <div className="step-item completed">
          <div className="step-circle completed"><FaCheck /></div>
          <div className="step-label">Datos</div>
        </div>
        <div className="step-item active">
          <div className="step-circle active"><FaCheck /></div>
          <div className="step-label active">Confirmar</div>
        </div>
      </div>

      <div className="nuevo-turno-form">
        <h2>Confirmar turno</h2>

        {/* CU-AG01.2: Campos editables para motivo y duración */}
        <div className="form-section" style={{ marginBottom: '2rem' }}>
          <label className="form-label">
            Motivo de la consulta <span style={{ color: 'red' }}>*</span>
          </label>
          <input
            type="text"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="Ingrese el motivo de la consulta"
            className="form-input"
            maxLength={255}
            style={{ width: '100%' }}
          />
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
            {motivo.length}/255 caracteres
          </div>
        </div>

        <div className="form-section" style={{ marginBottom: '2rem' }}>
          <label className="form-label">
            Duración (minutos) <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <input
              type="number"
              value={duracion}
              onChange={(e) => setDuracion(parseInt(e.target.value) || 0)}
              min={tratamiento?.duracionMin || tratamiento?.duracion || 5}
              max="480"
              step="5"
              className="form-input"
              style={{ width: '120px' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {[30, 60, 90, 120]
                .filter(val => val >= (tratamiento?.duracionMin || tratamiento?.duracion || 0))
                .map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDuracion(val)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: duracion === val ? '#145c63' : 'white',
                      color: duracion === val ? 'white' : '#64748b',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    {val}m
                  </button>
                ))}
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
            Mínimo {tratamiento?.duracionMin || tratamiento?.duracion || 5} min para este tratamiento
          </div>
        </div>

        <div className="resumen-turno">
          <div className="resumen-card">
            <div className="resumen-title">Datos de la atención</div>
            <div className="resumen-item">
              <div className="resumen-label">Tratamiento</div>
              <div className="resumen-value">{tratamiento?.nombre || 'No especificado'}</div>
            </div>
            <div className="resumen-item">
              <div className="resumen-label">Duración</div>
              <div className="resumen-value">{duracion} minutos</div>
            </div>
            <div className="resumen-item">
              <div className="resumen-label">Motivo</div>
              <div className="resumen-value">{motivo || 'No especificado'}</div>
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
          disabled={crearTurno.isLoading}
        >
          Volver
        </button>
        <button
          className="btn-primary"
          onClick={handleConfirmar}
          disabled={crearTurno.isLoading}
        >
          {crearTurno.isLoading ? 'Confirmando...' : 'Confirmar'}
        </button>
      </div>

      {crearTurno.isLoading && (
        <div className="pacientes-loader" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <Lottie animationData={loadingAnim} loop autoplay style={{ width: 200 }} />
          <p style={{ marginTop: '1rem', fontWeight: '850', color: '#145c63', fontSize: '1.2rem' }}>
            Agendando turno...
          </p>
        </div>
      )}

      {/* CU-AG01.2: Modal de conflicto de horario */}
      <ConflictoTurnoModal
        isOpen={mostrarModalConflicto}
        onClose={() => {
          setMostrarModalConflicto(false);
          setConflicto(null);
        }}
        conflicto={conflicto}
        onCambiarOdontologo={handleCambiarOdontologo}
        onReprogramar={handleReprogramar}
        fechaHoraOriginal={fechaHora}
        duracion={duracion || 30}
      />
    </div>
  );
}

