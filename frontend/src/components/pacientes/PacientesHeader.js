import { useNavigate } from 'react-router-dom';
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function PacientesHeader({
  valores = {},
  onBuscar,
  onClearSearch,
  total = 0,
  pagina = 1,
  totalPaginas = 1,
  cambiarPagina,
  loading = false,
}) {
  const navigate = useNavigate();

  return (
    <header className="pacientes-header">
      {/* TOP BAR */}
      <div className="top-bar">
        <h2>Pacientes</h2>
        <button onClick={() => navigate('/pacientes/nuevo')} className="btn-primary">
          + Nuevo paciente
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="search-wrapper">
        <div className={`search-input ${loading ? 'is-loading' : ''}`}>
          <FaSearch />
          <input
            type="text"
            name="q"
            placeholder="Buscar por nombre, apellido, DNI o teléfono…"
            value={valores.q || ''}
            onChange={onBuscar}
          />
          {/* limpiar */}
          {valores.q ? (
            <button type="button" className="clear-btn" aria-label="Limpiar búsqueda" onClick={onClearSearch}>
              ×
            </button>
          ) : null}
          {/* spinner */}
          {loading && <span className="input-spinner" aria-hidden="true" />}
        </div>
      </div>

      {/* RANGO FECHAS */}
      <form className="filters-panel rango-visitas" onChange={onBuscar}>
        <div className="field range">
          <label>Última visita</label>
          <input type="date" name="desdeUltimaVisita" defaultValue={valores.desdeUltimaVisita || ''} />
          <span>—</span>
          <input type="date" name="hastaUltimaVisita" defaultValue={valores.hastaUltimaVisita || ''} />
        </div>
      </form>

      {/* CONTADOR */}
      <p className="result-count">
        Resultados: <strong>{total}</strong>
      </p>

      {/* PAGINACIÓN */}
      {totalPaginas > 1 && (
        <nav className="paginacion">
          <button onClick={() => cambiarPagina(pagina - 1)} disabled={pagina === 1} aria-label="Página anterior">
            <FaChevronLeft />
          </button>
          <span>Pagina {pagina} de {totalPaginas}</span>
          <button onClick={() => cambiarPagina(pagina + 1)} disabled={pagina === totalPaginas} aria-label="Página siguiente">
            <FaChevronRight />
          </button>
        </nav>
      )}
    </header>
  );
}
