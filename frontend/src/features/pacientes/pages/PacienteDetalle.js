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
import HistoriaClinicaForm from '../components/HistoriaClinicaForm';
import HistoriaClinicaPreview from '../components/HistoriaClinicaPreview';
import ModernSelect from '../../../components/ModernSelect';
import AntecedentesModal from '../components/AntecedentesModal';
import '../../../styles/_pacienteDetalle.scss';


import { handleApiError } from '../../../utils/handleApiError';
import {
  FaEdit, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt,
  FaCopy, FaExternalLinkAlt, FaCircle, FaNotesMedical, FaStethoscope,
  FaShieldAlt, FaPlus
} from 'react-icons/fa';

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

  const [antModalOpen, setAntModalOpen] = useState(false);

  const { crear: crearOdonto } = useOdontoMut();
  const { updatePaciente } = usePacienteMutations();
  const { data: estadosData } = useEstadosPacientes();
  const estados = useMemo(() => estadosData?.data || [], [estadosData]);

  const optionsEstados = useMemo(() => estados.map(est => ({
    id: est.id,
    label: est.nombre,
    icon: <FaCircle style={{ color: est.color }} />
  })), [estados]);

  // Permisos reforzados con detección de ADMIN
  const isAdmin = useMemo(() => {
    return user?.Rol?.nombre?.toUpperCase() === 'ADMIN';
  }, [user]);

  const canVerPaciente = hasPermiso('pacientes', 'listar') || isAdmin;
  const canEditarPaciente = hasPermiso('pacientes', 'editar') || isAdmin;
  const canVerOdontograma = hasPermiso('odontograma', 'ver') || isAdmin;
  const canEditarOdontograma = (hasPermiso('odontograma', 'editar') || isAdmin) && !isAdmin;
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

  if (isLoading) return <div className="paciente-detalle-page"><p>Cargando perfil...</p></div>;

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

      {/* HEADER PREMIUM */}
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
              {paciente?.nroAfiliado && <span className="pill-pro">Af: {paciente.nroAfiliado}</span>}
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
              placeholder="Actualizar proceso..."
              className="status-select-modern"
              disabled={updatePaciente.isLoading}
            />
          )}
        </div>
      </header>

      {/* GRID DE SECCIONES */}
      <div className="detalle-grid">

        {/* CONTACTO */}
        <section className="section-card">
          <div className="card-title">
            <h3><FaPhoneAlt className="title-icon" /> Información de Contacto</h3>
          </div>
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
            {paciente?.Contacto?.Direccion?.calle && (
              <a className="btn-mini-contact" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${paciente.Contacto.Direccion.calle} ${paciente.Contacto.Direccion.numero}, ${paciente.Contacto.Direccion.ciudad}`)}`} target="_blank" rel="noreferrer" title="Ver mapa">
                <FaMapMarkerAlt />
              </a>
            )}
          </div>

        </section>

        {/* ODONTOGRAMA RESUMEN */}
        <section className="section-card">
          <div className="card-title">
            <h3><FaStethoscope className="title-icon" /> Resumen Clínico</h3>
            {odontograma && (
              <span className={`badge-status ${odontograma.estadoGeneral?.toLowerCase().replace(' ', '-')}`}>
                {odontograma.estadoGeneral}
              </span>
            )}
          </div>
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
                <button className="btn-action primary" onClick={goOdontograma}>
                  Abrir Odontograma <FaExternalLinkAlt />
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p className="muted">Sin registro dental activo.</p>
              {canEditarOdontograma && (
                <button className="btn-action primary" onClick={() => crearOdonto.mutate({ pacienteId, observaciones: '' })}>
                  Crear Odontograma
                </button>
              )}
            </div>
          )}
        </section>

        {/* HISTORIA CLÍNICA RECIENTE */}
        <section className="section-card span-2">
          <div className="card-title">
            <h3><FaNotesMedical className="title-icon" /> Evolución y Notas</h3>
          </div>
          <HistoriaClinicaPreview
            historia={historia}
            hcLoading={hcLoading}
            historiaDenied={historiaDenied}
            canVerHistoria={canVerHistoria}
            canCrearHistoria={canCrearHistoria}
            onVerTodo={goHistoria}
            onCrear={handleCrearHistoria}
          />
        </section>

        {/* ESPACIO PARA MÁS INFO (Mencionado por usuario) */}
        <section className="section-card">
          <div className="card-title">
            <h3><FaShieldAlt className="title-icon" /> Antecedentes y Alertas</h3>
            <button className="btn-create-pro" onClick={() => setAntModalOpen(true)}>
              <FaPlus /> Configurar
            </button>
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
                    {a.observaciones && <small>{a.observaciones}</small>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="alerts-empty">
                <p className="muted">No se registran factores de riesgo o antecedentes sistémicos para este paciente.</p>
              </div>
            )}
          </div>


        </section>

      </div>

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
    </div>

  );
}
