// src/features/agenda/components/BuscarTurnosModal.js
import { useState } from 'react';
import { FaSearch, FaTimes, FaCalendarAlt, FaUserMd, FaFileMedical, FaCheckCircle, FaClock, FaBan } from 'react-icons/fa';
import { useTurnos } from '../hooks/useTurnos';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import useToast from '../../../hooks/useToast';
import '../../../styles/agenda.scss';

export default function BuscarTurnosModal({ isOpen, onClose, onTurnoClick }) {
  const { showToast } = useToast();
  
  // Estados de filtros
  const [filtroOdontologo, setFiltroOdontologo] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTratamiento, setFiltroTratamiento] = useState('');
  
  // Cargar odontólogos
  const { data: odontologosData = [] } = useOdontologosPorEspecialidad();
  
  // Construir parámetros de búsqueda
  const paramsBusqueda = {};
  if (filtroOdontologo) paramsBusqueda.odontologoId = filtroOdontologo;
  if (filtroFechaInicio) paramsBusqueda.fechaInicio = new Date(filtroFechaInicio).toISOString();
  if (filtroFechaFin) {
    const fechaFin = new Date(filtroFechaFin);
    fechaFin.setHours(23, 59, 59, 999);
    paramsBusqueda.fechaFin = fechaFin.toISOString();
  }
  if (filtroEstado) paramsBusqueda.estado = filtroEstado;
  
  // Query de búsqueda (solo se ejecuta si hay al menos un filtro)
  const tieneFiltros = !!(filtroOdontologo || filtroFechaInicio || filtroFechaFin || filtroEstado);
  const queryParams = tieneFiltros ? paramsBusqueda : {};
  const { data: turnosData, isLoading: loadingTurnos } = useTurnos(queryParams, { enabled: tieneFiltros });
  
  // Procesar turnos
  const turnos = turnosData?.data || turnosData || [];
  
  // Filtrar por tratamiento/motivo en el frontend (ya que el backend no tiene ese filtro)
  const turnosFiltrados = filtroTratamiento
    ? turnos.filter(t => 
        t.motivo?.toLowerCase().includes(filtroTratamiento.toLowerCase())
      )
    : turnos;
  
  const handleLimpiarFiltros = () => {
    setFiltroOdontologo('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setFiltroEstado('');
    setFiltroTratamiento('');
  };
  
  const formatearFechaHora = (fechaHora) => {
    if (!fechaHora) return '';
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return <FaClock style={{ color: '#3498db' }} />;
      case 'ASISTIO':
        return <FaCheckCircle style={{ color: '#27ae60' }} />;
      case 'AUSENTE':
        return <FaBan style={{ color: '#e74c3c' }} />;
      case 'CANCELADO':
        return <FaBan style={{ color: '#95a5a6' }} />;
      default:
        return null;
    }
  };
  
  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return '#3498db';
      case 'ASISTIO':
        return '#27ae60';
      case 'AUSENTE':
        return '#e74c3c';
      case 'CANCELADO':
        return '#95a5a6';
      default:
        return '#7f8c8d';
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content buscar-turnos-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '90%', maxHeight: '90vh' }}>
        <div className="modal-header">
          <h2>
            <FaSearch /> Buscar Turnos
          </h2>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
          {/* Filtros */}
          <div className="filtros-busqueda" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            {/* Filtro Odontólogo */}
            <div className="form-group">
              <label htmlFor="filtro-odontologo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <FaUserMd /> Odontólogo
              </label>
              <select
                id="filtro-odontologo"
                value={filtroOdontologo}
                onChange={(e) => setFiltroOdontologo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="">Todos</option>
                {odontologosData.map(odonto => (
                  <option key={odonto.userId} value={odonto.userId}>
                    Dr. {odonto.Usuario?.nombre} {odonto.Usuario?.apellido}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro Fecha Inicio */}
            <div className="form-group">
              <label htmlFor="filtro-fecha-inicio" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <FaCalendarAlt /> Fecha Desde
              </label>
              <input
                type="date"
                id="filtro-fecha-inicio"
                value={filtroFechaInicio}
                onChange={(e) => setFiltroFechaInicio(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
            
            {/* Filtro Fecha Fin */}
            <div className="form-group">
              <label htmlFor="filtro-fecha-fin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <FaCalendarAlt /> Fecha Hasta
              </label>
              <input
                type="date"
                id="filtro-fecha-fin"
                value={filtroFechaFin}
                onChange={(e) => setFiltroFechaFin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
            
            {/* Filtro Estado */}
            <div className="form-group">
              <label htmlFor="filtro-estado" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                Estado
              </label>
              <select
                id="filtro-estado"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}
              >
                <option value="">Todos</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="ASISTIO">Asistió</option>
                <option value="AUSENTE">Ausente</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            
            {/* Filtro Tratamiento */}
            <div className="form-group">
              <label htmlFor="filtro-tratamiento" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <FaFileMedical /> Tratamiento/Motivo
              </label>
              <input
                type="text"
                id="filtro-tratamiento"
                value={filtroTratamiento}
                onChange={(e) => setFiltroTratamiento(e.target.value)}
                placeholder="Buscar por tratamiento..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid #ddd'
                }}
              />
            </div>
          </div>
          
          {/* Botón limpiar filtros */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleLimpiarFiltros}
              className="btn-secondary"
              style={{ padding: '0.5rem 1rem' }}
            >
              Limpiar Filtros
            </button>
          </div>
          
          {/* Resultados */}
          <div className="resultados-busqueda" style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
            {!tieneFiltros ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                <FaSearch style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }} />
                <p>Selecciona al menos un filtro para buscar turnos</p>
              </div>
            ) : loadingTurnos ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Cargando turnos...</p>
              </div>
            ) : turnosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#7f8c8d' }}>
                <p>No se encontraron turnos con los filtros seleccionados</p>
              </div>
            ) : (
              <div className="lista-turnos-busqueda">
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#e8f4f8', borderRadius: '6px', fontWeight: '600' }}>
                  {turnosFiltrados.length} turno(s) encontrado(s)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {turnosFiltrados.map((turno) => (
                    <div
                      key={turno.id}
                      className="turno-item-lista"
                      onClick={() => {
                        if (onTurnoClick) {
                          onTurnoClick(turno);
                        }
                      }}
                      style={{
                        padding: '1rem',
                        background: 'white',
                        borderRadius: '8px',
                        border: '1px solid #e0e0e0',
                        cursor: onTurnoClick ? 'pointer' : 'default',
                        transition: 'all 0.2s',
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        gap: '1rem',
                        alignItems: 'center'
                      }}
                      onMouseEnter={(e) => {
                        if (onTurnoClick) {
                          e.currentTarget.style.background = '#f8f9fa';
                          e.currentTarget.style.borderColor = '#145c63';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (onTurnoClick) {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                        }
                      }}
                    >
                      {/* Estado */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                        {getEstadoIcon(turno.estado)}
                        <span style={{ fontSize: '0.75rem', color: getEstadoColor(turno.estado), fontWeight: '600' }}>
                          {turno.estado}
                        </span>
                      </div>
                      
                      {/* Información principal */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '1.1rem' }}>
                            {turno.Paciente?.nombre} {turno.Paciente?.apellido}
                          </strong>
                          {turno.Paciente?.dni && (
                            <span style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                              DNI: {turno.Paciente.dni}
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.9rem', color: '#555' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaCalendarAlt /> {formatearFechaHora(turno.fechaHora)}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FaUserMd /> Dr. {turno.Odontologo?.Usuario?.nombre} {turno.Odontologo?.Usuario?.apellido}
                          </span>
                          {turno.motivo && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <FaFileMedical /> {turno.motivo}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Duración */}
                      <div style={{ textAlign: 'right', fontSize: '0.9rem', color: '#7f8c8d' }}>
                        {turno.duracion || 30} min
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

