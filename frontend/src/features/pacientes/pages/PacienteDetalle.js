import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import BackBar from '../../../components/BackBar';
import { AuthCtx } from '../../../context/AuthProvider';
import usePaciente from '../hooks/usePaciente';
import usePacienteExtra from '../hooks/usePacienteExtra';
import useOdontoMut from '../../odontograma/hooks/useOdontogramaMutations';
import useToast from '../../../hooks/useToast';
import useModal from '../../../hooks/useModal';
import useHistoriaClinica from '../hooks/useHistoriaClinica';
import { useEstadosPacientes } from '../hooks/useEstadosPacientes';
import usePacienteMutations from '../hooks/usePacienteMutations';
import { useTurnos } from '../../agenda/hooks/useTurnos';
import HistoriaClinicaForm from '../components/HistoriaClinicaForm';
import HistoriaClinicaPreview from '../components/HistoriaClinicaPreview';
import DetallesTurnoModal from '../../agenda/components/DetallesTurnoModal';
import ModernSelect from '../../../components/ModernSelect';
import AntecedentesModal from '../components/AntecedentesModal';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import '../../../styles/_pacienteDetalle.scss';


import { handleApiError } from '../../../utils/handleApiError';
import {
  FaEdit, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaCopy, FaExternalLinkAlt, FaCircle, FaNotesMedical, FaStethoscope,
  FaShieldAlt, FaPlus, FaCalendarAlt, FaGripVertical, FaChevronUp, FaChevronDown,
  FaExpandArrowsAlt, FaCompressAlt
} from 'react-icons/fa';

import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

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
  const qc = useQueryClient();

  // DASHBOARD INTERACTIVO: Cargar estados desde localStorage o defaults
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
    return saved ? JSON.parse(saved) : { evolucion: true }; // Evolucion wide por defecto
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

  const [antModalOpen, setAntModalOpen] = useState(false);
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  const { crear: crearOdonto } = useOdontoMut();
  const { updatePaciente } = usePacienteMutations();
  const { data: estadosData } = useEstadosPacientes();
  const estados = useMemo(() => estadosData?.data || [], [estadosData]);

  const optionsEstados = useMemo(() => estados.map(est => ({
    id: est.id,
    label: est.nombre,
    icon: <FaCircle style={{ color: est.color }} />
  })), [estados]);

  // Definición de roles y permisos
  const isAdmin = useMemo(() => {
    const rol = user?.Rol?.nombre?.toUpperCase() || '';
    return rol === 'ADMIN' || rol === 'ADMINISTRADOR';
  }, [user]);
  const userEsOdontologo = useMemo(() => user?.Rol?.nombre?.toUpperCase() === 'ODONTÓLOGO', [user]);

  const canVerPaciente = hasPermiso('pacientes', 'listar') || isAdmin;
  const canEditarPaciente = hasPermiso('pacientes', 'editar') || isAdmin;
  const canVerOdontograma = hasPermiso('odontograma', 'ver') || isAdmin;
  const canVerHistoria = hasPermiso('historia_clinica', 'ver') || isAdmin;
  const canCrearHistoria = hasPermiso('historia_clinica', 'crear') || isAdmin;
  const canVerImagenes = hasPermiso('imagenes', 'ver') || isAdmin;
  const canVerTratamientos = hasPermiso('tratamientos', 'listar') || isAdmin;

  const { data: paciente, isLoading, isError, error } = usePaciente(pacienteId, canVerPaciente);
  const {
    odontograma,
    historia, hcLoading, historiaDenied,
    antecedentes,
  } = usePacienteExtra(pacienteId, {
    canVerOdontograma, canVerHistoria, canVerImagenes, canVerTratamientos,
  });

  const { crear: crearHistoria } = useHistoriaClinica(pacienteId, false);

  // Cargar turnos del paciente
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

  if (isLoading) {
    return (
      <div className="pacientes-loader" style={{ height: '100vh' }}>
        <Lottie animationData={loadingAnim} loop autoplay style={{ width: 180 }} />
        <p style={{ marginTop: '1rem', fontWeight: '850', color: '#145c63' }}>Cargando perfil...</p>
      </div>
    );
  }

  // RENDERIZADORES DE SECCIONES
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
            <button className="btn-resize" onClick={() => toggleWide('contacto')} title={isWide ? 'Contraer ancho' : 'Expandir ancho'}>
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
              <small>Teléfono Móvil</small>
            </div>
            {paciente?.Contacto?.telefonoMovil && (
              <a className="btn-mini-contact" href={`https://wa.me/${paciente.Contacto.telefonoMovil.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" title="WhatsApp">
                <FaExternalLinkAlt />
              </a>
            )}
          </div>
          <div className="info-row-pro">
            <div className="icon-box"><FaEnvelope /></div>
            <div className="text-content">
              <span>{paciente?.Contacto?.email || '—'}</span>
              <small>Correo Electrónico</small>
            </div>
          </div>
          <div className="info-row-pro">
            <div className="icon-box"><FaMapMarkerAlt /></div>
            <div className="text-content">
              <span>
                {paciente?.Contacto?.Direccion?.calle} {paciente?.Contacto?.Direccion?.numero}, {paciente?.Contacto?.Direccion?.ciudad}
              </span>
              <small>Dirección de Residencia</small>
            </div>
          </div>
        </div>
      </section>
    );
  };

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
                <div className="stat-item">
                  <span className="val">{odontograma.carasTratadasCount || 0}</span>
                  <span className="lab">Caras</span>
                </div>
                <div className="stat-item">
                  <span className="val">{odontograma.pendientesCount || 0}</span>
                  <span className="lab">Pendientes</span>
                </div>
                <div className="stat-item">
                  <span className="val">32</span>
                  <span className="lab">Dientes</span>
                </div>
              </div>
              <div className="action-footer">
                <button className="btn-action" onClick={goOdontograma}><FaExternalLinkAlt /> Abrir Odontograma</button>
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
          {turnosLoading ? (
            <div className="pacientes-loader" style={{ height: '100px', transform: 'scale(0.6)' }}>
              <Lottie animationData={loadingAnim} loop autoplay />
            </div>
          ) : turnosProximos.length > 0 ? (
            <div className="turnos-list-pro">
              {turnosProximos.map(t => (
                <div key={t.id} className="turno-row-pro" onClick={() => setTurnoSeleccionado(t)}>
                  <div className="date-box">
                    <span className="month">{new Date(t.fechaHora).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase()}</span>
                    <span className="day">{new Date(t.fechaHora).getDate()}</span>
                  </div>
                  <div className="details">
                    <div className="time-row">
                      <span className="time">{new Date(t.fechaHora).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs</span>
                    </div>
                    <span className="dr">Dr. {t.Odontologo?.Usuario?.apellido}</span>
                    {t.motivo && <small title={t.motivo}>{t.motivo}</small>}
                  </div>
                </div>
              ))}
              <div className="action-footer">
                <button className="btn-action" onClick={() => navigate('/agenda')}><FaCalendarAlt /> Ver Agenda</button>
              </div>
            </div>
          ) : (
            <div className="empty-state-pro">
              <p>No hay turnos pendientes.</p>
              {!userEsOdontologo && (
                <button className="btn-create-pro" onClick={() => navigate('/agenda/turnos/nuevo', { state: { pacientePreseleccionado: paciente } })}>
                  <FaPlus /> Agendar
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    );
  };

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

  const renderAntecedentes = (dragHandleProps) => {
    const isCollapsed = collapsedCards['antecedentes'];
    const isWide = wideCards['antecedentes'];
    return (
      <section className={`section-card ${isCollapsed ? 'is-collapsed' : ''} ${isWide ? 'is-wide-card' : ''}`}>
        <div className="card-title">
          <div className="title-left">
            <div className="card-handle" {...dragHandleProps}><FaGripVertical /></div>
            <h3><FaShieldAlt className="title-icon" /> Alertas</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            {!isCollapsed && (
              <button className="btn-create-pro" onClick={() => setAntModalOpen(true)}>
                <FaPlus />
              </button>
            )}
            <button className="btn-resize" onClick={() => toggleWide('antecedentes')}>
              {isWide ? <FaCompressAlt /> : <FaExpandArrowsAlt />}
            </button>
            <button className="btn-collapse" onClick={() => toggleCollapse('antecedentes')}>
              {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
            </button>
          </div>
        </div>
        <div className="alerts-body">
          {antecedentes?.length > 0 ? (
            <div className="ant-list-pro">
              {antecedentes.map(a => (
                <div key={a.id} className="ant-item-mini">
                  <span className={`ant-tag-pro ${a.tipoAntecedente.toLowerCase()}`}>
                    {a.tipoAntecedente.replace('_', ' ')}
                  </span>
                  <p><strong>{a.descripcion}</strong></p>
                </div>
              ))}
            </div>
          ) : (
            <div className="alerts-empty" style={{ padding: '1rem', border: 'none' }}>
              <p className="muted" style={{ fontSize: '0.8rem' }}>Sin factores de riesgo.</p>
            </div>
          )}
        </div>
      </section>
    );
  };

  const sectionsMap = {
    contacto: renderContacto,
    odo: renderOdo,
    turnos: renderTurnos,
    evolucion: renderEvolucion,
    antecedentes: renderAntecedentes
  };

  return (
    <div className="paciente-detalle-page">
      <BackBar title="Perfil del Paciente" to="/pacientes"
        right={
          <div className="actions-right">
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
              <span className="pill-pro">Reg: {new Date(paciente?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="status-management">
          {paciente?.Estado && (
            <div className="current-badge" style={{ backgroundColor: paciente.Estado.color }}>
              <FaCircle className="dot" /> {paciente.Estado.nombre}
            </div>
          )}
          {canEditarPaciente && (
            <ModernSelect
              options={optionsEstados}
              value={paciente?.estadoId || ''}
              onChange={(val) => handleCambiarEstado(parseInt(val))}
              placeholder="Estado clínico..."
              className="status-select-modern"
              disabled={updatePaciente.isLoading}
            />
          )}
        </div>
      </header>

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
              {snapshot.isDraggingOver && (
                <div className={`drop-placeholder-dash ${wideCards[snapshot.draggingOverWith] ? 'wide' : ''}`} />
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>

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