import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient, QueryClientProvider } from '@tanstack/react-query'; 

// Componentes UI Globales
import BackBar from '../../../components/BackBar';
import ModernSelect from '../../../components/ModernSelect';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';

// Contextos y Hooks Globales
import { AuthCtx } from '../../../context/AuthProvider';
import useToast from '../../../hooks/useToast';
import useModal from '../../../hooks/useModal'; 
import { handleApiError } from '../../../utils/handleApiError';

// Hooks del Módulo Pacientes
import usePaciente from '../hooks/usePaciente';
import usePacienteExtra from '../hooks/usePacienteExtra';
import usePacienteMutations from '../hooks/usePacienteMutations';
import useHistoriaClinica from '../hooks/useHistoriaClinica';
import { useEstadosPacientes } from '../hooks/useEstadosPacientes';

// Hooks de otros módulos
import useOdontoMut from '../../odontograma/hooks/useOdontogramaMutations';
import { useTurnos } from '../../agenda/hooks/useTurnos';

// Componentes Locales
import HistoriaClinicaForm from '../components/HistoriaClinicaForm';
import HistoriaClinicaPreview from '../components/HistoriaClinicaPreview';
import AntecedentesModal from '../components/AntecedentesModal';
import DetallesTurnoModal from '../../agenda/components/DetallesTurnoModal';

// 👇 CONEXIÓN CON FINANZAS
import FinancePage from '../../finanzas/pages/FinancePage'; 

// Estilos e Iconos
import '../../../styles/_pacienteDetalle.scss';
import { 
  FaEdit, FaPhoneAlt, FaEnvelope, FaExternalLinkAlt, FaCircle, 
  FaStethoscope, FaShieldAlt, FaCalendarAlt, FaGripVertical, 
  FaChevronUp, FaChevronDown, FaExpandArrowsAlt, FaCompressAlt, 
  FaFileInvoiceDollar, FaPlus, FaCopy 
} from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Helper para copiar al portapapeles
function copy(text, showToast) {
  if (!text) return;
  navigator.clipboard?.writeText(text);
  showToast('Copiado al portapapeles', 'success');
}

export default function PacienteDetalle() {
  const { id } = useParams();
  const pacienteId = Number(id);
  const navigate = useNavigate();
  const { hasPermiso, user } = useContext(AuthCtx);
  const { showToast } = useToast();
  const { showModal } = useModal(); 
  
  // 👈 Capturamos el cliente de query de esta página para el puente del modal
  const qc = useQueryClient();

  // --- 1. LÓGICA DEL DASHBOARD (Orden y Estado de Cards) ---
  const STORAGE_KEY_ORDER = `paciente_dash_order_${pacienteId}`;
  const STORAGE_KEY_COLLAPSED = `paciente_dash_collapsed_${pacienteId}`;
  const STORAGE_KEY_WIDE = `paciente_dash_wide_${pacienteId}`;

  const defaultOrder = ['contacto', 'odo', 'turnos', 'evolucion', 'antecedentes'];
  
  const [cardsOrder, setCardsOrder] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDER);
    return saved ? JSON.parse(saved) : defaultOrder;
  });

  const [collapsedCards, setCollapsedCards] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COLLAPSED);
    return saved ? JSON.parse(saved) : {};
  });

  const [wideCards, setWideCards] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WIDE);
    return saved ? JSON.parse(saved) : { evolucion: true };
  });

  const toggleCollapse = (id) => {
    const newVal = { ...collapsedCards, [id]: !collapsedCards[id] };
    setCollapsedCards(newVal);
    localStorage.setItem(STORAGE_KEY_COLLAPSED, JSON.stringify(newVal));
  };

  const toggleWide = (id) => {
    const newVal = { ...wideCards, [id]: !wideCards[id] };
    setWideCards(newVal);
    localStorage.setItem(STORAGE_KEY_WIDE, JSON.stringify(newVal));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(cardsOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setCardsOrder(items);
    localStorage.setItem(STORAGE_KEY_ORDER, JSON.stringify(items));
  };

  // --- 2. ESTADOS LOCALES ---
  const [antModalOpen, setAntModalOpen] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  // --- 3. MUTACIONES Y HOOKS DE DATOS ---
  const { crear: crearOdonto } = useOdontoMut();
  const { updatePaciente } = usePacienteMutations();
  const { data: estadosData } = useEstadosPacientes();
  
  const estados = useMemo(() => estadosData?.data || [], [estadosData]);
  const optionsEstados = useMemo(() => estados.map(est => ({
    id: est.id,
    label: est.nombre,
    icon: <FaCircle style={{ color: est.color }} />
  })), [estados]);

  // --- 4. PERMISOS ---
  const isAdmin = useMemo(() => {
    const rol = user?.Rol?.nombre?.toUpperCase() || '';
    return rol === 'ADMIN' || rol === 'ADMINISTRADOR';
  }, [user]);

  const canVerPaciente = hasPermiso('pacientes', 'listar') || isAdmin;
  const canEditarPaciente = hasPermiso('pacientes', 'editar') || isAdmin;
  const canVerOdontograma = hasPermiso('odontograma', 'ver') || isAdmin;
  const canVerHistoria = hasPermiso('historia_clinica', 'ver') || isAdmin;
  const canCrearHistoria = hasPermiso('historia_clinica', 'crear') || isAdmin;
  const canVerImagenes = hasPermiso('imagenes', 'ver') || isAdmin;
  const canVerTratamientos = hasPermiso('tratamientos', 'listar') || isAdmin;
  
  // Permiso unificado para ver el botón de finanzas
  const canFinanzas = hasPermiso('facturacion', 'crear') || hasPermiso('presupuestos', 'crear') || isAdmin;

  // --- 5. DATA FETCHING ---
  const { data: paciente, isLoading, isError, error } = usePaciente(pacienteId, canVerPaciente);
  
  const {
    odontograma,
    historia, hcLoading, historiaDenied,
    antecedentes,
  } = usePacienteExtra(pacienteId, {
    canVerOdontograma, canVerHistoria, canVerImagenes, canVerTratamientos,
  });

  const { crear: crearHistoria } = useHistoriaClinica(pacienteId, false);

  // Carga de Turnos Pendientes
  const initialDate = useMemo(() => new Date().toISOString(), []);
  const queryParamsTurnos = useMemo(() => ({
    pacienteId,
    estado: 'PENDIENTE',
    fechaInicio: initialDate
  }), [pacienteId, initialDate]);

  const { data: turnosData, isLoading: turnosLoading } = useTurnos(queryParamsTurnos);

  const turnosProximos = useMemo(() => {
    const list = Array.isArray(turnosData) ? turnosData : (turnosData?.data || []);
    return list.slice(0, 3);
  }, [turnosData]);

  // --- 6. HANDLERS ---
  useEffect(() => {
    if (canVerPaciente && isError) {
      handleApiError(error, showToast, null, showModal);
      navigate('/pacientes');
    }
  }, [canVerPaciente, isError, error, showToast, showModal, navigate]);

  const handleCambiarEstado = async (newEstadoId) => {
    try {
      await updatePaciente.mutateAsync({ id: pacienteId, data: { estadoId: newEstadoId } });
      showToast('Estado actualizado correctamente', 'success');
    } catch (err) {
      handleApiError(err, showToast);
    }
  };

  const goEditar = () => navigate(`/pacientes/${pacienteId}/editar`);
  const goOdontograma = () => navigate(`/pacientes/${pacienteId}/odontograma`);
  const goHistoria = () => navigate(`/pacientes/${pacienteId}/historia`);

  const handleSubmitHistoria = (values) => {
    crearHistoria.mutate(values, {
      onSuccess: () => {
        showToast('Historia clínica registrada', 'success');
        showModal(null);
      },
      onError: (err) => handleApiError(err, showToast),
    });
  };

  const handleCrearHistoria = () => {
    showModal({
      type: 'form',
      title: 'Nueva Entrada de Historia',
      component: (
        <HistoriaClinicaForm
          pacienteId={pacienteId}
          onSubmit={handleSubmitHistoria}
          onCancel={() => showModal(null)}
          loading={crearHistoria.isLoading}
        />
      ),
    });
  };

  // ✅ MANEJADOR UNIFICADO DE FINANZAS
  // Esto abre el modal pasando el paciente actual para bloquear el selector
  const handleAbrirFinanzas = () => {
    showModal({
      title: 'Gestión Financiera', 
      type: 'custom',
      className: 'admin-modal-card modal-xl', 
      component: (
        // Puenteamos el contexto para que FinancePage funcione dentro del modal
        <QueryClientProvider client={qc}>
             <FinancePage 
                initialPatient={paciente} 
                isModal={true} 
                onClose={() => showModal(null)}
             />
        </QueryClientProvider>
      )
    });
  };

  // --- 7. RENDERIZADORES DE TARJETAS COMPLETOS ---

  // A. Tarjeta de Contacto
  const renderContacto = (dragHandleProps) => {
    const isCollapsed = collapsedCards['contacto'];
    const isWide = wideCards['contacto'];
    return (
      <section className={`section-card ${isCollapsed ? 'is-collapsed' : ''} ${isWide ? 'is-wide-card' : ''}`}>
        <div className="card-title">
          <div className="title-left">
            <div className="card-handle" {...dragHandleProps}><FaGripVertical /></div>
            <h3><FaPhoneAlt className="title-icon" /> Contacto</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button className="btn-resize" onClick={() => toggleWide('contacto')}>
              {isWide ? <FaCompressAlt /> : <FaExpandArrowsAlt />}
            </button>
            <button className="btn-collapse" onClick={() => toggleCollapse('contacto')}>
              {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>
        </div>
        <div className="card-body">
            <div className="info-row-pro">
                <div className="icon-box"><FaPhoneAlt /></div>
                <div className="text-content">
                    <span>{paciente?.Contacto?.telefonoMovil || '—'}</span>
                    <small>Móvil</small>
                </div>
                {paciente?.Contacto?.telefonoMovil && (
                    <a className="btn-mini-contact" href={`https://wa.me/${paciente.Contacto.telefonoMovil.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                        <FaExternalLinkAlt />
                    </a>
                )}
            </div>
            <div className="info-row-pro">
                <div className="icon-box"><FaEnvelope /></div>
                <div className="text-content">
                    <span>{paciente?.Contacto?.email || '—'}</span>
                    <small>Email</small>
                </div>
            </div>
        </div>
      </section>
    );
  };

  // B. Tarjeta de Odontograma (Resumen)
  const renderOdo = (dragHandleProps) => {
    const isCollapsed = collapsedCards['odo'];
    const isWide = wideCards['odo'];
    return (
        <section className={`section-card ${isCollapsed ? 'is-collapsed' : ''} ${isWide ? 'is-wide-card' : ''}`}>
            <div className="card-title">
                <div className="title-left">
                    <div className="card-handle" {...dragHandleProps}><FaGripVertical /></div>
                    <h3><FaStethoscope className="title-icon" /> Resumen Clínico</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-resize" onClick={() => toggleWide('odo')}>
                        {isWide ? <FaCompressAlt /> : <FaExpandArrowsAlt />}
                    </button>
                    <button className="btn-collapse" onClick={() => toggleCollapse('odo')}>
                        {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                    </button>
                </div>
            </div>
            <div className="card-body">
                {odontograma ? (
                    <>
                        <div className="odo-stats-pro">
                            <div className="stat-item"><span className="val">{odontograma.carasTratadasCount || 0}</span><span className="lab">Caras</span></div>
                            <div className="stat-item"><span className="val">{odontograma.pendientesCount || 0}</span><span className="lab">Pendientes</span></div>
                            <div className="stat-item"><span className="val">32</span><span className="lab">Dientes</span></div>
                        </div>
                        <div className="action-footer">
                            <button className="btn-action" onClick={goOdontograma}>Ver Odontograma Completo</button>
                        </div>
                    </>
                ) : (
                    <div className="empty-state-pro">
                        <p>Sin odontograma inicial.</p>
                        <button className="btn-create-pro" onClick={() => crearOdonto.mutate(pacienteId)}><FaPlus /> Iniciar</button>
                    </div>
                )}
            </div>
        </section>
    );
  };

  // C. Tarjeta de Turnos
  const renderTurnos = (dragHandleProps) => {
    const isCollapsed = collapsedCards['turnos'];
    const isWide = wideCards['turnos'];
    return (
        <section className={`section-card ${isCollapsed ? 'is-collapsed' : ''} ${isWide ? 'is-wide-card' : ''}`}>
            <div className="card-title">
                <div className="title-left">
                    <div className="card-handle" {...dragHandleProps}><FaGripVertical /></div>
                    <h3><FaCalendarAlt className="title-icon" /> Próximas Citas</h3>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-resize" onClick={() => toggleWide('turnos')}>
                        {isWide ? <FaCompressAlt /> : <FaExpandArrowsAlt />}
                    </button>
                    <button className="btn-collapse" onClick={() => toggleCollapse('turnos')}>
                        {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                    </button>
                </div>
            </div>
            <div className="card-body">
                {turnosLoading ? <p>Cargando...</p> : turnosProximos.length > 0 ? (
                    <div className="turnos-list-pro">
                         {turnosProximos.map(t => (
                            <div key={t.id} className="turno-row-pro" onClick={() => setTurnoSeleccionado(t)}>
                                <div className="date-box">
                                    <span className="day">{new Date(t.fechaHora).getDate()}</span>
                                </div>
                                <div className="details">
                                    <span className="time">{new Date(t.fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                                    <span className="dr">Dr. {t.Odontologo?.Usuario?.apellido}</span>
                                </div>
                            </div>
                         ))}
                    </div>
                ) : (
                    <div className="empty-state-pro"><p>No hay turnos pendientes.</p></div>
                )}
            </div>
        </section>
    );
  };

  // D. Tarjeta de Evolución (Historia Clínica)
  const renderEvolucion = (dragHandleProps) => {
    const isCollapsed = collapsedCards['evolucion'];
    const isWide = wideCards['evolucion'];
    return (
      <div className={`${isWide ? 'span-2' : ''} ${isCollapsed ? 'is-collapsed' : ''}`}>
        <HistoriaClinicaPreview
          historia={historia}
          hcLoading={hcLoading}
          historiaDenied={historiaDenied}
          canVerHistoria={canVerHistoria}
          canCrearHistoria={canCrearHistoria}
          onVerTodo={goHistoria}
          onCrear={handleCrearHistoria}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => toggleCollapse('evolucion')}
          dragHandle={<div className="card-handle" {...dragHandleProps}><FaGripVertical /></div>}
          isWide={isWide}
          onToggleWide={() => toggleWide('evolucion')}
        />
      </div>
    );
  };

  // E. Tarjeta de Antecedentes
  const renderAntecedentes = (dragHandleProps) => {
    const isCollapsed = collapsedCards['antecedentes'];
    const isWide = wideCards['antecedentes'];
    return (
      <section className={`section-card ${isCollapsed ? 'is-collapsed' : ''} ${isWide ? 'is-wide-card' : ''}`}>
        <div className="card-title">
          <div className="title-left">
            <div className="card-handle" {...dragHandleProps}><FaGripVertical /></div>
            <h3><FaShieldAlt className="title-icon" /> Alertas Médicas</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
             <button className="btn-collapse" onClick={() => toggleCollapse('antecedentes')}>
                {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
             </button>
          </div>
        </div>
        <div className="alerts-body">
            {antecedentes?.length > 0 ? (
                <div className="ant-list-pro">
                    {antecedentes.map(a => <span key={a.id} className="ant-tag-pro">{a.descripcion}</span>)}
                </div>
            ) : <p className="muted">Sin factores de riesgo registrados.</p>}
        </div>
      </section>
    );
  };

  // Mapeo de secciones
  const sectionsMap = {
    contacto: renderContacto,
    odo: renderOdo,
    turnos: renderTurnos,
    evolucion: renderEvolucion,
    antecedentes: renderAntecedentes
  };

  // --- 8. RENDER PRINCIPAL ---
  if (isLoading) {
    return (
      <div className="pacientes-loader" style={{ height: '100vh' }}>
        <Lottie animationData={loadingAnim} loop autoplay style={{ width: 180 }} />
      </div>
    );
  }

  return (
    <div className="paciente-detalle-page">
      <BackBar title="Perfil del Paciente" to="/pacientes"
        right={
          <div className="actions-right">
            
            {/* ✅ BOTÓN UNIFICADO DE FINANZAS */}
            {canFinanzas && (
               <button 
                  className="btn ghost" 
                  onClick={handleAbrirFinanzas} 
                  title="Presupuestos y Facturación"
               >
                  <FaFileInvoiceDollar /> <span className="d-none d-md-inline">Presupuestar / Cargar</span>
               </button>
            )}

            {canEditarPaciente && (
              <button className="btn ghost" onClick={goEditar}><FaEdit /> Editar</button>
            )}
          </div>
        }
      />

      <header className="detalle-header-pro">
        <div className="perfil-main">
          <div className="avatar-pro">
            {paciente?.apellido?.[0]}{paciente?.nombre?.[0]}
          </div>
          <div className="info-pro">
            <h2>{paciente?.apellido}, {paciente?.nombre}</h2>
            <div className="dni-row">
              DNI: <strong>{paciente?.dni}</strong>
              <button className="copy-dni" onClick={() => copy(paciente?.dni, showToast)}><FaCopy /></button>
            </div>
            <div className="pills-row">
              {paciente?.obraSocial && <span className="pill-pro">OS: {paciente.obraSocial}</span>}
            </div>
          </div>
        </div>

        <div className="status-management">
          {canEditarPaciente && (
            <ModernSelect
              options={optionsEstados}
              value={paciente?.estadoId || ''}
              onChange={(val) => handleCambiarEstado(parseInt(val))}
              placeholder="Estado clínico..."
              className="status-select-modern"
            />
          )}
        </div>
      </header>

      {/* --- DASHBOARD DRAG & DROP --- */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard-grid">
          {(provided, snapshot) => (
            <div
              className={`detalle-grid ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {cardsOrder.map((sectionId, index) => {
                const isWide = wideCards[sectionId] && !collapsedCards[sectionId];
                return (
                  <Draggable key={sectionId} draggableId={sectionId} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={snapshot.isDragging ? 'is-dragging-card' : ''}
                        style={{
                          ...provided.draggableProps.style,
                          gridColumn: isWide ? 'span 2' : 'span 1'
                        }}
                      >
                        {sectionsMap[sectionId](provided.dragHandleProps)}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* --- MODALES AUXILIARES --- */}
      {antModalOpen && (
        <AntecedentesModal
          pacienteId={pacienteId}
          onClose={() => setAntModalOpen(false)}
          onApplied={() => {
            setAntModalOpen(false);
            qc.invalidateQueries(['paciente', pacienteId, 'antecedentes']);
          }}
        />
      )}

      {turnoSeleccionado && (
        <DetallesTurnoModal
          turno={turnoSeleccionado}
          onClose={() => setTurnoSeleccionado(null)}
          onSuccess={() => {
            setTurnoSeleccionado(null);
            qc.invalidateQueries(['turnos', queryParamsTurnos]);
          }}
        />
      )}
    </div>
  );
}