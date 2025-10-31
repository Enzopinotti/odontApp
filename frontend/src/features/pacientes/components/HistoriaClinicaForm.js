// frontend/src/features/pacientes/components/HistoriaClinicaForm.js
import { useState, useEffect } from 'react';
import { getTratamientos } from '../../../api/clinica';
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

  const [turnos, setTurnos] = useState([]);
  const [tratamientos, setTratamientos] = useState([]);
  const [cargandoTratamientos, setCargandoTratamientos] = useState(false);

  // Cargar tratamientos
  useEffect(() => {
    const cargarTratamientos = async () => {
      setCargandoTratamientos(true);
      try {
        const resp = await getTratamientos();
        setTratamientos(resp?.data || []);
      } catch (err) {
        console.error('Error al cargar tratamientos:', err);
        setTratamientos([]);
      } finally {
        setCargandoTratamientos(false);
      }
    };
    cargarTratamientos();
  }, []);

  // Simulación de turnos
  useEffect(() => {
    const turnoFijo = { id: 123, fecha: new Date(), hora: '10:00', tratamiento: 'Limpieza' };
    setTurnos([turnoFijo]);
    setValues((prev) => ({ ...prev, turnoId: turnoFijo.id }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="historia-form-wrapper">
      <form className="historia-form" onSubmit={handleSubmit}>
        <div className="grid">
          <label>
            Fecha de consulta
            <input
              type="date"
              name="fecha"
              value={values.fecha}
              onChange={handleChange}
              required
              max={new Date().toISOString().split('T')[0]}
            />
          </label>

          <label>
            Vincular con turno (opcional)
            <select
              name="turnoId"
              value={values.turnoId || ''}
              onChange={handleChange}
            >
              <option value="">Sin vincular</option>
              {turnos.map((turno) => (
                <option key={turno.id} value={turno.id}>
                  {new Date(turno.fecha).toLocaleDateString()} - {turno.hora}
                  {turno.tratamiento && ` (${turno.tratamiento})`}
                </option>
              ))}
            </select>
          </label>

          <label className="span-2">
            Motivo de consulta <span className="required">*</span>
            <input
              type="text"
              name="motivoConsulta"
              value={values.motivoConsulta}
              onChange={handleChange}
              placeholder="Ej: Dolor en molar inferior derecho"
              required
            />
          </label>

          <label>
            Diagnóstico
            <input
              type="text"
              name="diagnostico"
              value={values.diagnostico}
              onChange={handleChange}
              placeholder="Ej: Caries profunda en pieza 46"
            />
          </label>

          <label>
            Tratamiento realizado
            <select
              name="tratamientoId"
              value={values.tratamientoId}
              onChange={handleChange}
              disabled={cargandoTratamientos}
              required
            >
              <option value="">Seleccione un tratamiento</option>
              {tratamientos.map((t) => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </label>

          <label className="span-2">
            Evolución del paciente
            <textarea
              name="evolucion"
              value={values.evolucion}
              readOnly // ✅ bloqueado
              placeholder="Estado general, respuesta al tratamiento, síntomas reportados"
              rows="4"
            />
          </label>

          <label className="span-2">
            Observaciones adicionales
            <textarea
              name="observaciones"
              value={values.observaciones}
              readOnly // ✅ bloqueado
              placeholder="Notas adicionales, recomendaciones, medicación prescrita"
              rows="4"
            />
          </label>

          <label>
            Próximo control sugerido (opcional)
            <input
              type="date"
              name="proximoControl"
              value={values.proximoControl}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
            <small className="form-hint">
              Si se programa, se puede crear un recordatorio automático
            </small>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="btn primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar historia clínica'}
          </button>
        </div>
      </form>
    </div>
  );
}
