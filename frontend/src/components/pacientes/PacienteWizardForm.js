import { useEffect, useState } from 'react';
import Lottie  from 'lottie-react';
import loadingAnim from '../../assets/video/pacientes-loading.json';

/********* SUB-COMPONENTES DE CADA PASO *********/
function PasoDatos({ datos, onChange, onNext, errors }) {
  return (
    <>
      <h2>Datos personales</h2>
      <div className={styles.grid}>
        <Input label="Nombre"  name="nombre"  value={datos.nombre}  onChange={onChange} error={errors.nombre}  required />
        <Input label="Apellido" name="apellido" value={datos.apellido} onChange={onChange} error={errors.apellido} required />
        <Input label="DNI" name="dni" value={datos.dni} onChange={onChange} error={errors.dni} required />
        <Input label="Obra Social" name="obraSocial" value={datos.obraSocial} onChange={onChange} />
        <Input label="Nro. Afiliado" name="nroAfiliado" value={datos.nroAfiliado} onChange={onChange} />
      </div>

      <NavButtons onNext={onNext} />
    </>
  );
}

function PasoContacto({ contacto, onChange, onNext, onBack, errors }) {
  return (
    <>
      <h2>Contacto</h2>
      <div className={styles.grid}>
        <Input label="Email"  name="email" type="email" value={contacto.email} onChange={onChange} error={errors.email} />
        <Input label="Teléfono móvil"  name="telefonoMovil" value={contacto.telefonoMovil} onChange={onChange} />
        <Input label="Teléfono fijo"   name="telefonoFijo"  value={contacto.telefonoFijo}  onChange={onChange} />
        <div className="field select-field">
          <select name="preferenciaContacto" value={contacto.preferenciaContacto} onChange={onChange}>
            <option value="email">Preferencia: Email</option>
            <option value="telefonoMovil">Preferencia: Móvil</option>
            <option value="telefonoFijo">Preferencia: Fijo</option>
          </select>
          <label>Preferencia de contacto</label>
        </div>
      </div>

      <NavButtons onBack={onBack} onNext={onNext} />
    </>
  );
}

function PasoDireccion({ direccion, onChange, onBack, onSubmit, isLoading, errors }) {
  return (
    <>
      <h2>Dirección</h2>
      <div className={styles.grid}>
        <Input label="Calle"   name="calle"   value={direccion.calle}   onChange={onChange} error={errors.calle}   required />
        <Input label="Número"  name="numero"  value={direccion.numero}  onChange={onChange} />
        <Input label="Detalle" name="detalle" value={direccion.detalle} onChange={onChange} />
        <Input label="Código postal" name="codigoPostal" value={direccion.codigoPostal} onChange={onChange} />
        <Input label="Ciudad"  name="ciudad"  value={direccion.ciudad}  onChange={onChange} error={errors.ciudad} required />
        <Input label="Provincia" name="provincia" value={direccion.provincia} onChange={onChange} />
        <Input label="País" name="pais" value={direccion.pais} onChange={onChange} />
      </div>

      <NavButtons
        onBack={onBack}
        onSubmit={onSubmit}
        isLoading={isLoading}
        isLast
      />
    </>
  );
}

/********* CONTENEDOR PRINCIPAL *********/
export default function PacienteWizardForm({ initialData, onSubmit, isLoading }) {
  /* ---- estado dividido ---- */
  const [datos,      setDatos]      = useState({ nombre:'', apellido:'', dni:'', obraSocial:'', nroAfiliado:'' });
  const [contacto,   setContacto]   = useState({ email:'', telefonoMovil:'', telefonoFijo:'', preferenciaContacto:'email' });
  const [direccion,  setDireccion]  = useState({ calle:'', numero:'', detalle:'', codigoPostal:'', ciudad:'', provincia:'', pais:'' });
  const [errors,     setErrors]     = useState({});
  const [paso,       setPaso]       = useState(1);

  /* ---- cargar datos iniciales (edición) ---- */
  useEffect(() => {
    if (initialData) {
      setDatos({
        nombre      : initialData.nombre      || '',
        apellido    : initialData.apellido    || '',
        dni         : initialData.dni         || '',
        obraSocial  : initialData.obraSocial  || '',
        nroAfiliado : initialData.nroAfiliado || '',
      });
      setContacto({
        email              : initialData.Contacto?.email              || '',
        telefonoMovil      : initialData.Contacto?.telefonoMovil      || '',
        telefonoFijo       : initialData.Contacto?.telefonoFijo       || '',
        preferenciaContacto: initialData.Contacto?.preferenciaContacto|| 'email',
      });
      setDireccion({
        calle       : initialData.Contacto?.Direccion?.calle        || '',
        numero      : initialData.Contacto?.Direccion?.numero       || '',
        detalle     : initialData.Contacto?.Direccion?.detalle      || '',
        codigoPostal: initialData.Contacto?.Direccion?.codigoPostal || '',
        ciudad      : initialData.Contacto?.Direccion?.ciudad       || '',
        provincia   : initialData.Contacto?.Direccion?.provincia    || '',
        pais        : initialData.Contacto?.Direccion?.pais         || '',
      });
    }
  }, [initialData]);

  /* ---- handlers ---- */
  const handleChangeDatos = e => { const {name,value} = e.target; setDatos(prev=>({...prev,[name]:value})); if (errors[name])  setErrors(p=>({...p,[name]:''})); };
  const handleChangeContacto = e => { const {name,value} = e.target; setContacto(prev=>({...prev,[name]:value})); if (errors[name]) setErrors(p=>({...p,[name]:''})); };
  const handleChangeDireccion = e => { const {name,value} = e.target; setDireccion(prev=>({...prev,[name]:value})); if (errors[name]) setErrors(p=>({...p,[name]:''})); };

  /* ---- validación mínima por paso ---- */
  const validarPaso1 = () => {
    const errs = {};
    if (!datos.nombre.trim())   errs.nombre   = 'Requerido';
    if (!datos.apellido.trim()) errs.apellido = 'Requerido';
    if (!datos.dni.trim())      errs.dni      = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validarPaso3 = () => {
    const errs = {};
    if (!direccion.calle.trim()) errs.calle = 'Requerido';
    if (!direccion.ciudad.trim()) errs.ciudad = 'Requerido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  /* ---- navegación de pasos ---- */
  const next = () => {
    if (paso === 1 && !validarPaso1()) return;
    setPaso(paso + 1);
  };
  const back = () => setPaso(paso - 1);

  /* ---- submit global ---- */
  const handleFinish = () => {
    if (!validarPaso3()) return;

    const payload = {
      ...datos,
      Contacto: {
        ...contacto,
        Direccion: { ...direccion },
      },
    };
    onSubmit(payload, setErrors);
  };

  /* ---- render condicional ---- */
  return (
    <section className="paciente-form card">
      {/* indicador simple de pasos */}
      <ProgressIndicator paso={paso} total={3} />

      <form onSubmit={e=>e.preventDefault()}>
        {paso === 1 && (
          <PasoDatos
            datos={datos}
            onChange={handleChangeDatos}
            onNext={next}
            errors={errors}
          />
        )}

        {paso === 2 && (
          <PasoContacto
            contacto={contacto}
            onChange={handleChangeContacto}
            onNext={next}
            onBack={back}
            errors={errors}
          />
        )}

        {paso === 3 && (
          <PasoDireccion
            direccion={direccion}
            onChange={handleChangeDireccion}
            onBack={back}
            onSubmit={handleFinish}
            isLoading={isLoading}
            errors={errors}
          />
        )}
      </form>
    </section>
  );
}

/********* COMPONENTES AUXILIARES *********/
function Input({ label, error, ...rest }) {
  const id = `input-${rest.name}`;
  return (
    <div className={`field float-label ${error ? 'error' : ''}`}>
      <input id={id} placeholder=" " {...rest} />
      <label htmlFor={id}>{label}</label>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}

function NavButtons({ onBack, onNext, onSubmit, isLoading, isLast = false }) {
  return (
    <div className="form-actions">
      {onBack && (
        <button type="button" className="btn-secondary" onClick={onBack}>
          Volver
        </button>
      )}
      {onNext && (
        <button type="button" className="btn-primary" onClick={onNext}>
          Siguiente
        </button>
      )}
      {isLast && (
        <button
          type="button"
          className="btn-primary"
          onClick={onSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <Lottie animationData={loadingAnim} loop autoplay style={{ height: 30 }} />
          ) : (
            'Guardar'
          )}
        </button>
      )}
    </div>
  );
}

function ProgressIndicator({ paso, total }) {
  return (
    <div className={styles.progress}>
      {[...Array(total)].map((_, i) => (
        <span key={i} className={i < paso ? styles.active : ''} />
      ))}
    </div>
  );
}
