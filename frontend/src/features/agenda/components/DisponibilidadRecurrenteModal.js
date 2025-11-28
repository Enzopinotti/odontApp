// src/features/agenda/components/DisponibilidadRecurrenteModal.js
import { useState, useEffect, useMemo, useRef } from 'react';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useGenerarDisponibilidadesRecurrentes } from '../hooks/useDisponibilidades';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import { FaTimes, FaSave, FaCalendarCheck, FaSearch } from 'react-icons/fa';

const DIAS_SEMANA = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' }
];

const TIPOS_RECURRENCIA = [
  { value: 'semanal', label: 'Semanal (ej: todos los martes)' },
  { value: 'mensual', label: 'Mensual (ej: primeros martes del mes)' }
];

export default function DisponibilidadRecurrenteModal({ 
  onClose, 
  onSuccess 
}) {
  const { showToast } = useToast();
  const { data: odontologos } = useOdontologosPorEspecialidad();
  const generarDisponibilidades = useGenerarDisponibilidadesRecurrentes();
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    odontologoId: '',
    tipoRecurrencia: 'semanal',
    diasSemana: [], // Para recurrencia semanal: array de días (0-6)
    diaSemana: '', // Para recurrencia mensual: día de la semana (0-6)
    posicionMes: 'primero', // Para recurrencia mensual: primero, segundo, tercero, cuarto, ultimo
    horaInicio: '10:00',
    horaFin: '18:00',
    fechaInicio: '',
    fechaFin: ''
  });

  const [errors, setErrors] = useState({});
  const [busquedaOdontologo, setBusquedaOdontologo] = useState('');
  const [mostrarListaOdontologos, setMostrarListaOdontologos] = useState(false);
  const odontologoInputRef = useRef(null);
  const odontologoListRef = useRef(null);
  
  // Filtrar odontólogos basado en la búsqueda
  const odontologosFiltrados = useMemo(() => {
    if (!odontologos || !Array.isArray(odontologos)) return [];
    
    if (!busquedaOdontologo || busquedaOdontologo.trim() === '') {
      return odontologos;
    }
    
    const termino = busquedaOdontologo.toLowerCase().trim();
    return odontologos.filter(odontologo => {
      const nombre = `${odontologo.Usuario?.nombre || ''} ${odontologo.Usuario?.apellido || ''}`.toLowerCase();
      const matricula = odontologo.matricula?.toLowerCase() || '';
      return nombre.includes(termino) || matricula.includes(termino);
    });
  }, [odontologos, busquedaOdontologo]);
  
  // Obtener el odontólogo seleccionado para mostrar en el input
  const odontologoSeleccionado = useMemo(() => {
    if (!formData.odontologoId) return null;
    return odontologos?.find(o => o.userId === parseInt(formData.odontologoId));
  }, [formData.odontologoId, odontologos]);
  
  // Actualizar búsqueda cuando se selecciona un odontólogo
  useEffect(() => {
    if (odontologoSeleccionado) {
      setBusquedaOdontologo(`Dr. ${odontologoSeleccionado.Usuario?.nombre} ${odontologoSeleccionado.Usuario?.apellido}`);
    }
  }, [odontologoSeleccionado]);
  
  // Cerrar lista al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        odontologoInputRef.current && 
        !odontologoInputRef.current.contains(event.target) &&
        odontologoListRef.current &&
        !odontologoListRef.current.contains(event.target)
      ) {
        setMostrarListaOdontologos(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Establecer fecha de inicio como hoy y fecha fin como fin de mes siguiente
  useEffect(() => {
    const hoy = new Date();
    const finMesSiguiente = new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0);
    
    setFormData(prev => ({
      ...prev,
      fechaInicio: hoy.toISOString().split('T')[0],
      fechaFin: finMesSiguiente.toISOString().split('T')[0]
    }));
  }, []);
  
  // Validación
  const validarFormulario = () => {
    const newErrors = {};
    
    if (!formData.odontologoId) {
      newErrors.odontologoId = 'Debe seleccionar un odontólogo';
    }
    
    if (formData.tipoRecurrencia === 'semanal' && formData.diasSemana.length === 0) {
      newErrors.diasSemana = 'Debe seleccionar al menos un día de la semana';
    }
    
    if (formData.tipoRecurrencia === 'mensual') {
      if (!formData.diaSemana) {
        newErrors.diaSemana = 'Debe seleccionar un día de la semana';
      }
      if (!formData.posicionMes) {
        newErrors.posicionMes = 'Debe seleccionar la posición en el mes';
      }
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
    
    if (!formData.fechaInicio) {
      newErrors.fechaInicio = 'La fecha de inicio es requerida';
    }
    
    if (!formData.fechaFin) {
      newErrors.fechaFin = 'La fecha de fin es requerida';
    }
    
    if (formData.fechaInicio && formData.fechaFin) {
      const inicio = new Date(formData.fechaInicio);
      const fin = new Date(formData.fechaFin);
      
      if (fin <= inicio) {
        newErrors.fechaFin = 'La fecha de fin debe ser posterior a la de inicio';
      }
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
  
  const handleBuscarOdontologo = (e) => {
    const valor = e.target.value;
    setBusquedaOdontologo(valor);
    setMostrarListaOdontologos(true);
    
    // Si se limpia la búsqueda, limpiar también la selección
    if (!valor || valor.trim() === '') {
      setFormData(prev => ({ ...prev, odontologoId: '' }));
    }
    
    // Limpiar error
    if (errors.odontologoId) {
      setErrors(prev => ({ ...prev, odontologoId: null }));
    }
  };
  
  const handleSeleccionarOdontologo = (odontologo) => {
    setFormData(prev => ({ ...prev, odontologoId: odontologo.userId.toString() }));
    setBusquedaOdontologo(`Dr. ${odontologo.Usuario?.nombre} ${odontologo.Usuario?.apellido}`);
    setMostrarListaOdontologos(false);
    
    // Limpiar error
    if (errors.odontologoId) {
      setErrors(prev => ({ ...prev, odontologoId: null }));
    }
  };
  
  const handleDiaSemanaToggle = (dia) => {
    setFormData(prev => {
      const nuevosDias = prev.diasSemana.includes(dia)
        ? prev.diasSemana.filter(d => d !== dia)
        : [...prev.diasSemana, dia];
      return { ...prev, diasSemana: nuevosDias };
    });
    
    if (errors.diasSemana) {
      setErrors(prev => ({ ...prev, diasSemana: null }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      showToast('Por favor corrige los errores del formulario', 'error');
      return;
    }
    
    try {
      // Preparar datos según el tipo de recurrencia
      let datosEnvio;
      
      if (formData.tipoRecurrencia === 'semanal') {
        datosEnvio = {
          odontologoId: parseInt(formData.odontologoId),
          tipoRecurrencia: 'semanal',
          diasSemana: formData.diasSemana.map(d => parseInt(d)),
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin
        };
      } else {
        datosEnvio = {
          odontologoId: parseInt(formData.odontologoId),
          tipoRecurrencia: 'mensual',
          diaSemana: parseInt(formData.diaSemana),
          posicionMes: formData.posicionMes,
          horaInicio: formData.horaInicio,
          horaFin: formData.horaFin,
          fechaInicio: formData.fechaInicio,
          fechaFin: formData.fechaFin
        };
      }
      
      const resultado = await generarDisponibilidades.mutateAsync(datosEnvio);
      
      showToast(
        `Se crearon ${resultado.creadas || resultado.length || 0} disponibilidades exitosamente`, 
        'success'
      );
      
      onSuccess?.();
    } catch (error) {
      handleApiError(error, showToast);
    }
  };
  
  const isLoading = generarDisponibilidades.isPending;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content disponibilidad-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 style={{ color: 'white' }}>
            <FaCalendarCheck style={{ marginRight: '0.5rem', color: 'white' }} />
            Disponibilidad Recurrente
          </h2>
          <button className="btn-close" onClick={onClose} disabled={isLoading}>
            <FaTimes />
          </button>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="disponibilidad-form">
          {/* Odontólogo con búsqueda */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label htmlFor="buscarOdontologo">
              Odontólogo <span className="required">*</span>
            </label>
            <div ref={odontologoInputRef} style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#6b7280',
                  pointerEvents: 'none'
                }} />
                <input
                  type="text"
                  id="buscarOdontologo"
                  value={busquedaOdontologo}
                  onChange={handleBuscarOdontologo}
                  onFocus={() => setMostrarListaOdontologos(true)}
                  placeholder="Buscar odontólogo por nombre, apellido o matrícula..."
                  className={errors.odontologoId ? 'error' : ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    border: errors.odontologoId ? '2px solid #ef4444' : '2px solid #e0e0e0',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    transition: 'border-color 0.2s ease'
                  }}
                />
              </div>
              
              {mostrarListaOdontologos && odontologosFiltrados && odontologosFiltrados.length > 0 && (
                <div
                  ref={odontologoListRef}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.25rem',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000
                  }}
                >
                  {odontologosFiltrados.map(odontologo => (
                    <div
                      key={odontologo.userId}
                      onClick={() => handleSeleccionarOdontologo(odontologo)}
                      style={{
                        padding: '0.75rem 1rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s ease',
                        backgroundColor: formData.odontologoId === odontologo.userId.toString() ? '#f0f9ff' : 'white'
                      }}
                      onMouseEnter={(e) => {
                        if (formData.odontologoId !== odontologo.userId.toString()) {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (formData.odontologoId !== odontologo.userId.toString()) {
                          e.currentTarget.style.backgroundColor = 'white';
                        }
                      }}
                    >
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        Dr. {odontologo.Usuario?.nombre} {odontologo.Usuario?.apellido}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                        Mat. {odontologo.matricula}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {mostrarListaOdontologos && busquedaOdontologo && odontologosFiltrados && odontologosFiltrados.length === 0 && (
                <div
                  ref={odontologoListRef}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.25rem',
                    background: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#6b7280',
                    zIndex: 1000
                  }}
                >
                  No se encontraron odontólogos
                </div>
              )}
            </div>
            {errors.odontologoId && <span className="error-message">{errors.odontologoId}</span>}
          </div>
          
          {/* Tipo de recurrencia */}
          <div className="form-group">
            <label htmlFor="tipoRecurrencia">
              Tipo de Recurrencia <span className="required">*</span>
            </label>
            <select
              id="tipoRecurrencia"
              name="tipoRecurrencia"
              value={formData.tipoRecurrencia}
              onChange={handleChange}
            >
              {TIPOS_RECURRENCIA.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Configuración según tipo de recurrencia */}
          {formData.tipoRecurrencia === 'semanal' ? (
            <div className="form-group">
              <label>
                Días de la Semana <span className="required">*</span>
              </label>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}>
                {DIAS_SEMANA.map(dia => (
                  <label 
                    key={dia.value}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.625rem 0.75rem',
                      border: formData.diasSemana.includes(dia.value) 
                        ? '1.5px solid #10b981' 
                        : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: formData.diasSemana.includes(dia.value) 
                        ? '#ecfdf5' 
                        : '#ffffff',
                      transition: 'all 0.15s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      if (!formData.diasSemana.includes(dia.value)) {
                        e.currentTarget.style.borderColor = '#10b981';
                        e.currentTarget.style.background = '#f0fdf4';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!formData.diasSemana.includes(dia.value)) {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#ffffff';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.diasSemana.includes(dia.value)}
                      onChange={() => handleDiaSemanaToggle(dia.value)}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        margin: 0,
                        flexShrink: 0,
                        accentColor: '#10b981'
                      }}
                    />
                    <span style={{ 
                      flex: 1, 
                      textAlign: 'center',
                      fontSize: '0.9rem',
                      fontWeight: formData.diasSemana.includes(dia.value) ? '600' : '400',
                      color: formData.diasSemana.includes(dia.value) ? '#047857' : '#4b5563',
                      letterSpacing: '0.025em'
                    }}>
                      {dia.label}
                    </span>
                  </label>
                ))}
              </div>
              {errors.diasSemana && <span className="error-message">{errors.diasSemana}</span>}
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="diaSemana">
                  Día de la Semana <span className="required">*</span>
                </label>
                <select
                  id="diaSemana"
                  name="diaSemana"
                  value={formData.diaSemana}
                  onChange={handleChange}
                  className={errors.diaSemana ? 'error' : ''}
                >
                  <option value="">Seleccione un día</option>
                  {DIAS_SEMANA.map(dia => (
                    <option key={dia.value} value={dia.value}>
                      {dia.label}
                    </option>
                  ))}
                </select>
                {errors.diaSemana && <span className="error-message">{errors.diaSemana}</span>}
              </div>
              
              <div className="form-group">
                <label htmlFor="posicionMes">
                  Posición en el Mes <span className="required">*</span>
                </label>
                <select
                  id="posicionMes"
                  name="posicionMes"
                  value={formData.posicionMes}
                  onChange={handleChange}
                  className={errors.posicionMes ? 'error' : ''}
                >
                  <option value="primero">Primer {DIAS_SEMANA.find(d => d.value === parseInt(formData.diaSemana))?.label || 'día'}</option>
                  <option value="segundo">Segundo {DIAS_SEMANA.find(d => d.value === parseInt(formData.diaSemana))?.label || 'día'}</option>
                  <option value="tercero">Tercer {DIAS_SEMANA.find(d => d.value === parseInt(formData.diaSemana))?.label || 'día'}</option>
                  <option value="cuarto">Cuarto {DIAS_SEMANA.find(d => d.value === parseInt(formData.diaSemana))?.label || 'día'}</option>
                  <option value="ultimo">Último {DIAS_SEMANA.find(d => d.value === parseInt(formData.diaSemana))?.label || 'día'}</option>
                </select>
                {errors.posicionMes && <span className="error-message">{errors.posicionMes}</span>}
              </div>
            </>
          )}
          
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
          
          {/* Rango de fechas */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fechaInicio">
                Fecha Inicio <span className="required">*</span>
              </label>
              <input
                type="date"
                id="fechaInicio"
                name="fechaInicio"
                value={formData.fechaInicio}
                onChange={handleChange}
                className={errors.fechaInicio ? 'error' : ''}
              />
              {errors.fechaInicio && <span className="error-message">{errors.fechaInicio}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="fechaFin">
                Fecha Fin <span className="required">*</span>
              </label>
              <input
                type="date"
                id="fechaFin"
                name="fechaFin"
                value={formData.fechaFin}
                onChange={handleChange}
                className={errors.fechaFin ? 'error' : ''}
              />
              {errors.fechaFin && <span className="error-message">{errors.fechaFin}</span>}
            </div>
          </div>
          
          {/* Botones */}
          <div className="modal-actions">
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
                <FaSave /> {isLoading ? 'Creando...' : 'Crear Disponibilidades'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
