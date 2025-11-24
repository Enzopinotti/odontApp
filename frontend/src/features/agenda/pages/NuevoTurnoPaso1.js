// src/features/agenda/pages/NuevoTurnoPaso1.js
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTratamientos, useOdontologosPorEspecialidad } from '../hooks/useTratamientos';
import { useSlotsDisponibles } from '../hooks/useTurnos';
import { useDisponibilidadesSemanal } from '../hooks/useDisponibilidades';
import BackBar from '../../../components/BackBar';
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from 'react-icons/fa';
import '../../../styles/agenda.scss';

export default function NuevoTurnoPaso1() {
  const navigate = useNavigate();
  const [mesActual, setMesActual] = useState(new Date());
  const [fecha, setFecha] = useState(null);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [odontologoId, setOdontologoId] = useState(null);
  const [horarioSeleccionado, setHorarioSeleccionado] = useState(null);
  
  const { data: tratamientos, isLoading: tratamientosLoading } = useTratamientos();
  const { data: odontologos, isLoading: odontologosLoading } = useOdontologosPorEspecialidad();
  
  // Calcular rango del mes para obtener disponibilidades
  const fechaInicioMes = useMemo(() => {
    const inicio = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    return inicio.toISOString().split('T')[0];
  }, [mesActual]);
  
  const fechaFinMes = useMemo(() => {
    const fin = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
    return fin.toISOString().split('T')[0];
  }, [mesActual]);
  
  // Obtener disponibilidades del mes para el odontólogo seleccionado
  const { data: disponibilidadesMes, isLoading: loadingDisponibilidades } = useDisponibilidadesSemanal(
    fechaInicioMes,
    fechaFinMes
  );
  
  // Obtener disponibilidades del día seleccionado (si hay fecha)
  const { data: disponibilidadesDia } = useDisponibilidadesSemanal(
    fecha || fechaInicioMes,
    fecha || fechaInicioMes
  );
  
  // Obtener días con disponibilidad y días no laborales en el mes
  const diasConDisponibilidad = useMemo(() => {
    if (!disponibilidadesMes) return { disponibles: new Set(), noLaborales: new Set() };
    
    const diasDisponibles = new Set();
    const diasNoLaborales = new Set();
    
    disponibilidadesMes.forEach(disp => {
      // Parsear la fecha manualmente para evitar problemas de zona horaria
      // La fecha viene en formato "YYYY-MM-DD", extraer el día directamente
      let dia;
      if (typeof disp.fecha === 'string') {
        // Formato: "YYYY-MM-DD"
        const partes = disp.fecha.split('-');
        if (partes.length === 3) {
          dia = parseInt(partes[2], 10);
        } else {
          // Fallback: usar Date pero en zona horaria local
          const fechaLocal = new Date(disp.fecha + 'T12:00:00'); // Usar mediodía para evitar problemas de zona horaria
          dia = fechaLocal.getDate();
        }
      } else if (disp.fecha instanceof Date) {
        dia = disp.fecha.getDate();
      } else {
        // Si viene como objeto con propiedades
        const fechaStr = disp.fecha.toString();
        const partes = fechaStr.split('-');
        if (partes.length === 3) {
          dia = parseInt(partes[2], 10);
        } else {
          const fechaLocal = new Date(fechaStr + 'T12:00:00');
          dia = fechaLocal.getDate();
        }
      }
      
      // Si se seleccionó un odontólogo específico, filtrar por ese odontólogo
      // Si se seleccionó "Todos" (odontologoId === null), mostrar todos
      const coincideOdontologo = odontologoId === null || disp.odontologoId === odontologoId;
      
      if (coincideOdontologo) {
        if (disp.tipo === 'LABORAL') {
          diasDisponibles.add(dia);
        } else if (disp.tipo === 'NOLABORAL') {
          diasNoLaborales.add(dia);
        }
      }
    });
    
    return { 
      disponibles: diasDisponibles, 
      noLaborales: diasNoLaborales 
    };
  }, [disponibilidadesMes, odontologoId]);
  
  // Obtener slots disponibles (solo si hay odontólogo, fecha y tratamiento seleccionados)
  // La duración del tratamiento es importante para generar los slots correctos
  const { data: slots, isLoading: slotsLoading } = useSlotsDisponibles(
    fecha,
    odontologoId,
    tratamientoSeleccionado?.duracion || 30
  );
  
  // Obtener franjas de disponibilidad del odontólogo seleccionado para validación
  const franjasDisponibilidad = useMemo(() => {
    if (!disponibilidadesDia || !odontologoId || !fecha) return [];
    
    return disponibilidadesDia
      .filter(disp => 
        disp.fecha === fecha && 
        disp.odontologoId === odontologoId && 
        disp.tipo === 'LABORAL'
      )
      .map(disp => ({
        inicio: disp.horaInicio,
        fin: disp.horaFin
      }));
  }, [disponibilidadesDia, fecha, odontologoId]);
  
  // Usar slots directamente (el backend ya los filtra por franjas LABORAL)
  // Solo validamos que existan y tengan el formato correcto
  const slotsFiltrados = useMemo(() => {
    if (!slots || slots.length === 0) {
      console.log('[NuevoTurnoPaso1] No hay slots disponibles', { 
        slots, 
        fecha, 
        odontologoId, 
        tratamientoSeleccionado,
        duracion: tratamientoSeleccionado?.duracion || 30
      });
      return [];
    }
    
    console.log('[NuevoTurnoPaso1] Slots recibidos del backend:', slots);
    
    // El backend ya genera slots solo dentro de franjas LABORAL
    // Solo necesitamos asegurarnos de que el formato sea correcto
    const slotsFormateados = slots.map(slot => {
      if (typeof slot === 'string') {
        return { inicio: slot, fin: null };
      }
      return slot;
    });
    
    console.log('[NuevoTurnoPaso1] Slots formateados:', slotsFormateados);
    return slotsFormateados;
  }, [slots, fecha, odontologoId, tratamientoSeleccionado]);

  // Reset fecha y horario cuando cambia el odontólogo
  useEffect(() => {
    setFecha(null);
    setHorarioSeleccionado(null);
    setTratamientoSeleccionado(null);
  }, [odontologoId]);
  
  // Reset horario cuando cambia la fecha
  useEffect(() => {
    setHorarioSeleccionado(null);
  }, [fecha]);
  
  // Generar días del mes para el calendario
  const diasDelMes = useMemo(() => {
    const año = mesActual.getFullYear();
    const mes = mesActual.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay(); // 0 = domingo, 1 = lunes, etc.
    
    const dias = [];
    
    // Agregar días vacíos al inicio para alinear el calendario
    for (let i = 0; i < diaSemanaInicio; i++) {
      dias.push(null);
    }
    
    // Agregar todos los días del mes
    for (let dia = 1; dia <= diasEnMes; dia++) {
      const fechaCompleta = new Date(año, mes, dia);
      // Formatear fecha en zona horaria local para evitar problemas de UTC
      const añoStr = año.toString();
      const mesStr = String(mes + 1).padStart(2, '0');
      const diaStr = String(dia).padStart(2, '0');
      const fechaStr = `${añoStr}-${mesStr}-${diaStr}`;
      const hoy = new Date();
      const esPasado = fechaCompleta < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
      const tieneDisponibilidad = diasConDisponibilidad.disponibles.has(dia);
      const esNoLaboral = diasConDisponibilidad.noLaborales.has(dia);
      
      dias.push({
        numero: dia,
        fecha: fechaStr,
        esPasado,
        tieneDisponibilidad,
        esNoLaboral,
        esSeleccionado: fecha === fechaStr
      });
    }
    
    return dias;
  }, [mesActual, diasConDisponibilidad, fecha]);
  
  const cambiarMes = (direccion) => {
    setMesActual(prev => {
      const nuevo = new Date(prev);
      nuevo.setMonth(prev.getMonth() + direccion);
      return nuevo;
    });
  };
  
  const irMesActual = () => {
    setMesActual(new Date());
  };

  const handleSiguiente = () => {
    if (!tratamientoSeleccionado || !horarioSeleccionado || !odontologoId || !fecha) {
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
  
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const nombresDias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

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
        {/* Paso 1: Seleccionar Odontólogo */}
        <div className="form-section">
          <label className="form-label">Odontólogo <span style={{ color: 'red' }}>*</span></label>
          {odontologosLoading ? (
            <div>Cargando odontólogos...</div>
          ) : (
            <select
              value={odontologoId || ''}
              onChange={(e) => {
                setOdontologoId(Number(e.target.value));
                setFecha(null);
                setHorarioSeleccionado(null);
              }}
              className="form-input"
              style={{ fontSize: '1rem', padding: '0.75rem' }}
            >
              <option value="">Seleccione un odontólogo</option>
              {odontologos?.map(odonto => (
                <option key={odonto.userId} value={odonto.userId}>
                  Dr. {odonto.Usuario?.nombre} {odonto.Usuario?.apellido}
                  {odonto.matricula ? ` (Mat. ${odonto.matricula})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Paso 2: Calendario mensual y Tratamientos lado a lado */}
        {odontologoId && (
          <div className="form-section">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '2rem',
              alignItems: 'start'
            }}>
              {/* Calendario mensual - Izquierda */}
              <div>
                <label className="form-label">Seleccione la fecha <span style={{ color: 'red' }}>*</span></label>
                <div style={{ 
                  background: 'white', 
                  borderRadius: '12px', 
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
              {/* Controles del calendario */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <button
                  onClick={() => cambiarMes(-1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    fontSize: '1.2rem',
                    color: '#145c63'
                  }}
                >
                  <FaChevronLeft />
                </button>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                  {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
                </h3>
                <button
                  onClick={() => cambiarMes(1)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.5rem',
                    fontSize: '1.2rem',
                    color: '#145c63'
                  }}
                >
                  <FaChevronRight />
                </button>
              </div>
              
              <button
                onClick={irMesActual}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  background: '#f0f0f0',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Ir a este mes
              </button>
              
              {/* Días de la semana */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                {nombresDias.map(dia => (
                  <div key={dia} style={{ 
                    textAlign: 'center', 
                    fontWeight: '600', 
                    fontSize: '0.85rem',
                    color: '#666',
                    padding: '0.5rem'
                  }}>
                    {dia}
                  </div>
                ))}
              </div>
              
              {/* Días del mes */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(7, 1fr)', 
                gap: '0.5rem'
              }}>
                {diasDelMes.map((dia, idx) => {
                  if (!dia) {
                    return <div key={`empty-${idx}`} style={{ aspectRatio: '1' }} />;
                  }
                  
                  return (
                    <button
                      key={dia.numero}
                      onClick={() => {
                        if (!dia.esPasado && dia.tieneDisponibilidad) {
                          setFecha(dia.fecha);
                        }
                      }}
                      disabled={dia.esPasado || !dia.tieneDisponibilidad}
                      style={{
                        aspectRatio: '1',
                        border: dia.esSeleccionado 
                          ? '2px solid #145c63' 
                          : '1px solid #e0e0e0',
                        borderRadius: '8px',
                        background: dia.esSeleccionado
                          ? '#145c63'
                          : dia.esNoLaboral
                            ? '#fff3cd'
                            : dia.tieneDisponibilidad
                              ? '#e8f5e9'
                              : '#f5f5f5',
                        color: dia.esSeleccionado
                          ? 'white'
                          : dia.esPasado
                            ? '#ccc'
                            : dia.esNoLaboral
                              ? '#856404'
                              : dia.tieneDisponibilidad
                                ? '#2e7d32'
                                : '#999',
                        cursor: (!dia.esPasado && (dia.tieneDisponibilidad || dia.esNoLaboral)) ? 'pointer' : 'not-allowed',
                        fontWeight: dia.esSeleccionado ? '600' : '400',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                        opacity: dia.esPasado ? 0.5 : 1,
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!dia.esPasado && (dia.tieneDisponibilidad || dia.esNoLaboral) && !dia.esSeleccionado) {
                          if (dia.esNoLaboral) {
                            e.target.style.background = '#ffe69c';
                          } else {
                            e.target.style.background = '#c8e6c9';
                          }
                          e.target.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!dia.esPasado && (dia.tieneDisponibilidad || dia.esNoLaboral) && !dia.esSeleccionado) {
                          if (dia.esNoLaboral) {
                            e.target.style.background = '#fff3cd';
                          } else {
                            e.target.style.background = '#e8f5e9';
                          }
                          e.target.style.transform = 'scale(1)';
                        }
                      }}
                      title={
                        dia.esPasado 
                          ? 'Fecha pasada' 
                          : dia.esNoLaboral
                            ? `No laboral - ${dia.fecha}`
                          : dia.tieneDisponibilidad 
                            ? `Disponible - ${dia.fecha}` 
                            : 'Sin disponibilidad'
                      }
                    >
                      {dia.numero}
                      {dia.tieneDisponibilidad && !dia.esPasado && (
                        <FaCalendarCheck 
                          style={{ 
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            fontSize: '0.6rem',
                            color: dia.esSeleccionado ? 'white' : '#4caf50'
                          }} 
                        />
                      )}
                      {dia.esNoLaboral && !dia.esPasado && (
                        <span 
                          style={{ 
                            position: 'absolute',
                            bottom: '2px',
                            right: '2px',
                            fontSize: '0.5rem',
                            color: dia.esSeleccionado ? 'white' : '#856404',
                            fontWeight: 'bold'
                          }} 
                        >
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Leyenda */}
              <div style={{ 
                marginTop: '1rem', 
                paddingTop: '1rem', 
                borderTop: '1px solid #e0e0e0',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: '0.85rem',
                color: '#666'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    background: '#e8f5e9', 
                    border: '1px solid #4caf50',
                    borderRadius: '4px'
                  }} />
                  <span>Disponible</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    background: '#fff3cd', 
                    border: '1px solid #ffc107',
                    borderRadius: '4px'
                  }} />
                  <span>No laboral</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    background: '#f5f5f5', 
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }} />
                  <span>Sin disponibilidad</span>
                </div>
              </div>
                </div>
              </div>
              
              {/* Tratamientos - Derecha */}
              <div>
                <label className="form-label">Tratamiento <span style={{ color: 'red' }}>*</span></label>
                {tratamientosLoading ? (
                  <div>Cargando tratamientos...</div>
                ) : (
                  <div className="tratamientos-grid" style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                    gap: '1rem'
                  }}>
                    {tratamientos?.map(tratamiento => (
                      <div
                        key={tratamiento.id}
                        className={`tratamiento-card ${
                          tratamientoSeleccionado?.id === tratamiento.id ? 'selected' : ''
                        }`}
                        onClick={() => {
                          setTratamientoSeleccionado(tratamiento);
                          setHorarioSeleccionado(null); // Reset horario al cambiar tratamiento
                        }}
                        style={{
                          padding: '1rem',
                          border: tratamientoSeleccionado?.id === tratamiento.id 
                            ? '2px solid #145c63' 
                            : '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: tratamientoSeleccionado?.id === tratamiento.id 
                            ? '#e0f2f7' 
                            : 'white',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div className="tratamiento-nombre" style={{ 
                          fontWeight: '600', 
                          marginBottom: '0.5rem',
                          fontSize: '0.95rem'
                        }}>
                          {tratamiento.nombre}
                        </div>
                        <div className="tratamiento-duracion" style={{ 
                          fontSize: '0.85rem', 
                          color: '#666' 
                        }}>
                          {tratamiento.duracion || 30} min
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Horarios disponibles (después de seleccionar tratamiento) */}
        {odontologoId && fecha && tratamientoSeleccionado && (
          <div className="form-section">
            <label className="form-label">Horarios disponibles <span style={{ color: 'red' }}>*</span></label>
            {slotsLoading ? (
              <div>Cargando horarios disponibles...</div>
            ) : (
              <div className="horarios-disponibles" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
                gap: '0.75rem',
                marginTop: '0.5rem'
              }}>
                {slotsFiltrados && slotsFiltrados.length > 0 ? (
                  slotsFiltrados.map((slot, idx) => {
                    // Manejar diferentes formatos de slot
                    let slotInicio, slotFin;
                    if (typeof slot === 'string') {
                      // Formato simple: "09:00"
                      slotInicio = slot;
                      slotFin = null;
                    } else if (slot.inicio) {
                      // Formato objeto: { inicio: "09:00", fin: "09:30" }
                      slotInicio = slot.inicio;
                      slotFin = slot.fin;
                    } else {
                      return null;
                    }
                    
                    const slotHora = slotInicio;
                    const displayText = slotFin ? `${slotInicio} - ${slotFin}` : slotInicio;
                    
                    return (
                      <div
                        key={idx}
                        className={`horario-slot ${
                          horarioSeleccionado === slotHora ? 'selected' : ''
                        }`}
                        onClick={() => setHorarioSeleccionado(slotHora)}
                        title={slotFin ? `De ${slotInicio} a ${slotFin}` : `A las ${slotInicio}`}
                        style={{
                          padding: '0.75rem 1rem',
                          border: horarioSeleccionado === slotHora 
                            ? '2px solid #145c63' 
                            : '1px solid #e0e0e0',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          background: horarioSeleccionado === slotHora 
                            ? '#145c63' 
                            : 'white',
                          color: horarioSeleccionado === slotHora 
                            ? 'white' 
                            : '#374151',
                          fontWeight: horarioSeleccionado === slotHora ? '600' : '400',
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem'
                        }}
                        onMouseEnter={(e) => {
                          if (horarioSeleccionado !== slotHora) {
                            e.target.style.background = '#e0f2f7';
                            e.target.style.borderColor = '#145c63';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (horarioSeleccionado !== slotHora) {
                            e.target.style.background = 'white';
                            e.target.style.borderColor = '#e0e0e0';
                          }
                        }}
                      >
                        {displayText}
                      </div>
                    );
                  })
                ) : (
                  <div className="empty-state" style={{ 
                    gridColumn: '1 / -1',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#666'
                  }}>
                    {slotsLoading 
                      ? 'Cargando horarios...' 
                      : slots && slots.length > 0
                        ? 'No hay horarios disponibles que coincidan con las franjas de disponibilidad'
                        : `No hay horarios disponibles para este odontólogo en la fecha seleccionada.
                        ${!fecha ? 'Por favor, seleccione una fecha.' : ''}
                        ${!tratamientoSeleccionado ? 'Por favor, seleccione un tratamiento.' : ''}
                        Verifique que haya disponibilidades LABORAL configuradas para este odontólogo en la fecha ${fecha || 'seleccionada'}.`}
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
          disabled={!tratamientoSeleccionado || !horarioSeleccionado || !odontologoId || !fecha}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}

