import { useContext, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BackBar from '../../../components/BackBar';
import { AuthCtx } from '../../../context/AuthProvider';
import usePaciente from '../hooks/usePaciente';
import usePacienteExtra from '../hooks/usePacienteExtra';
import usePrefetchPaciente from '../hooks/usePrefetchPaciente';
import useOdontoMut from '../../odontograma/hooks/useOdontogramaMutations';
import useToast from '../../../hooks/useToast';
import useModal from '../../../hooks/useModal';
import { handleApiError } from '../../../utils/handleApiError';
import {
  FaEdit, FaHistory, FaImages,
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaCopy, FaExternalLinkAlt
} from 'react-icons/fa';

function copy(text, showToast) {
  if (!text) return;
  navigator.clipboard?.writeText(text);
  showToast('Copiado al portapapeles', 'success');
}
const onlyDigits = (s) => (s || '').replace(/\D+/g, '');
const buildWhatsApp = (tel) => {
  const t = onlyDigits(tel);
  if (!t) return null;
  return `https://wa.me/${t}`;
};
const buildMaps = (dir) => {
  if (!dir) return null;
  const str = [dir.calle, dir.numero, dir.ciudad, dir.provincia, dir.pais].filter(Boolean).join(' ');
  if (!str.trim()) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(str)}`;
};

export default function PacienteDetalle() {
  const { id } = useParams();
  const pacienteId = Number(id);
  const navigate = useNavigate();
  const location = useLocation();
  const preview = location.state?.pacientePreview;

  const { hasPermiso } = useContext(AuthCtx);
  const { showToast } = useToast();
  const { showModal } = useModal();
  const prefetchPaciente = usePrefetchPaciente();
  const { crear: crearOdonto } = useOdontoMut();

  // 🔐 Permisos por recurso/acción
  const canVerPaciente       = hasPermiso('pacientes', 'listar');
  const canEditarPaciente    = hasPermiso('pacientes', 'editar');
  const canVerOdontograma    = hasPermiso('odontograma', 'ver');
  const canEditarOdontograma = hasPermiso('odontograma', 'editar');
  const canVerHistoria       = hasPermiso('historia', 'ver') || hasPermiso('pacientes', 'listar');
  const canVerImagenes       = hasPermiso('historia', 'ver') || hasPermiso('pacientes', 'listar');
  const canVerTratamientos   = hasPermiso('tratamientos', 'listar');

  // Paciente (si no tiene permiso, NO disparamos la query)
  const { data: paciente, isLoading, isError, error } = usePaciente(pacienteId, canVerPaciente);

  // Extras (usa contadores enriquecidos y refetch-on-mount para el odo)
  const {
    odontograma, odLoading, odoDenied,
    historia, hcLoading, historiaDenied,
    imagenes, imgLoading, imagenesDenied,
    tratamientos, trLoading, tratamientosDenied,
  } = usePacienteExtra(pacienteId, {
    canVerOdontograma,
    canVerHistoria,
    canVerImagenes,
    canVerTratamientos,
  });

  useEffect(() => {
    if (canVerPaciente && isError) {
      handleApiError(error, showToast, null, showModal);
      navigate('/pacientes');
    }
  }, [canVerPaciente, isError, error, showToast, showModal, navigate]);

  const title = useMemo(() => {
    if (paciente) return `${paciente.apellido || ''} ${paciente.nombre || ''}`.trim() || 'Detalle del paciente';
    if (preview)  return `${preview.apellido || ''} ${preview.nombre || ''}`.trim() || 'Detalle del paciente';
    return 'Detalle del paciente';
  }, [paciente, preview]);

  const tel   = paciente?.Contacto?.telefonoMovil || paciente?.Contacto?.telefonoFijo || null;
  const email = paciente?.Contacto?.email || null;
  const dir   = paciente?.Contacto?.Direccion || null;
  const pref  = paciente?.Contacto?.preferenciaContacto || null;

  const estadoGeneral = odontograma?.estadoGeneral || '—';
  const fechaOdo = (() => {
    const f = odontograma?.fechaCreacion || odontograma?.createdAt;
    return f ? new Date(f).toLocaleDateString() : '—';
  })();
  const totalDientes = odontograma?.totalDientes ?? 0; // ← ya viene del hook enriquecido

  const ultimoTurno = paciente?.ultimaVisita ? new Date(paciente.ultimaVisita).toLocaleDateString() : '—';

  const goEditar      = () =>
    navigate(`/pacientes/${pacienteId}/editar`, {
      state: { pacientePreview: { id: pacienteId, nombre: paciente?.nombre, apellido: paciente?.apellido }, backTo: location.pathname },
    });
  const goOdontograma = () => navigate(`/pacientes/${pacienteId}/odontograma`);
  const goHistoria    = () => navigate(`/pacientes/${pacienteId}/historia`);
  const goImagenes    = () => navigate(`/pacientes/${pacienteId}/imagenes`);

  // const waLink   = buildWhatsApp(tel);
  // const mapsLink = buildMaps(dir);

  if (!canVerPaciente) {
    return (
      <div className="paciente-detalle-page">
        <BackBar title={title} to="/pacientes" />
        <section className="card">
          <h3>Sin acceso</h3>
          <p className="muted">Tu rol no tiene permiso para ver el detalle de este paciente.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="paciente-detalle-page">
      <BackBar
        title={title}
        to="/pacientes"
        right={
          <div className="actions-right">
            {canEditarPaciente && (
              <button
                className="btn ghost"
                onMouseEnter={() => prefetchPaciente(pacienteId)}
                onFocus={() => prefetchPaciente(pacienteId)}
                onClick={goEditar}
                aria-label="Editar paciente"
                title="Editar paciente"
              >
                <FaEdit />
                <span>Editar</span>
              </button>
            )}
          </div>
        }
      />

      {/* HEADER */}
      <section className="card detalle-header">
        {isLoading ? (
          <div className="header-skeleton">
            <div className="sk-avatar skeleton" />
            <div className="sk-lines">
              <div className="skeleton sk-line w180" />
              <div className="skeleton sk-line w120" />
              <div className="skeleton sk-line w240" />
            </div>
          </div>
        ) : (
          <div className="header-grid">
            <div className="identidad">
              <div className="avatar" aria-hidden>
                {paciente?.apellido?.[0]?.toUpperCase()}{paciente?.nombre?.[0]?.toUpperCase()}
              </div>
              <div className="id-text">
                <h2>{paciente?.apellido}, {paciente?.nombre}</h2>
                <p className="muted">
                  DNI: <strong>{paciente?.dni}</strong>
                  <button className="icon-btn" onClick={() => copy(paciente?.dni, showToast)} title="Copiar DNI" aria-label="Copiar DNI">
                    <FaCopy />
                  </button>
                </p>
                <div className="pills">
                  {paciente?.obraSocial && <span className="pill">Obra Social: {paciente.obraSocial}</span>}
                  {paciente?.nroAfiliado && <span className="pill">Afiliado: {paciente.nroAfiliado}</span>}
                  <span className="pill">Últ. visita: {ultimoTurno}</span>
                  {pref && <span className="pill pref">Pref.: {pref}</span>}
                </div>
              </div>
            </div>

            {/* 👇 Sacamos el botón redundante de Odontograma */}
            <div className="quick-actions">
              {canVerHistoria && (
                <button className="qa-btn" onClick={goHistoria} title="Historia clínica">
                  <FaHistory /><span>Historia</span>
                </button>
              )}
              {canVerImagenes && (
                <button className="qa-btn" onClick={goImagenes} title="Imágenes">
                  <FaImages /><span>Imágenes</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* GRID PRINCIPAL */}
      <section className="grid-2">
        {/* Contacto & Dirección */}
        <article className="card">
          <h3>Contacto</h3>
          {isLoading ? (
            <div className="skeleton-block">
              <div className="skeleton sk-line" />
              <div className="skeleton sk-line w200" />
              <div className="skeleton sk-line w150" />
            </div>
          ) : (
            <>
              <div className="info-list">
                <div className="info-row">
                  <FaPhone />
                  {tel ? (
                    <>
                      <a href={`tel:${tel}`}>{tel}</a>
                      <button className="icon-btn" onClick={() => copy(tel, showToast)} title="Copiar teléfono" aria-label="Copiar teléfono"><FaCopy /></button>
                    </>
                  ) : <span className="muted">—</span>}
                </div>
                <div className="info-row">
                  <FaEnvelope />
                  {email ? (
                    <>
                      <a href={`mailto:${email}`}>{email}</a>
                      <button className="icon-btn" onClick={() => copy(email, showToast)} title="Copiar email" aria-label="Copiar email"><FaCopy /></button>
                    </>
                  ) : <span className="muted">—</span>}
                </div>
                <div className="info-row">
                  <FaMapMarkerAlt />
                  {dir ? (
                    <span>
                      {dir.calle || ''} {dir.numero || ''}{dir.calle || dir.numero ? ', ' : ''}
                      {dir.ciudad || ''}{dir.ciudad ? ', ' : ''}{dir.provincia || ''}{dir.provincia ? ', ' : ''}{dir.pais || ''}
                    </span>
                  ) : <span className="muted">—</span>}
                </div>
              </div>
              {(buildWhatsApp(tel) || buildMaps(dir)) && (
                <div className="contact-actions">
                  {buildWhatsApp(tel) && <a className="btn mini ghost" href={buildWhatsApp(tel)} target="_blank" rel="noreferrer">WhatsApp</a>}
                  {buildMaps(dir) && <a className="btn mini ghost" href={buildMaps(dir)} target="_blank" rel="noreferrer">Abrir mapa</a>}
                </div>
              )}
            </>
          )}
        </article>

        {/* Odontograma - resumen o CTA de creación */}
        {canVerOdontograma ? (
          <article className="card">
            <h3>Odontograma</h3>

            {odLoading ? (
              <div className="skeleton-block">
                <div className="skeleton sk-line w140" />
                <div className="skeleton sk-line w120" />
                <div className="skeleton sk-line w180" />
              </div>
            ) : odoDenied ? (
              <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
            ) : odontograma === null ? (
              <div className="empty-odo">
                <p className="muted">Este paciente no tiene odontograma.</p>
                {canEditarOdontograma && (
                  <button
                    className="btn primary"
                    onClick={() => crearOdonto.mutate({ pacienteId, observaciones: '' })}
                    disabled={crearOdonto.isLoading}
                  >
                    {crearOdonto.isLoading ? 'Creando…' : 'Crear odontograma'}
                  </button>
                )}
              </div>
            ) : (
              <div className="odo-resumen">
                <div className={`badge estado ${String(estadoGeneral).toLowerCase().replace(/\s+/g,'_')}`}>{estadoGeneral}</div>
                <p className="muted">Creado: {fechaOdo}</p>
                <div className="stats">
                  <div className="stat">
                    <span className="stat-num">{totalDientes}</span>
                    <span className="stat-label">Dientes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-num">{odontograma?.carasTratadasCount ?? '—'}</span>
                    <span className="stat-label">Caras tratadas</span>
                  </div>
                  <div className="stat">
                    <span className="stat-num">{odontograma?.pendientesCount ?? '—'}</span>
                    <span className="stat-label">Pendientes</span>
                  </div>
                </div>
                <button className="link-btn" onClick={goOdontograma}>
                  Abrir odontograma <FaExternalLinkAlt />
                </button>
              </div>
            )}
          </article>
        ) : (
          <article className="card">
            <h3>Odontograma</h3>
            <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
          </article>
        )}

        {/* Historia Clínica - últimas entradas */}
        {canVerHistoria ? (
          <article className="card span-2">
            <div className="card-head">
              <h3>Historia clínica (reciente)</h3>
              {!historiaDenied && <button className="link-btn" onClick={goHistoria}>Ver todo</button>}
            </div>
            {hcLoading ? (
              <div className="skeleton-list">
                <div className="skeleton sk-line" />
                <div className="skeleton sk-line" />
                <div className="skeleton sk-line" />
              </div>
            ) : historiaDenied ? (
              <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
            ) : historia?.length ? (
              <ul className="timeline">
                {historia.slice(0, 5).map((h) => (
                  <li key={h.id}>
                    <div className="tl-date">{h.fecha ? new Date(h.fecha).toLocaleDateString() : '—'}</div>
                    <div className="tl-body">
                      {h.motivoConsulta && <p><strong>Motivo:</strong> {h.motivoConsulta}</p>}
                      {h.diagnostico && <p><strong>Diagnóstico:</strong> {h.diagnostico}</p>}
                      {h.evolucion && <p><strong>Evolución:</strong> {h.evolucion}</p>}
                      {h.observaciones && <p className="muted">{h.observaciones}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Sin entradas aún.</p>
            )}
          </article>
        ) : (
          <article className="card span-2">
            <div className="card-head"><h3>Historia clínica (reciente)</h3></div>
            <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
          </article>
        )}

        {/* Imágenes recientes */}
        {canVerImagenes ? (
          <article className="card">
            <div className="card-head">
              <h3>Imágenes</h3>
              {!imagenesDenied && <button className="link-btn" onClick={goImagenes}>Ver todas</button>}
            </div>
            {imgLoading ? (
              <div className="skeleton-grid">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton sk-thumb" />)}
              </div>
            ) : imagenesDenied ? (
              <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
            ) : imagenes?.length ? (
              <div className="thumb-grid">
                {imagenes.slice(0, 6).map((img) => (
                  <a key={img.id} href={img.url} target="_blank" rel="noreferrer" className="thumb">
                    <img src={img.url} alt={img.tipoImagen || 'Imagen clínica'} />
                    <span className="thumb-caption">
                      {img.tipoImagen || 'Imagen'} · {img.fechaCarga ? new Date(img.fechaCarga).toLocaleDateString() : '—'}
                    </span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="muted">Sin imágenes.</p>
            )}
          </article>
        ) : (
          <article className="card">
            <div className="card-head"><h3>Imágenes</h3></div>
            <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
          </article>
        )}

        {/* Tratamientos (historial) */}
        {canVerTratamientos ? (
          <article className="card">
            <h3>Tratamientos</h3>
            {trLoading ? (
              <div className="skeleton-list">
                <div className="skeleton sk-line" />
                <div className="skeleton sk-line" />
              </div>
            ) : tratamientosDenied ? (
              <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
            ) : tratamientos?.length ? (
              <ul className="treat-list">
                {tratamientos.slice(0, 6).map((t) => (
                  <li key={t.id}>
                    <div className="treat-name">{t.nombre || t.Tratamiento?.nombre || 'Tratamiento'}</div>
                    <div className="muted small">
                      {t.fecha ? new Date(t.fecha).toLocaleDateString() : '—'}
                      {t.estado ? ` · ${t.estado}` : ''}
                      {typeof t.precio === 'number' ? ` · $${t.precio.toFixed(2)}` : ''}
                      {typeof t.duracionMin === 'number' ? ` · ${t.duracionMin} min` : ''}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">Sin tratamientos registrados.</p>
            )}
          </article>
        ) : (
          <article className="card">
            <h3>Tratamientos</h3>
            <p className="muted perm-note">Sección oculta por permisos de tu rol.</p>
          </article>
        )}
      </section>

      {(isLoading || odLoading || hcLoading || imgLoading || trLoading) && (
        <div className="sr-only" aria-live="polite">Cargando información…</div>
      )}
    </div>
  );
}
