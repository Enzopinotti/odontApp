// frontend/src/features/pacientes/components/HistoriaClinicaForm.js
import { useState, useEffect, useMemo } from 'react';
import { FaCalendarAlt, FaStethoscope, FaNotesMedical, FaSave, FaTimes } from 'react-icons/fa';
import { getTratamientos } from '../../../api/clinica';
import ModernSelect from '../../../components/ModernSelect';
import '../../../styles/_historiaClinica.scss';

export default function HistoriaClinicaForm({ pacienteId, onSubmit, onCancel, loading }) {
  const [values, setValues] = useState({
    fecha: new Date().toISOString().split('T')[0],
    turnoId: null,
    motivoConsulta: '',
    diagnostico: '',
    tratamientoId: '',
    evolucion: '',
    observaciones: '',
    proximoControl: '',
  });

  const [turnos] = useState([]);

  const [tratamientos, setTratamientos] = useState([]);
  const [cargandoTratamientos, setCargandoTratamientos] = useState(false);

  useEffect(() => {
    const cargarTratamientos = async () => {
      setCargandoTratamientos(true);
      try {
        const resp = await getTratamientos();
        setTratamientos(resp?.data || []);
      } catch (err) {
        setTratamientos([]);
      } finally { setCargandoTratamientos(false); }
    };
    cargarTratamientos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const optionTurnos = useMemo(() => turnos.map(t => ({
    id: t.id,
    label: `${new Date(t.fecha).toLocaleDateString()} - ${t.hora}${t.tratamiento ? ` (${t.tratamiento})` : ''}`
  })), [turnos]);

  const optionTrats = useMemo(() => tratamientos.map(t => ({
    id: t.id,
    label: t.nombre
  })), [tratamientos]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="admin-modal-card pro-flow" onClick={e => e.stopPropagation()}>
      <header className="am-head">
        <div className="am-title">
          <FaNotesMedical />
          <div>
            <h3>Nueva Entrada de Historia</h3>
            <p>Registro de evolución clínica</p>
          </div>
        </div>
        <button type="button" className="close-x" onClick={onCancel}><FaTimes /></button>
      </header>

      <div className="am-body">
        <div className="historia-form">
          <div className="grid">
            <label className="field">
              <span><FaCalendarAlt /> Fecha de consulta</span>
              <input
                type="date"
                name="fecha"
                value={values.fecha}
                onChange={handleChange}
                required
                max={new Date().toISOString().split('T')[0]}
              />
            </label>

            <label className="field">
              <span>Vincular con turno</span>
              <ModernSelect
                options={optionTurnos}
                value={values.turnoId || ''}
                onChange={(val) => handleSelectChange('turnoId', val)}
                placeholder="Sin vincular"
              />
            </label>

            <label className="field span-2">
              <span>Motivo de consulta <span className="required">*</span></span>
              <input
                type="text"
                name="motivoConsulta"
                value={values.motivoConsulta}
                onChange={handleChange}
                placeholder="Ej: Dolor en molar inferior derecho"
                required
              />
            </label>

            <label className="field">
              <span>Diagnóstico</span>
              <input
                type="text"
                name="diagnostico"
                value={values.diagnostico}
                onChange={handleChange}
                placeholder="Ej: Caries profunda en pieza 46"
              />
            </label>

            <label className="field">
              <span><FaStethoscope /> Tratamiento realizado</span>
              <ModernSelect
                options={optionTrats}
                value={values.tratamientoId}
                onChange={(val) => handleSelectChange('tratamientoId', val)}
                placeholder="Seleccione un tratamiento"
                disabled={cargandoTratamientos}
                searchable
              />
            </label>

            <label className="field span-2">
              <span>Evolución del paciente</span>
              <textarea
                name="evolucion"
                value={values.evolucion}
                onChange={handleChange}
                placeholder="Estado general, respuesta al tratamiento, síntomas reportados"
                rows="4"
              />
            </label>

            <label className="field span-2">
              <span>Observaciones adicionales</span>
              <textarea
                name="observaciones"
                value={values.observaciones}
                onChange={handleChange}
                placeholder="Notas adicionales, recomendaciones, medicación prescrita"
                rows="4"
              />
            </label>

            <label className="field">
              <span>Próximo control sugerido</span>
              <input
                type="date"
                name="proximoControl"
                value={values.proximoControl}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
              <small className="form-hint">Para crear un recordatorio automático</small>
            </label>
          </div>
        </div>
      </div>

      <footer className="am-footer">
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
        <button type="button" className="btn-confirm" disabled={loading} onClick={handleSubmit}>
          <FaSave /> {loading ? 'Guardando...' : 'Registrar Evolución'}
        </button>
      </footer>
    </div>
  );

}