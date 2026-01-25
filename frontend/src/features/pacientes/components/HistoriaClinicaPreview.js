// frontend/src/features/pacientes/components/HistoriaClinicaPreview.js
import {
  FaPlus, FaClipboardList, FaNotesMedical, FaExternalLinkAlt,
  FaChevronUp, FaChevronDown, FaExpandArrowsAlt, FaCompressAlt
} from 'react-icons/fa';

export default function HistoriaClinicaPreview({
  historia,
  hcLoading,
  historiaDenied,
  canVerHistoria,
  canCrearHistoria,
  onVerTodo,
  onCrear,
  isCollapsed,
  onToggleCollapse,
  dragHandle,
  isWide,
  onToggleWide
}) {
  // Si no tiene ningún permiso, mostrar mensaje
  if (!canVerHistoria && !canCrearHistoria) {
    return (
      <div className="section-card">
        <div className="card-title">
          <h3><FaNotesMedical className="title-icon" /> Evolución y Notas</h3>
        </div>
        <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
      </div>
    );
  }

  return (
    <div className={`section-card ${isCollapsed ? 'is-collapsed' : ''} ${isWide ? 'is-wide-card' : ''}`} style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-title">
        <div className="title-left">
          {dragHandle}
          <h3><FaNotesMedical className="title-icon" /> Evolución y Notas</h3>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {!isCollapsed && canCrearHistoria && onCrear && (
            <button className="btn-create-pro" onClick={onCrear}>
              <FaPlus /> Nueva Entrada
            </button>
          )}
          <button className="btn-resize" onClick={onToggleWide} title={isWide ? 'Contraer ancho' : 'Expandir ancho'}>
            {isWide ? <FaCompressAlt /> : <FaExpandArrowsAlt />}
          </button>
          <button className="btn-collapse" onClick={onToggleCollapse}>
            {isCollapsed ? <FaChevronDown /> : <FaChevronUp />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          <div className="card-body" style={{ flex: 1 }}>
            {hcLoading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                <p>Cargando registros...</p>
              </div>
            ) : historiaDenied ? (
              <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
            ) : !historia?.length ? (
              <div className="alerts-empty" style={{ background: 'transparent', border: 'none', padding: '1rem 0' }}>
                <p>No se registran notas de evolución recientes.</p>
              </div>
            ) : (
              <div className="hc-list-pro">
                {historia.slice(0, 2).map((entrada) => (
                  <div key={entrada.id} className="hc-entry-pro">
                    <div className="entry-badge">
                      <FaClipboardList />
                    </div>
                    <div className="entry-content">
                      <div className="entry-head">
                        <h4 className="motive">{entrada.motivoConsulta}</h4>
                        <span className="date">{new Date(entrada.fecha).toLocaleDateString()}</span>
                      </div>
                      <div className="entry-body">
                        {entrada.sintomas && (
                          <p><strong>Síntomas:</strong> {entrada.sintomas}</p>
                        )}
                        <div className="diagnosis">
                          {entrada.diagnostico || 'Sin diagnóstico detallado registrado.'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canVerHistoria && !historiaDenied && historia?.length > 0 && (
            <div className="action-footer" style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
              <button className="btn-action" onClick={onVerTodo}>
                <FaExternalLinkAlt /> Ver Historial Completo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}