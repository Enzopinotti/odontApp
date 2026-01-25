// src/features/agenda/pages/NuevoTurnoPaso2.js
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBuscarPacientes } from '../hooks/useBuscarPacientes';
import { usePacientes } from '../../pacientes/hooks/usePacientes';
import useToast from '../../../hooks/useToast';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import { FaUser, FaSearch, FaTimes, FaIdCard, FaPhone, FaEnvelope, FaCheck } from 'react-icons/fa';
import BackBar from '../../../components/BackBar';
import '../../../styles/agenda.scss';

const EMPTY_PACIENTE = {
  nombre: '',
  apellido: '',
  dni: '',
  email: '',
  telefono: '',
  seguro: '',
  generarRecordatorio: false,
};

export default function NuevoTurnoPaso2() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { fechaHora, tratamiento, odontologoId, duracion, pacientePreseleccionado } = location.state || {};

  const [busqueda, setBusqueda] = useState(pacientePreseleccionado ? `${pacientePreseleccionado.nombre} ${pacientePreseleccionado.apellido}` : '');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(pacientePreseleccionado || null);
  const [mostrarLista, setMostrarLista] = useState(false);

  // Lista inicial de pacientes
  const { data: dataPacientesInicial, isLoading: cargandoInicial } = usePacientes({ perPage: 10 });
  const pacientesIniciales = dataPacientesInicial?.data || [];

  const { data: pacientesBuscados, isLoading: buscando } = useBuscarPacientes(busqueda);

  const mostrarIniciales = !busqueda || busqueda.length < 2;
  const listaParaMostrar = mostrarIniciales ? pacientesIniciales : (pacientesBuscados || []);
  const isLoading = mostrarIniciales ? cargandoInicial : buscando;

  // Si no hay datos del paso anterior, redirigir
  useEffect(() => {
    if (!fechaHora || !tratamiento || !odontologoId) {
      navigate('/agenda/turnos/nuevo');
    }
  }, [fechaHora, tratamiento, odontologoId, navigate]);

  const handleSeleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setBusqueda(`${paciente.nombre} ${paciente.apellido}`);
    setMostrarLista(false);
  };

  const handleSiguiente = () => {
    if (!pacienteSeleccionado) {
      showToast('Debes seleccionar un paciente', 'error');
      return;
    }

    navigate('/agenda/turnos/nuevo/paso3', {
      state: {
        fechaHora,
        tratamiento,
        odontologoId,
        duracion,
        paciente: pacienteSeleccionado
      },
    });
  };

  if (!fechaHora || !tratamiento || !odontologoId) {
    return null;
  }

  return (
    <div className="nuevo-turno-container">
      <BackBar
        title="Nuevo turno"
        subtitle="Seleccionar paciente"
        to="/agenda/turnos/nuevo"
      />

      <div className="nuevo-turno-steps">
        <div className="step-item completed">
          <div className="step-circle completed"><FaCheck /></div>
          <div className="step-label">Fecha y Tratamiento</div>
        </div>
        <div className="step-item active">
          <div className="step-circle active"><FaCheck /></div>
          <div className="step-label active">Datos</div>
        </div>
        <div className="step-item">
          <div className="step-circle">3</div>
          <div className="step-label">Confirmar</div>
        </div>
      </div>

      <div className="nuevo-turno-form">
        <div className="form-section">
          <label className="form-label">Buscar paciente <span style={{ color: 'red' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative' }}>
              <FaSearch style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                pointerEvents: 'none',
                zIndex: 1
              }} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => {
                  setBusqueda(e.target.value);
                  setMostrarLista(true);
                  if (pacienteSeleccionado) setPacienteSeleccionado(null);
                }}
                onFocus={() => setMostrarLista(true)}
                placeholder="Nombre, apellido o DNI del paciente..."
                className="form-input"
                style={{
                  fontSize: '1rem',
                  padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => {
                    setBusqueda('');
                    setPacienteSeleccionado(null);
                    setMostrarLista(false);
                  }}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {mostrarLista && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '0.25rem',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                maxHeight: '350px',
                overflowY: 'auto',
                zIndex: 1000,
                padding: '0.5rem'
              }}>
                {mostrarIniciales && (
                  <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.025em' }}>
                    Pacientes recientes
                  </div>
                )}

                {isLoading ? (
                  <div className="pacientes-loader" style={{ padding: '2rem' }}>
                    <Lottie animationData={loadingAnim} loop autoplay style={{ width: 120 }} />
                  </div>
                ) : listaParaMostrar.length > 0 ? (
                  listaParaMostrar.map(paciente => (
                    <div
                      key={paciente.id}
                      onClick={() => handleSeleccionarPaciente(paciente)}
                      style={{
                        padding: '1rem',
                        cursor: 'pointer',
                        borderRadius: '10px',
                        marginBottom: '0.25rem',
                        transition: 'all 0.2s ease',
                        backgroundColor: pacienteSeleccionado?.id === paciente.id ? '#f1f5f9' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                      onMouseEnter={(e) => {
                        if (pacienteSeleccionado?.id !== paciente.id) {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (pacienteSeleccionado?.id !== paciente.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#e0f2f1',
                        color: '#145c63',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '700',
                        fontSize: '0.9rem'
                      }}>
                        {paciente.nombre[0]}{paciente.apellido[0]}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem' }}>
                          {paciente.nombre} {paciente.apellido}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>DNI: {paciente.dni}</span>
                          {paciente.obraSocial && <span>• {paciente.obraSocial}</span>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                    {busqueda ? 'No se encontraron pacientes para tu búsqueda' : 'No hay pacientes registrados en el sistema'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {pacienteSeleccionado && (
          <div className="form-section" style={{ marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#145c63' }}>Ficha técnica del paciente</h3>
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <FaUser style={{ marginRight: '0.5rem' }} /> Nombre completo
                </div>
                <div style={{ fontWeight: '600' }}>{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</div>
              </div>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <FaIdCard style={{ marginRight: '0.5rem' }} /> DNI / Identificación
                </div>
                <div style={{ fontWeight: '600' }}>{pacienteSeleccionado.dni}</div>
              </div>
              {pacienteSeleccionado.Contacto?.telefonoMovil && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <FaPhone style={{ marginRight: '0.5rem' }} /> Teléfono
                  </div>
                  <div style={{ fontWeight: '600' }}>{pacienteSeleccionado.Contacto.telefonoMovil}</div>
                </div>
              )}
              {pacienteSeleccionado.Contacto?.email && (
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <FaEnvelope style={{ marginRight: '0.5rem' }} /> Email
                  </div>
                  <div style={{ fontWeight: '600' }}>{pacienteSeleccionado.Contacto.email}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="nuevo-turno-actions">
        <button
          className="btn-secondary"
          onClick={() => navigate('/agenda/turnos/nuevo')}
        >
          Volver
        </button>
        <button
          className="btn-primary"
          onClick={handleSiguiente}
          disabled={!pacienteSeleccionado}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}




