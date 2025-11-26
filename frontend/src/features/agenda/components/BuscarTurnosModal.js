// src/features/agenda/components/BuscarTurnosModal.js
import { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaTimes, FaCalendarAlt, FaUserMd, FaFileMedical, FaCheckCircle, FaClock, FaBan, FaUser } from 'react-icons/fa';
import { useTurnos } from '../hooks/useTurnos';
import { useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import * as agendaApi from '../../../api/agenda';
import { useQuery } from '@tanstack/react-query';
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
  const [filtroPacienteTexto, setFiltroPacienteTexto] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [mostrarSugerenciasPacientes, setMostrarSugerenciasPacientes] = useState(false);
  
  // Cargar odontólogos
  const { data: odontologosData = [] } = useOdontologosPorEspecialidad();
  
  // Búsqueda de pacientes
  const { data: pacientesSugeridos = [] } = useQuery({
    queryKey: ['buscar-pacientes', filtroPacienteTexto],
    queryFn: async () => {
      if (!filtroPacienteTexto || filtroPacienteTexto.length < 2) return [];
      const res = await agendaApi.buscarPacientes(filtroPacienteTexto);
      return res.data?.data || res.data || [];
    },
    enabled: filtroPacienteTexto.length >= 2,
    staleTime: 1000 * 60,
  });
  
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
  if (pacienteSeleccionado?.id) paramsBusqueda.pacienteId = pacienteSeleccionado.id;
  
  // Query de búsqueda (se ejecuta si hay filtros del backend o texto de paciente)
  // Si hay texto de paciente sin seleccionar, se ejecuta la query sin filtro de pacienteId y se filtra en el frontend
  const tieneFiltrosBackend = !!(filtroOdontologo || filtroFechaInicio || filtroFechaFin || filtroEstado || pacienteSeleccionado?.id);
  const tieneFiltros = tieneFiltrosBackend || !!filtroPacienteTexto;
  const queryParams = tieneFiltros ? paramsBusqueda : {};
  const { data: turnosData, isLoading: loadingTurnos } = useTurnos(queryParams, { enabled: tieneFiltros });
  
  // Procesar turnos
  const turnos = turnosData?.data || turnosData || [];
  
  // Filtrar por tratamiento/motivo y texto de paciente en el frontend
  const turnosFiltrados = useMemo(() => {
    let filtrados = turnos;
    
    // Filtrar por tratamiento/motivo
    if (filtroTratamiento) {
      filtrados = filtrados.filter(t => 
        t.motivo?.toLowerCase().includes(filtroTratamiento.toLowerCase())
      );
    }
    
    // Si hay texto de paciente pero no se seleccionó un paciente, filtrar por texto
    if (filtroPacienteTexto && !pacienteSeleccionado) {
      const textoBusqueda = filtroPacienteTexto.toLowerCase();
      filtrados = filtrados.filter(t => {
        const nombre = t.Paciente?.nombre?.toLowerCase() || '';
        const apellido = t.Paciente?.apellido?.toLowerCase() || '';
        const dni = t.Paciente?.dni || '';
        return nombre.includes(textoBusqueda) || 
               apellido.includes(textoBusqueda) || 
               dni.includes(textoBusqueda);
      });
    }
    
    return filtrados;
  }, [turnos, filtroTratamiento, filtroPacienteTexto, pacienteSeleccionado]);
  
  const handleLimpiarFiltros = () => {
    setFiltroOdontologo('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
    setFiltroEstado('');
    setFiltroTratamiento('');
    setFiltroPacienteTexto('');
    setPacienteSeleccionado(null);
  };
  
  const handleSeleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setFiltroPacienteTexto(`${paciente.nombre} ${paciente.apellido}${paciente.dni ? ` (DNI: ${paciente.dni})` : ''}`);
    setMostrarSugerenciasPacientes(false);
  };
  
  const handleCambiarTextoPaciente = (texto) => {
    setFiltroPacienteTexto(texto);
    setPacienteSeleccionado(null);
    setMostrarSugerenciasPacientes(texto.length >= 2);
  };
  
  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mostrarSugerenciasPacientes && !event.target.closest('.form-group')) {
        setMostrarSugerenciasPacientes(false);
      }
    };
    
    if (mostrarSugerenciasPacientes) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [mostrarSugerenciasPacientes]);
  
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
            
            {/* Filtro Paciente */}
            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="filtro-paciente" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: '500' }}>
                <FaUser /> Paciente
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="filtro-paciente"
                  value={filtroPacienteTexto}
                  onChange={(e) => handleCambiarTextoPaciente(e.target.value)}
                  onFocus={() => {
                    if (filtroPacienteTexto.length >= 2) {
                      setMostrarSugerenciasPacientes(true);
                    }
                  }}
                  placeholder="Buscar por nombre, apellido o DNI..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd'
                  }}
                />
                {pacienteSeleccionado && (
                  <button
                    type="button"
                    onClick={() => {
                      setPacienteSeleccionado(null);
                      setFiltroPacienteTexto('');
                    }}
                    style={{
                      position: 'absolute',
                      right: '5px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#e74c3c',
                      fontSize: '1.2rem',
                      padding: '0.25rem'
                    }}
                    title="Limpiar selección"
                  >
                    ×
                  </button>
                )}
                {mostrarSugerenciasPacientes && pacientesSugeridos.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    marginTop: '0.25rem',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    {pacientesSugeridos.map(paciente => (
                      <div
                        key={paciente.id}
                        onClick={() => handleSeleccionarPaciente(paciente)}
                        style={{
                          padding: '0.75rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #f0f0f0',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                      >
                        <div style={{ fontWeight: '600' }}>
                          {paciente.nombre} {paciente.apellido}
                        </div>
                        {paciente.dni && (
                          <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                            DNI: {paciente.dni}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {pacienteSeleccionado && (
                <small style={{ display: 'block', marginTop: '0.25rem', color: '#27ae60', fontWeight: '500' }}>
                  ✓ Paciente seleccionado: {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                </small>
              )}
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

