// frontend/src/features/pacientes/components/HistoriaClinicaPreview.js
import { FaPlus } from 'react-icons/fa';

export default function HistoriaClinicaPreview({
  historia,
  hcLoading,
  historiaDenied,
  canVerHistoria,
  canCrearHistoria,
  onVerTodo,
  onCrear,
}) {
  // Si no tiene ningún permiso, mostrar mensaje
  if (!canVerHistoria && !canCrearHistoria) {
    return (
      <article className="card span-2">
        <div className="card-head">
          <h3>Historia clínica (reciente)</h3>
        </div>
        <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
      </article>
    );
  }

  return (
    <article className="card span-2">
      <div className="card-head">
        <h3>Historia clínica (reciente)</h3>
        <div className="actions-right">
          {canCrearHistoria && onCrear && (
            <button
              className="btn mini primary"
              onClick={onCrear}
              title="Nueva historia clínica"
            >
              <FaPlus style={{ marginRight: '0.3rem' }} /> Crear
            </button>
          )}
          {canVerHistoria && !historiaDenied && (
            <button className="link-btn" onClick={onVerTodo}>
              Ver todo
            </button>
          )}
        </div>
      </div>

      {hcLoading && <p>Cargando...</p>}

      {!hcLoading && historiaDenied && (
        <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
      )}

      {!hcLoading && !historiaDenied && !historia?.length && (
        <p className="muted">No hay registros recientes</p>
      )}

      {!hcLoading &&
        !historiaDenied &&
        historia?.length > 0 &&
        historia.slice(0, 3).map((entrada) => (
          <div key={entrada.id} className="hc-entry">
            <p>
              <strong>{entrada.motivoConsulta}</strong> —{' '}
              {new Date(entrada.fecha).toLocaleDateString()}
            </p>
            <p className="muted">{entrada.diagnostico}</p>
          </div>
        ))}
    </article>
  );
}