import { useEffect, useMemo, useState } from 'react';
import { useEstadosPacientes } from '../hooks/useEstadosPacientes';
import ModernSelect from '../../../components/ModernSelect';
import { FaUser, FaHeartbeat, FaPhone, FaMapMarkerAlt, FaChevronRight, FaChevronLeft, FaCheck } from 'react-icons/fa';

/* ... imports unchanged ... */

/* --------- defaults seguros para evitar undefined --------- */
const EMPTY = {
  nombre: '',
  apellido: '',
  dni: '',
  obraSocial: '',
  nroAfiliado: '',
  ultimaVisita: '',
  estadoId: '',
  Contacto: {
    email: '',
    telefonoMovil: '',
    telefonoFijo: '',
    preferenciaContacto: 'email',
    Direccion: {
      calle: '',
      numero: '',
      detalle: '',
      codigoPostal: '',
      ciudad: '',
      provincia: '',
      pais: '',
    },
  },
};

function deepMerge(base, patch) {
  if (Array.isArray(base)) return patch ?? base;
  if (typeof base === 'object' && base !== null) {
    const out = { ...base };
    for (const k of Object.keys(base)) {
      out[k] = deepMerge(base[k], patch?.[k]);
    }
    for (const k of Object.keys(patch || {})) {
      if (!(k in out)) out[k] = patch[k];
    }
    return out;
  }
  return patch ?? base;
}

function setIn(obj, path, value) {
  const keys = path.split('.');
  const clone = structuredClone(obj);
  let cur = clone;
  keys.forEach((k, i) => {
    if (i === keys.length - 1) {
      cur[k] = value;
    } else {
      cur[k] = cur[k] ?? {};
      cur = cur[k];
    }
  });
  return clone;
}

export default function PacienteForm({
  initialData,
  onSubmit,
  isLoading = false,
  pacienteId = null,
  onCancel,
}) {
  const isEdit = Boolean(pacienteId);
  const { data: estadosData } = useEstadosPacientes();
  const estados = useMemo(() => estadosData?.data || [], [estadosData]);

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const normalizedInitial = useMemo(
    () => deepMerge(EMPTY, initialData || {}),
    [initialData]
  );

  const [form, setForm] = useState(normalizedInitial);
  const [errors, setErrors] = useState({});

  const optionsEstados = useMemo(() => estados.map(e => ({ id: e.id, label: e.nombre })), [estados]);
  const optionsPref = [
    { id: 'email', label: 'Email' },
    { id: 'telefono', label: 'Teléfono' },
    { id: 'whatsapp', label: 'WhatsApp' },
  ];

  useEffect(() => {
    setForm(normalizedInitial);
    setErrors({});
  }, [normalizedInitial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => setIn(f, name, value));
  };

  const handleSelectChange = (name, value) => {
    setForm((f) => setIn(f, name, value));
  };

  const validateStep = (s) => {
    const e = {};
    if (s === 1) {
      if (!form.nombre.trim()) e['nombre'] = 'Requerido';
      if (!form.apellido.trim()) e['apellido'] = 'Requerido';
      if (!form.dni.trim()) e['dni'] = 'Requerido';
    }
    if (s === 3) {
      if (form.Contacto?.email && !/.+@.+\..+/.test(form.Contacto.email)) {
        e['Contacto.email'] = 'Email inválido';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(s => Math.min(s + 1, totalSteps));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const submit = (ev) => {
    ev.preventDefault();
    if (!validateStep(step)) return;
    onSubmit?.(form, setErrors);
  };

  const fieldError = (path) => errors[path];

  const stepsInfo = [
    { n: 1, label: 'Básicos', icon: <FaUser /> },
    { n: 2, label: 'Clínica', icon: <FaHeartbeat /> },
    { n: 3, label: 'Contacto', icon: <FaPhone /> },
    { n: 4, label: 'Ubicación', icon: <FaMapMarkerAlt /> },
  ];

  return (
    <form className="paciente-form-wizard" onSubmit={submit} noValidate>
      <div className="wizard-container card">
        <header className="wizard-header">
          <div className="title-group">
            <h3>{isEdit ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
            <p>{isEdit ? 'Actualizando expediente clínico' : 'Registro de nuevo ingreso al consultorio'}</p>
          </div>
          <div className="step-badge">Paso {step} de {totalSteps}</div>
        </header>

        <nav className="wizard-nav">
          {stepsInfo.map(s => (
            <div
              key={s.n}
              className={`nav-item ${step === s.n ? 'active' : ''} ${step > s.n ? 'done' : ''}`}
              onClick={() => step > s.n && setStep(s.n)}
            >
              <div className="nav-circle">{step > s.n ? <FaCheck /> : s.icon}</div>
              <span className="nav-label">{s.label}</span>
            </div>
          ))}
        </nav>

        <div className="wizard-body">
          {step === 1 && (
            <div className="step-content animate-in">
              <div className="section-title">Datos de Identidad</div>
              <div className="form-grid">
                <div className={`field ${fieldError('apellido') ? 'has-error' : ''}`}>
                  <label htmlFor="p-apellido">Apellido *</label>
                  <input id="p-apellido" type="text" name="apellido" value={form.apellido} onChange={handleChange} placeholder="Ej: Pérez" autoComplete="family-name" />
                  {fieldError('apellido') && <small>{fieldError('apellido')}</small>}
                </div>
                <div className={`field ${fieldError('nombre') ? 'has-error' : ''}`}>
                  <label htmlFor="p-nombre">Nombre *</label>
                  <input id="p-nombre" type="text" name="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Juan" autoComplete="given-name" />
                  {fieldError('nombre') && <small>{fieldError('nombre')}</small>}
                </div>
                <div className={`field ${fieldError('dni') ? 'has-error' : ''}`}>
                  <label htmlFor="p-dni">DNI / Pasaporte *</label>
                  <input id="p-dni" type="text" name="dni" value={form.dni} onChange={handleChange} placeholder="Sin puntos ni espacios" inputMode="numeric" />
                  {fieldError('dni') && <small>{fieldError('dni')}</small>}
                </div>
                <div className="field">
                  <label htmlFor="p-estado">Estado del Paciente</label>
                  <ModernSelect id="p-estado" options={optionsEstados} value={form.estadoId || ''} onChange={(val) => handleSelectChange('estadoId', val)} placeholder="Ej: Activo" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content animate-in">
              <div className="section-title">Información Clínica y Cobertura</div>
              <div className="form-grid">
                <div className="field">
                  <label htmlFor="p-os">Obra Social / Prepaga</label>
                  <input id="p-os" type="text" name="obraSocial" value={form.obraSocial} onChange={handleChange} placeholder="Ej: OSDE, PAMI..." />
                </div>
                <div className="field">
                  <label htmlFor="p-nro">Nro. Afiliado</label>
                  <input id="p-nro" type="text" name="nroAfiliado" value={form.nroAfiliado} onChange={handleChange} placeholder="Código de credencial" />
                </div>
                <div className="field">
                  <label htmlFor="p-uv">Última Visita (Histórico)</label>
                  <input id="p-uv" type="date" name="ultimaVisita" value={form.ultimaVisita || ''} onChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content animate-in">
              <div className="section-title">Vías de Contacto</div>
              <div className="form-grid">
                <div className={`field ${fieldError('Contacto.email') ? 'has-error' : ''}`}>
                  <label htmlFor="p-email">Correo Electrónico</label>
                  <input id="p-email" type="email" name="Contacto.email" value={form.Contacto.email} onChange={handleChange} placeholder="ejemplo@correo.com" autoComplete="email" />
                  {fieldError('Contacto.email') && <small>{fieldError('Contacto.email')}</small>}
                </div>
                <div className="field">
                  <label htmlFor="p-movil">Teléfono Móvil (WhatsApp)</label>
                  <input id="p-movil" type="tel" name="Contacto.telefonoMovil" value={form.Contacto.telefonoMovil} onChange={handleChange} placeholder="Código de área + número" autoComplete="tel" />
                </div>
                <div className="field">
                  <label htmlFor="p-fijo">Teléfono Fijo</label>
                  <input id="p-fijo" type="tel" name="Contacto.telefonoFijo" value={form.Contacto.telefonoFijo} onChange={handleChange} placeholder="Solo si aplica" autoComplete="tel" />
                </div>
                <div className="field">
                  <label htmlFor="p-pref">Preferencia para Agenda</label>
                  <ModernSelect id="p-pref" options={optionsPref} value={form.Contacto.preferenciaContacto} onChange={(val) => handleSelectChange('Contacto.preferenciaContacto', val)} />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="step-content animate-in">
              <div className="section-title">Localización y Domicilio</div>
              <div className="form-grid">
                <div className="field span-2">
                  <label htmlFor="p-calle">Calle / Avenida</label>
                  <input id="p-calle" type="text" name="Contacto.Direccion.calle" value={form.Contacto.Direccion.calle} onChange={handleChange} placeholder="Nombre de la calle" autoComplete="address-line1" />
                </div>
                <div className="field">
                  <label htmlFor="p-num">Nro.</label>
                  <input id="p-num" type="text" name="Contacto.Direccion.numero" value={form.Contacto.Direccion.numero} onChange={handleChange} placeholder="Altura" autoComplete="address-line2" />
                </div>
                <div className="field">
                  <label htmlFor="p-det">Piso / Depto</label>
                  <input id="p-det" type="text" name="Contacto.Direccion.detalle" value={form.Contacto.Direccion.detalle} onChange={handleChange} placeholder="Ej: 2B" />
                </div>
                <div className="field">
                  <label htmlFor="p-cp">Cód. Postal</label>
                  <input id="p-cp" type="text" name="Contacto.Direccion.codigoPostal" value={form.Contacto.Direccion.codigoPostal} onChange={handleChange} placeholder="CP" autoComplete="postal-code" />
                </div>
                <div className="field">
                  <label htmlFor="p-ciu">Ciudad</label>
                  <input id="p-ciu" type="text" name="Contacto.Direccion.ciudad" value={form.Contacto.Direccion.ciudad} onChange={handleChange} placeholder="Localidad" autoComplete="address-level2" />
                </div>
                <div className="field">
                  <label htmlFor="p-pro">Provincia / Estado</label>
                  <input id="p-pro" type="text" name="Contacto.Direccion.provincia" value={form.Contacto.Direccion.provincia} onChange={handleChange} placeholder="Provincia" autoComplete="address-level1" />
                </div>
                <div className="field">
                  <label htmlFor="p-pais">País</label>
                  <input id="p-pais" type="text" name="Contacto.Direccion.pais" value={form.Contacto.Direccion.pais} onChange={handleChange} placeholder="País" autoComplete="country-name" />
                </div>
              </div>
            </div>
          )}
        </div>

        <footer className="wizard-foot">
          {step === 1 ? (
            <button type="button" className="btn-cancel" onClick={onCancel}>Cancelar</button>
          ) : (
            <button type="button" className="btn-back" onClick={prevStep}><FaChevronLeft /> Anterior</button>
          )}

          {step < totalSteps ? (
            <button type="button" className="btn-next" onClick={nextStep}>Siguiente <FaChevronRight /></button>
          ) : (
            <button type="submit" className="btn-save" disabled={isLoading}>
              {isLoading ? 'Registrando...' : (isEdit ? 'Guardar Cambios' : 'Finalizar Registro')}
            </button>
          )}
        </footer>
      </div>
    </form>
  );
}
