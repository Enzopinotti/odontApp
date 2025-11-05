// src/features/agenda/components/DisponibilidadModal.js
import { useState, useEffect } from 'react';
import { 
  useCrearDisponibilidad, 
  useActualizarDisponibilidad, 
  useEliminarDisponibilidad 
} from '../hooks/useDisponibilidades';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import { FaTimes, FaTrash, FaSave } from 'react-icons/fa';

const TIPOS_DISPONIBILIDAD = [
  { value: 'LABORAL', label: 'Horario Laboral', color: '#10b981' },
  { value: 'NOLABORAL', label: 'Bloqueo/No Laboral', color: '#6b7280' }
];

export default function DisponibilidadModal({ 
  disponibilidad, 
  onClose, 
  onSuccess 
}) {
  const { showToast } = useToast();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    tipo: 'LABORAL',
    motivo: '',
    odontologoId: null
  });

  const [errors, setErrors] = useState({});
  
  // Mutaciones
  const crearDisponibilidad = useCrearDisponibilidad();
  const actualizarDisponibilidad = useActualizarDisponibilidad();
  const eliminarDisponibilidad = useEliminarDisponibilidad();
  
  // Cargar datos si es edición
  useEffect(() => {
    if (disponibilidad) {
      setFormData({
        fecha: disponibilidad.fecha || '',
        horaInicio: disponibilidad.horaInicio || '',
        horaFin: disponibilidad.horaFin || '',
        tipo: disponibilidad.tipo || 'LABORAL',
        motivo: disponibilidad.motivo || '',
        odontologoId: disponibilidad.odontologoId || null
      });
    }
  }, [disponibilidad]);
  
  // Validación
  const validarFormulario = () => {
    const newErrors = {};
    
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es requerida';
    }
    
    if (!formData.horaInicio) {
      newErrors.horaInicio = 'La hora de inicio es requerida';
    }
    
    if (!formData.horaFin) {
      newErrors.horaFin = 'La hora de fin es requerida';
    }
    
    if (formData.horaInicio && formData.horaFin) {
      const inicio = new Date(`2000-01-01T${formData.horaInicio}`);
      const fin = new Date(`2000-01-01T${formData.horaFin}`);
      
      if (fin <= inicio) {
        newErrors.horaFin = 'La hora de fin debe ser posterior a la de inicio';
      }
      
      const duracionMinutos = (fin - inicio) / (1000 * 60);
      if (duracionMinutos < 60) {
        newErrors.horaFin = 'La duración mínima es de 1 hora';
      }
    }
    
    if (!formData.odontologoId) {
      newErrors.odontologoId = 'Debe seleccionar un odontólogo';
    }
    
    if (formData.tipo === 'NOLABORAL' && !formData.motivo) {
      newErrors.motivo = 'El motivo es requerido para bloqueos';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo al escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      showToast('Por favor corrige los errores del formulario', 'error');
      return;
    }
    
    try {
      if (disponibilidad?.id) {
        // Actualizar
        await actualizarDisponibilidad.mutateAsync({
          id: disponibilidad.id,
          data: formData
        });
        showToast('Disponibilidad actualizada exitosamente', 'success');
      } else {
        // Crear
        await crearDisponibilidad.mutateAsync(formData);
        showToast('Disponibilidad creada exitosamente', 'success');
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };
  
  const handleEliminar = async () => {
    if (!disponibilidad?.id) return;
    
    if (!window.confirm('¿Estás seguro de eliminar esta disponibilidad?')) {
      return;
    }
    
    try {
      await eliminarDisponibilidad.mutateAsync(disponibilidad.id);
      showToast('Disponibilidad eliminada exitosamente', 'success');
      onSuccess?.();
      onClose();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };
  
  const isLoading = crearDisponibilidad.isPending || 
                    actualizarDisponibilidad.isPending || 
                    eliminarDisponibilidad.isPending;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content disponibilidad-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            {disponibilidad?.id ? 'Editar Disponibilidad' : 'Nueva Disponibilidad'}
          </h2>
          <button className="btn-close" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="disponibilidad-form">
          {/* Fecha */}
          <div className="form-group">
            <label htmlFor="fecha">
              Fecha <span className="required">*</span>
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              disabled={!!disponibilidad?.id} // No editable en modo edición
              className={errors.fecha ? 'error' : ''}
            />
            {errors.fecha && <span className="error-message">{errors.fecha}</span>}
          </div>
          
          {/* Horarios */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="horaInicio">
                Hora Inicio <span className="required">*</span>
              </label>
              <input
                type="time"
                id="horaInicio"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                className={errors.horaInicio ? 'error' : ''}
              />
              {errors.horaInicio && <span className="error-message">{errors.horaInicio}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="horaFin">
                Hora Fin <span className="required">*</span>
              </label>
              <input
                type="time"
                id="horaFin"
                name="horaFin"
                value={formData.horaFin}
                onChange={handleChange}
                className={errors.horaFin ? 'error' : ''}
              />
              {errors.horaFin && <span className="error-message">{errors.horaFin}</span>}
            </div>
          </div>
          
          {/* Tipo */}
          <div className="form-group">
            <label htmlFor="tipo">
              Tipo <span className="required">*</span>
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className={errors.tipo ? 'error' : ''}
            >
              {TIPOS_DISPONIBILIDAD.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {errors.tipo && <span className="error-message">{errors.tipo}</span>}
          </div>
          
          {/* Motivo */}
          <div className="form-group">
            <label htmlFor="motivo">
              Motivo {formData.tipo === 'NOLABORAL' && <span className="required">*</span>}
            </label>
            <input
              type="text"
              id="motivo"
              name="motivo"
              placeholder={formData.tipo === 'LABORAL' ? 'Opcional' : 'Ej: Vacaciones, capacitación, etc.'}
              value={formData.motivo}
              onChange={handleChange}
              className={errors.motivo ? 'error' : ''}
            />
            {errors.motivo && <span className="error-message">{errors.motivo}</span>}
          </div>
          
          {/* Vista previa del bloque */}
          <div className="preview-bloque">
            <div className="preview-label">Vista previa:</div>
            <div 
              className={`bloque-preview ${formData.tipo === 'LABORAL' ? 'laboral' : 'nolaboral'}`}
              style={{
                background: formData.tipo === 'LABORAL' 
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
              }}
            >
              <div className="bloque-hora">{formData.horaInicio || '--:--'}</div>
              <div className="bloque-hora-fin">{formData.horaFin || '--:--'}</div>
              {formData.motivo && <div className="bloque-motivo">{formData.motivo}</div>}
            </div>
          </div>
          
          {/* Botones */}
          <div className="modal-actions">
            {disponibilidad?.id && (
              <button
                type="button"
                className="btn-eliminar"
                onClick={handleEliminar}
                disabled={isLoading}
              >
                <FaTrash /> Eliminar
              </button>
            )}
            
            <div className="actions-right">
              <button
                type="button"
                className="btn-cancelar"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                className="btn-guardar"
                disabled={isLoading}
              >
                <FaSave /> {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

