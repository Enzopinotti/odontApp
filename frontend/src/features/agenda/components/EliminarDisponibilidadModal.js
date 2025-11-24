// src/features/agenda/components/EliminarDisponibilidadModal.js
import { useState } from 'react';
import { useEliminarDisponibilidad } from '../hooks/useDisponibilidades';
import { useReprogramarTurno } from '../hooks/useTurnos';
import { useCancelarTurno } from '../hooks/useTurnos';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import { FaTimes, FaTrash, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function EliminarDisponibilidadModal({ 
  disponibilidad, 
  turnosFuturos = [],
  onClose, 
  onSuccess 
}) {
  const { showToast } = useToast();
  const [accionSeleccionada, setAccionSeleccionada] = useState('mantener'); // 'mantener' | 'reprogramar' | 'cancelar'
  const [turnosSeleccionados, setTurnosSeleccionados] = useState([]);
  
  const eliminarDisponibilidad = useEliminarDisponibilidad();
  const reprogramarTurno = useReprogramarTurno();
  const cancelarTurno = useCancelarTurno();
  
  const handleToggleTurno = (turnoId) => {
    setTurnosSeleccionados(prev => 
      prev.includes(turnoId) 
        ? prev.filter(id => id !== turnoId)
        : [...prev, turnoId]
    );
  };
  
  const handleEliminar = async () => {
    if (!disponibilidad?.id) return;
    
    try {
      // Si hay turnos futuros y se seleccionó mantener, no eliminar
      if (turnosFuturos.length > 0 && accionSeleccionada === 'mantener') {
        showToast('No se puede eliminar el bloque con turnos futuros', 'warning');
        return;
      }
      
      // Si se seleccionó reprogramar, primero reprogramar los turnos seleccionados
      if (accionSeleccionada === 'reprogramar' && turnosSeleccionados.length > 0) {
        showToast('Por favor, reprograme los turnos manualmente desde la agenda', 'info');
        onClose();
        return;
      }
      
      // Si se seleccionó cancelar, primero cancelar los turnos seleccionados
      if (accionSeleccionada === 'cancelar' && turnosSeleccionados.length > 0) {
        for (const turnoId of turnosSeleccionados) {
          try {
            await cancelarTurno.mutateAsync({ 
              id: turnoId, 
              motivo: 'Bloque de disponibilidad eliminado' 
            });
          } catch (error) {
            console.error(`Error al cancelar turno ${turnoId}:`, error);
          }
        }
        showToast(`${turnosSeleccionados.length} turno(s) cancelado(s)`, 'success');
      }
      
      // Eliminar la disponibilidad
      await eliminarDisponibilidad.mutateAsync(disponibilidad.id);
      showToast('Disponibilidad eliminada exitosamente', 'success');
      onSuccess?.();
      onClose();
    } catch (error) {
      if (error.response?.status === 409) {
        // Error de turnos futuros - ya manejado arriba
        showToast('No se puede eliminar el bloque con turnos futuros. Seleccione una acción.', 'error');
      } else {
        handleApiError(error, showToast);
      }
    }
  };
  
  const isLoading = eliminarDisponibilidad.isPending || 
                    reprogramarTurno.isPending || 
                    cancelarTurno.isPending;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content disponibilidad-conflicto-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaExclamationTriangle style={{ color: '#f59e0b', marginRight: '0.5rem' }} />
            Eliminar Disponibilidad con Turnos Futuros
          </h2>
          <button className="btn-close" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="alerta-conflicto">
            <p>
              <strong>Este bloque de disponibilidad tiene {turnosFuturos.length} turno(s) futuro(s) programado(s).</strong>
            </p>
            <p>Seleccione cómo desea proceder:</p>
          </div>
          
          <div className="opciones-accion" style={{ marginTop: '1.5rem' }}>
            <label className="opcion-radio">
              <input
                type="radio"
                name="accion"
                value="mantener"
                checked={accionSeleccionada === 'mantener'}
                onChange={(e) => setAccionSeleccionada(e.target.value)}
              />
              <span><strong>Mantener el bloque</strong> (no eliminar)</span>
            </label>
            
            <label className="opcion-radio">
              <input
                type="radio"
                name="accion"
                value="reprogramar"
                checked={accionSeleccionada === 'reprogramar'}
                onChange={(e) => setAccionSeleccionada(e.target.value)}
              />
              <span><strong>Reprogramar turnos</strong> (debe hacerlo manualmente desde la agenda)</span>
            </label>
            
            <label className="opcion-radio">
              <input
                type="radio"
                name="accion"
                value="cancelar"
                checked={accionSeleccionada === 'cancelar'}
                onChange={(e) => setAccionSeleccionada(e.target.value)}
              />
              <span><strong>Cancelar turnos</strong> y eliminar el bloque</span>
            </label>
          </div>
          
          {accionSeleccionada === 'cancelar' && turnosFuturos.length > 0 && (
            <div className="turnos-lista" style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ marginBottom: '0.5rem', fontWeight: '500' }}>Seleccione los turnos a cancelar:</p>
              {turnosFuturos.map(turno => {
                const fechaTurno = new Date(turno.fechaHora);
                return (
                  <label key={turno.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={turnosSeleccionados.includes(turno.id)}
                      onChange={() => handleToggleTurno(turno.id)}
                    />
                    <span>
                      <FaCalendarAlt style={{ marginRight: '0.25rem' }} />
                      {fechaTurno.toLocaleDateString('es-AR')} {fechaTurno.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} - 
                      {turno.Paciente?.nombre} {turno.Paciente?.apellido} - {turno.motivo}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button
            type="button"
            className="btn-cancelar"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          
          <button
            type="button"
            className="btn-eliminar"
            onClick={handleEliminar}
            disabled={isLoading || (accionSeleccionada === 'cancelar' && turnosSeleccionados.length === 0)}
          >
            <FaTrash /> {isLoading ? 'Procesando...' : accionSeleccionada === 'mantener' ? 'Cerrar' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}

