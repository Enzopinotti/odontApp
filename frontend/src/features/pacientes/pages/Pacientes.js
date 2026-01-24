// frontend/src/features/pacientes/pages/Pacientes.js
import { useState, useMemo, useContext, useCallback, useRef, useEffect } from 'react';
import { usePacientes } from '../hooks/usePacientes';
import { useEstadosPacientes } from '../hooks/useEstadosPacientes';
import PacientesHeader from '../components/PacientesHeader';
import PatientsKanban from '../components/PatientsKanban';
import usePacienteMutations from '../hooks/usePacienteMutations';
import useToast from '../../../hooks/useToast';
import Lottie from 'lottie-react';

import loadingAnim from '../../../assets/video/pacientes-loading.json';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { FaEye, FaEdit, FaTrash, FaList, FaColumns, FaFilter, FaCalendarAlt, FaIdCard, FaTimes } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import { AuthCtx } from '../../../context/AuthProvider';
import ModernSelect from '../../../components/ModernSelect';


import useDebouncedValue from '../../../hooks/useDebouncedValue';

export default function Pacientes() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { hasPermiso } = useContext(AuthCtx);
  const { updatePaciente } = usePacienteMutations();
  const filterRef = useRef(null);


  /* --- Vistas y Filtros --- */
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'
  const [showFilters, setShowFilters] = useState(false);
  const [params, setParams] = useState({
    page: 1,
    perPage: 20,
    q: '',
    dni: '',
    nombre: '',
    apellido: '',
    estadoId: '',
    telefono: '',
    obraSocial: '',
    direccion: '',
    desdeUltimaVisita: '',
    hastaUltimaVisita: '',
    desdeRegistro: '',
    hastaRegistro: '',
  });


  const { data: estadosData } = useEstadosPacientes();
  const estados = useMemo(() => estadosData?.data || [], [estadosData]);
  const optionsEstados = useMemo(() => estados.map(e => ({ id: e.id, label: e.nombre })), [estados]);


  const debouncedQ = useDebouncedValue(params.q, 350);
  const queryParams = useMemo(() => ({ ...params, q: debouncedQ }), [params, debouncedQ]);

  const { data, isLoading, isFetching } = usePacientes(queryParams);
  const pacientes = useMemo(() => data?.data || [], [data]);
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / params.perPage);

  useEffect(() => {
    const handleOutside = (e) => { if (showFilters && filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false); };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showFilters]);

  /* --- Event Handlers --- */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setParams(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const clearFilters = () => {
    setParams({
      page: 1, perPage: 20, q: '', dni: '', nombre: '', apellido: '', estadoId: '',
      telefono: '', obraSocial: '', direccion: '', desdeUltimaVisita: '', hastaUltimaVisita: '',
      desdeRegistro: '', hastaRegistro: '',
    });
  };

  const handleDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;

    const newEstadoId = parseInt(destination.droppableId);
    const pacienteId = parseInt(draggableId);

    try {
      await updatePaciente.mutateAsync({ id: pacienteId, data: { estadoId: newEstadoId } });
      showToast('Estado de paciente actualizado', 'success');
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  }, [updatePaciente, showToast]);


  const goDetalle = useCallback((p) => navigate(`/pacientes/${p.id}`), [navigate]);

  /* --- React Table Columns --- */
  const columns = useMemo(() => [
    {
      header: 'Paciente',
      accessorKey: 'nombreCompleto',
      cell: ({ row }) => {
        const { id, nombre, apellido } = row.original;
        return (
          <div className="paciente-cell-modern">
            <div className="p-info">
              <strong>{apellido}, {nombre}</strong>
              <small className="dni-tag">DNI: {row.original.dni}</small>
            </div>
            <div className="p-status">
              <ModernSelect
                options={optionsEstados}
                value={row.original.statusId || row.original.estadoId || ''}
                onChange={(val) => handleDragEnd({
                  destination: { droppableId: val.toString() },
                  source: { droppableId: row.original.estadoId?.toString() },
                  draggableId: id.toString()
                })}
                className="select-table-mini"
              />
            </div>
          </div>
        );
      }
    },

    { accessorKey: 'dni', header: 'DNI' },
    {
      header: 'Teléfono',
      cell: ({ row }) => row.original.Contacto?.telefonoMovil || '—'
    },
    {
      header: 'Últ. Visita',
      accessorKey: 'ultimaVisita',
      cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString() : '—'
    },
    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => (
        <div className="acciones-tabla">
          <button onClick={() => goDetalle(row.original)} title="Ver"><FaEye /></button>
          <button onClick={() => navigate(`/pacientes/${row.original.id}/editar`)} title="Editar"><FaEdit /></button>
          {hasPermiso('pacientes', 'eliminar') && <button className="danger" title="Eliminar"><FaTrash /></button>}
        </div>
      )
    }
  ], [navigate, hasPermiso, goDetalle, optionsEstados, handleDragEnd]);




  const table = useReactTable({ data: pacientes, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="pacientes-page">
      <div className="view-selector">
        <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')} aria-label="Vista de lista"><FaList /> Lista</button>
        <button className={viewMode === 'kanban' ? 'active' : ''} onClick={() => setViewMode('kanban')} aria-label="Vista Kanban"><FaColumns /> Kanban</button>

        <div className="filter-dropdown-container" ref={filterRef}>
          <button
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            aria-label="Abrir filtros avanzados"
          >
            <FaFilter /> {showFilters ? 'Cerrar Filtros' : 'Filtros Avanzados'}
          </button>

          {showFilters && (
            <div className="filters-popover">
              <header className="popover-head">
                <FaFilter />
                <div>
                  <h4>Búsqueda Avanzada</h4>
                  <p>Segmentá tu lista de pacientes</p>
                </div>
                <button className="close-mini" onClick={() => setShowFilters(false)} aria-label="Cerrar"><FaTimes /></button>
              </header>

              <div className="popover-body">
                <div className="filters-section">
                  <span className="section-label"><FaIdCard /> Identidad y Contacto</span>
                  <div className="filters-grid">
                    <div className="filter-group">
                      <label htmlFor="f-dni">DNI / Identificación</label>
                      <input id="f-dni" type="text" name="dni" value={params.dni} onChange={handleFilterChange} placeholder="N° de documento" />
                    </div>
                    <div className="filter-group">
                      <label htmlFor="f-os">Obra Social / Prepaga</label>
                      <input id="f-os" type="text" name="obraSocial" value={params.obraSocial} onChange={handleFilterChange} placeholder="Nombre de entidad" />
                    </div>
                    <div className="filter-group">
                      <label htmlFor="f-tel">Canal Teléfonico</label>
                      <input id="f-tel" type="text" name="telefono" value={params.telefono} onChange={handleFilterChange} placeholder="Ej: 11 2345..." />
                    </div>
                    <div className="filter-group">
                      <label htmlFor="f-dir">Ubicación / Dirección</label>
                      <input id="f-dir" type="text" name="direccion" value={params.direccion} onChange={handleFilterChange} placeholder="Calle, ciudad o CP" />
                    </div>
                  </div>
                </div>

                <div className="filters-group-row">
                  <div className="filters-section">
                    <span className="section-label"><FaCalendarAlt /> Última Visita</span>
                    <div className="filters-grid compact">
                      <div className="filter-group">
                        <label htmlFor="f-uvd">Desde</label>
                        <input id="f-uvd" type="date" name="desdeUltimaVisita" value={params.desdeUltimaVisita} onChange={handleFilterChange} />
                      </div>
                      <div className="filter-group">
                        <label htmlFor="f-uvh">Hasta</label>
                        <input id="f-uvh" type="date" name="hastaUltimaVisita" value={params.hastaUltimaVisita} onChange={handleFilterChange} />
                      </div>
                    </div>
                  </div>

                  <div className="filters-section">
                    <span className="section-label"><FaCalendarAlt /> Fecha de Registro</span>
                    <div className="filters-grid compact">
                      <div className="filter-group">
                        <label htmlFor="f-rd">Desde</label>
                        <input id="f-rd" type="date" name="desdeRegistro" value={params.desdeRegistro} onChange={handleFilterChange} />
                      </div>
                      <div className="filter-group">
                        <label htmlFor="f-rh">Hasta</label>
                        <input id="f-rh" type="date" name="hastaRegistro" value={params.hastaRegistro} onChange={handleFilterChange} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="popover-foot">
                <button className="btn-clear" onClick={clearFilters}>Limpiar Filtros</button>
                <button className="btn-apply" onClick={() => setShowFilters(false)}>Aplicar Búsqueda</button>
              </footer>
            </div>
          )}
        </div>
      </div>

      <PacientesHeader
        valores={params}
        onBuscar={handleFilterChange}
        onClearSearch={() => setParams(prev => ({ ...prev, q: '', page: 1 }))}
        total={total}
        pagina={params.page}
        totalPaginas={totalPages}
        cambiarPagina={(n) => setParams(prev => ({ ...prev, page: n }))}
        loading={isFetching}
      />

      <section className="pacientes-content">

        {isLoading ? (
          <div className="pacientes-loader">
            <Lottie animationData={loadingAnim} loop autoplay style={{ width: 180 }} />
          </div>
        ) : viewMode === 'list' ? (
          <div className="pacientes-table-wrapper card">
            <table className="tabla-pacientes">
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>{hg.headers.map(h => <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>)}</tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id}>{row.getVisibleCells().map(c => <td key={c.id}>{flexRender(c.column.columnDef.cell, c.getContext())}</td>)}</tr>
                ))}
              </tbody>
            </table>

            {/* Vista Móvil: Tarjetas */}
            <div className="pacientes-mobile-cards">
              {pacientes.map(p => (
                <div key={p.id} className="paciente-card-mobile">
                  <div className="card-header-mobile">
                    <div className="patient-info-mobile">
                      <h3 className="patient-name">{p.apellido}, {p.nombre}</h3>
                      <div className="patient-dni">DNI {p.dni}</div>
                    </div>
                    <span
                      className="status-badge-mobile"
                      style={{
                        background: p.Estado?.color ? `${p.Estado.color}15` : '#f1f5f9',
                        color: p.Estado?.color || '#64748b',
                        border: `1px solid ${p.Estado?.color}30` || '#e2e8f0'
                      }}
                    >
                      {p.Estado?.nombre || 'Sin estado'}
                    </span>
                  </div>

                  <div className="card-body-mobile">
                    {p.Contacto?.email && (
                      <div className="info-item">
                        <span className="label">Email</span>
                        <span className="value">{p.Contacto.email}</span>
                      </div>
                    )}
                    {p.Contacto?.telefonoMovil && (
                      <div className="info-item">
                        <span className="label">Teléfono</span>
                        <span className="value">{p.Contacto.telefonoMovil}</span>
                      </div>
                    )}
                    {p.obraSocial && (
                      <div className="info-item">
                        <span className="label">Obra Social</span>
                        <span className="value">{p.obraSocial}</span>
                      </div>
                    )}
                    {p.ultimaVisita && (
                      <div className="info-item">
                        <span className="label">Última Visita</span>
                        <span className="value">{new Date(p.ultimaVisita).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-footer-mobile">
                    <button className="btn-view" onClick={() => goDetalle(p.id)}>
                      <FaEye /> Ver
                    </button>
                    <button className="btn-edit" onClick={() => navigate(`/pacientes/${p.id}`)}>
                      <FaEdit /> Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {pacientes.length === 0 && <p className="empty-msg">No se encontraron pacientes.</p>}
          </div>
        ) : (
          <PatientsKanban
            columns={estados}
            pacientes={pacientes}
            onDragEnd={handleDragEnd}
            onCardClick={goDetalle}
            loading={isFetching}
          />
        )}
      </section>
    </div>
  );
}
