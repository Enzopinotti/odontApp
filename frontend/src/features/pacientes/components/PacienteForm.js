// src/components/pacientes/PacienteForm.jsx
import { useEffect, useMemo, useState } from 'react';

/* --------- defaults seguros para evitar undefined --------- */
const EMPTY = {
  nombre: '',
  apellido: '',
  dni: '',
  obraSocial: '',
  nroAfiliado: '',
  ultimaVisita: '',
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
    // copia keys extra de patch
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
  pacienteId = null,   // ← si existe estamos en modo edición
  onCancel,            // opcional
}) {
  const isEdit = Boolean(pacienteId);

  const normalizedInitial = useMemo(
    () => deepMerge(EMPTY, initialData || {}),
    [initialData]
  );

  const [form, setForm] = useState(normalizedInitial);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(normalizedInitial);
    setErrors({});
  }, [normalizedInitial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => setIn(f, name, value));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e['nombre'] = 'Requerido';
    if (!form.apellido.trim()) e['apellido'] = 'Requerido';
    if (!form.dni.trim()) e['dni'] = 'Requerido';
    // ejemplo de validación simple de email (opcional)
    if (form.Contacto?.email && !/.+@.+\..+/.test(form.Contacto.email)) {
      e['Contacto.email'] = 'Email inválido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    // Pasamos setErrors para que el caller pueda setear errores por campo
    onSubmit?.(form, setErrors);
  };

  const fieldError = (path) => errors[path];

  return (
    <form className="paciente-form" onSubmit={submit} noValidate>
      <div className="card">
        <h3>{isEdit ? 'Editar paciente' : 'Nuevo paciente'}</h3>

        {/* ---------- Datos personales ---------- */}
        <fieldset className="fieldset">
          <legend>Datos personales</legend>

          <div className="grid">
            <label className={fieldError('apellido') ? 'has-error' : ''}>
              <span>Apellido *</span>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                autoComplete="family-name"
              />
              {fieldError('apellido') && <small>{fieldError('apellido')}</small>}
            </label>

            <label className={fieldError('nombre') ? 'has-error' : ''}>
              <span>Nombre *</span>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                autoComplete="given-name"
              />
              {fieldError('nombre') && <small>{fieldError('nombre')}</small>}
            </label>

            <label className={`span-2 ${fieldError('dni') ? 'has-error' : ''}`}>
              <span>DNI *</span>
              <input
                type="text"
                name="dni"
                value={form.dni}
                onChange={handleChange}
                inputMode="numeric"
              />
              {fieldError('dni') && <small>{fieldError('dni')}</small>}
            </label>

            <label>
              <span>Obra Social</span>
              <input
                type="text"
                name="obraSocial"
                value={form.obraSocial}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>N° Afiliado</span>
              <input
                type="text"
                name="nroAfiliado"
                value={form.nroAfiliado}
                onChange={handleChange}
              />
            </label>

            <label className="span-2">
              <span>Última visita</span>
              <input
                type="date"
                name="ultimaVisita"
                value={form.ultimaVisita || ''}
                onChange={handleChange}
              />
            </label>
          </div>
        </fieldset>

        {/* ---------- Contacto ---------- */}
        <fieldset className="fieldset">
          <legend>Contacto</legend>

          <div className="grid">
            <label className={fieldError('Contacto.email') ? 'has-error' : ''}>
              <span>Email</span>
              <input
                type="email"
                name="Contacto.email"
                value={form.Contacto.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {fieldError('Contacto.email') && <small>{fieldError('Contacto.email')}</small>}
            </label>

            <label>
              <span>Teléfono móvil</span>
              <input
                type="tel"
                name="Contacto.telefonoMovil"
                value={form.Contacto.telefonoMovil}
                onChange={handleChange}
                autoComplete="tel"
              />
            </label>

            <label>
              <span>Teléfono fijo</span>
              <input
                type="tel"
                name="Contacto.telefonoFijo"
                value={form.Contacto.telefonoFijo}
                onChange={handleChange}
                autoComplete="tel"
              />
            </label>

            <label className="span-2">
              <span>Preferencia de contacto</span>
              <select
                name="Contacto.preferenciaContacto"
                value={form.Contacto.preferenciaContacto}
                onChange={handleChange}
              >
                <option value="email">Email</option>
                <option value="telefono">Teléfono</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </label>
          </div>
        </fieldset>

        {/* ---------- Dirección ---------- */}
        <fieldset className="fieldset">
          <legend>Dirección</legend>

          <div className="grid">
            <label className="span-2">
              <span>Calle</span>
              <input
                type="text"
                name="Contacto.Direccion.calle"
                value={form.Contacto.Direccion.calle}
                onChange={handleChange}
                autoComplete="address-line1"
              />
            </label>

            <label>
              <span>Número</span>
              <input
                type="text"
                name="Contacto.Direccion.numero"
                value={form.Contacto.Direccion.numero}
                onChange={handleChange}
                autoComplete="address-line2"
              />
            </label>

            <label className="span-2">
              <span>Detalle</span>
              <input
                type="text"
                name="Contacto.Direccion.detalle"
                value={form.Contacto.Direccion.detalle}
                onChange={handleChange}
              />
            </label>

            <label>
              <span>Código Postal</span>
              <input
                type="text"
                name="Contacto.Direccion.codigoPostal"
                value={form.Contacto.Direccion.codigoPostal}
                onChange={handleChange}
                autoComplete="postal-code"
              />
            </label>

            <label>
              <span>Ciudad</span>
              <input
                type="text"
                name="Contacto.Direccion.ciudad"
                value={form.Contacto.Direccion.ciudad}
                onChange={handleChange}
                autoComplete="address-level2"
              />
            </label>

            <label>
              <span>Provincia</span>
              <input
                type="text"
                name="Contacto.Direccion.provincia"
                value={form.Contacto.Direccion.provincia}
                onChange={handleChange}
                autoComplete="address-level1"
              />
            </label>

            <label>
              <span>País</span>
              <input
                type="text"
                name="Contacto.Direccion.pais"
                value={form.Contacto.Direccion.pais}
                onChange={handleChange}
                autoComplete="country-name"
              />
            </label>
          </div>
        </fieldset>

        {/* ---------- Acciones ---------- */}
        <div className="form-actions">
          {onCancel && (
            <button type="button" className="btn ghost" onClick={onCancel}>
              Cancelar
            </button>
          )}
          <button type="submit" className="btn primary" disabled={isLoading}>
            {isEdit ? 'Guardar cambios' : 'Crear paciente'}
          </button>
        </div>
      </div>
    </form>
  );
}
