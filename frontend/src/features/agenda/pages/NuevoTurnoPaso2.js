// src/features/agenda/pages/NuevoTurnoPaso2.js
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useBuscarPacientes, useCrearPacienteRapido } from '../hooks/useBuscarPacientes';
import useToast from '../../../hooks/useToast';
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
  
  const { fechaHora, tratamiento, odontologoId, duracion } = location.state || {};
  
  const [busqueda, setBusqueda] = useState('');
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [modo, setModo] = useState('buscar'); // 'buscar' | 'nuevo'
  const [formData, setFormData] = useState(EMPTY_PACIENTE);
  
  const { data: pacientes, isLoading: buscando } = useBuscarPacientes(busqueda, modo === 'buscar');
  const crearPaciente = useCrearPacienteRapido();

  // Si no hay datos del paso anterior, redirigir
  useEffect(() => {
    if (!fechaHora || !tratamiento || !odontologoId) {
      navigate('/agenda/turnos/nuevo');
    }
  }, [fechaHora, tratamiento, odontologoId, navigate]);

  const handleBuscarPaciente = (e) => {
    setBusqueda(e.target.value);
    setModo('buscar');
    setPacienteSeleccionado(null);
  };

  const handleSeleccionarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente);
    setFormData({
      nombre: paciente.nombre,
      apellido: paciente.apellido,
      dni: paciente.dni,
      email: paciente.Contacto?.email || '',
      telefono: paciente.Contacto?.telefonoMovil || '',
      seguro: paciente.obraSocial || '',
      generarRecordatorio: false,
    });
    setModo('buscar');
  };

  const handleCrearPaciente = async () => {
    try {
      const nuevoPaciente = await crearPaciente.mutateAsync({
        nombre: formData.nombre,
        apellido: formData.apellido,
        dni: formData.dni,
        Contacto: {
          email: formData.email || null,
          telefonoMovil: formData.telefono || null,
        },
        obraSocial: formData.seguro || null,
      });
      
      setPacienteSeleccionado(nuevoPaciente);
      showToast('Paciente creado exitosamente', 'success');
    } catch (error) {
      showToast('Error al crear paciente', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSiguiente = () => {
    if (!pacienteSeleccionado) {
      showToast('Debes seleccionar o crear un paciente', 'error');
      return;
    }

    navigate('/agenda/turnos/nuevo/paso3', {
      state: {
        fechaHora,
        tratamiento,
        odontologoId,
        duracion,
        paciente: pacienteSeleccionado,
        datosPaciente: formData,
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
        subtitle="Agregar datos" 
        to="/agenda/turnos/nuevo" 
      />
      
      <div className="nuevo-turno-steps">
        <div className="step completed">
          <div className="step-circle completed">✓</div>
          <div className="step-label">Fecha y Tratamiento</div>
        </div>
        <div className="step active">
          <div className="step-circle active">2</div>
          <div className="step-label active">Datos</div>
        </div>
        <div className="step">
          <div className="step-circle">3</div>
          <div className="step-label">Confirmar</div>
        </div>
      </div>

      <div className="nuevo-turno-form">
        <div className="form-section">
          <label className="form-label">Buscar paciente</label>
          <input
            type="text"
            value={busqueda}
            onChange={handleBuscarPaciente}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="form-input"
          />
          
          {modo === 'buscar' && busqueda.length >= 2 && (
            <div className="pacientes-resultados">
              {buscando ? (
                <div>Cargando...</div>
              ) : pacientes?.length > 0 ? (
                <div className="pacientes-list">
                  {pacientes.map(paciente => (
                    <div
                      key={paciente.id}
                      className="paciente-item"
                      onClick={() => handleSeleccionarPaciente(paciente)}
                    >
                      <div>
                        <strong>{paciente.nombre} {paciente.apellido}</strong>
                        <div>DNI: {paciente.dni}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">No se encontraron pacientes</div>
              )}
            </div>
          )}
        </div>

        <div className="form-section">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setModo(modo === 'buscar' ? 'nuevo' : 'buscar')}
          >
            {modo === 'buscar' ? 'Crear nuevo paciente' : 'Buscar paciente existente'}
          </button>
        </div>

        {modo === 'nuevo' && (
          <div className="form-section">
            <h3>Datos del paciente</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>DNI</label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Número de teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Seguro</label>
                <input
                  type="text"
                  name="seguro"
                  value={formData.seguro}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="generarRecordatorio"
                  checked={formData.generarRecordatorio}
                  onChange={handleChange}
                />
                Generar recordatorio
              </label>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleCrearPaciente}
              disabled={!formData.nombre || !formData.apellido || !formData.dni}
            >
              Crear paciente
            </button>
          </div>
        )}

        {pacienteSeleccionado && (
          <div className="form-section">
            <div className="paciente-seleccionado">
              <h3>Paciente seleccionado:</h3>
              <p><strong>{pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}</strong></p>
              <p>DNI: {pacienteSeleccionado.dni}</p>
              {formData.telefono && <p>Tel: {formData.telefono}</p>}
              {formData.email && <p>Email: {formData.email}</p>}
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


