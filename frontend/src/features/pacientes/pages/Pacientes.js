import { useState, useEffect, useMemo, useContext } from 'react';
import { usePacientes } from '../hooks/usePacientes';
import PacientesHeader from '../components/PacientesHeader';
import useToast from '../../../hooks/useToast';
import { handleApiError } from '../../../utils/handleApiError';
import Lottie from 'lottie-react';
import loadingAnim from '../../../assets/video/pacientes-loading.json';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { AuthCtx } from '../../../context/AuthProvider';
import useDebouncedValue from '../../../hooks/useDebouncedValue';
import usePrefetchPaciente from '../hooks/usePrefetchPaciente';

export default function Pacientes() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { hasPermiso } = useContext(AuthCtx);
  const prefetchPaciente = usePrefetchPaciente();

  /* --- filtros y params (controlados) --- */
  const [params, setParams] = useState({
    page: 1,
    perPage: 20,
    q: '',
    telefono: '',
    turnoActual: '',
    desdeUltimaVisita: '',
    hastaUltimaVisita: '',
  });

  /* --- debounce sólo sobre q (y espejo telefono) --- */
  const debouncedQ = useDebouncedValue(params.q, 350);

  /* --- params efectivos para consulta --- */
  const queryParams = useMemo(
    () => ({
      ...params,
      q: debouncedQ,
      telefono: debouncedQ,
    }),
    [params, debouncedQ]
  );

  const { data, isLoading, isError, error, isFetching } = usePacientes(queryParams);

  // ✅ Evita cambiar referencia [] en cada render
  const pacientes = useMemo(() => data?.data || [], [data]);
  const total      = data?.total || 0;
  const totalPages = Math.ceil(total / params.perPage);

  /* --- handlers de filtros --- */
  const handleSearch = (e) => {
    const { name, value } = e.target;
    if (name === 'q') {
      setParams(prev => ({ ...prev, q: value, telefono: value, page: 1 }));
    } else {
      setParams(prev => ({ ...prev, [name]: value, page: 1 }));
    }
  };

  const handleClearSearch = () => {
    setParams(prev => ({ ...prev, q: '', telefono: '', page: 1 }));
  };

  const cambiarPagina = (n) => setParams(prev => ({ ...prev, page: n }));

  /* --- toast de error fuera del render --- */
  useEffect(() => {
    if (isError && error) {
      setTimeout(() => handleApiError(error, showToast), 0);
    }
  }, [isError, error, showToast]);

  /* --- Prefetch proactivo: primeros 3 visibles --- */
  useEffect(() => {
    if (!pacientes.length) return;
    pacientes.slice(0, 3).forEach(p => prefetchPaciente(p.id));
  }, [pacientes, prefetchPaciente]);

  /* --- Columnas --- */
  const columns = useMemo(
    () => [
      {
        accessorKey: 'nombreCompleto',
        header: 'Paciente',
        cell: ({ row }) => {
          const { nombre, apellido } = row.original;
          return <strong>{`${apellido}, ${nombre}`}</strong>;
        },
      },
      { accessorKey: 'dni', header: 'DNI' },
      {
        accessorKey: 'telefono',
        header: 'Teléfono',
        cell: ({ row }) => {
          const c = row.original.Contacto;
          return c?.telefonoMovil || c?.telefonoFijo || '—';
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Registro',
        cell: ({ getValue }) => new Date(getValue()).toLocaleDateString(),
      },
      {
        accessorKey: 'ultimaVisita',
        header: 'Últ. visita',
        cell: ({ getValue }) =>
          getValue() ? new Date(getValue()).toLocaleDateString() : '—',
      },
      {
        id: 'acciones',
        header: 'Acciones',
        meta: { className: 'acciones-cell' },
        cell: ({ row }) => {
          const p = row.original;
          const goVer = () =>
            navigate(`/pacientes/${p.id}`, {
              state: { pacientePreview: { id: p.id, nombre: p.nombre, apellido: p.apellido } },
            });
          const goEditar = () =>
            navigate(`/pacientes/${p.id}/editar`, {
              state: { pacientePreview: { id: p.id, nombre: p.nombre, apellido: p.apellido } },
            });

          return (
            <div className="acciones-tabla">
              {hasPermiso('pacientes', 'listar') && (
                <button
                  title="Ver"
                  onClick={goVer}
                  onMouseEnter={() => prefetchPaciente(p.id)}
                  onFocus={() => prefetchPaciente(p.id)}
                >
                  <FaEye />
                </button>
              )}
              {hasPermiso('pacientes', 'editar') && (
                <button
                  title="Editar"
                  onClick={goEditar}
                  onMouseEnter={() => prefetchPaciente(p.id)}
                  onFocus={() => prefetchPaciente(p.id)}
                >
                  <FaEdit />
                </button>
              )}
              {hasPermiso('pacientes', 'eliminar') && (
                <button title="Eliminar" className="danger">
                  <FaTrash />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [navigate, hasPermiso, prefetchPaciente]
  );

  const table = useReactTable({
    data: pacientes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="pacientes-page">
      <PacientesHeader
        valores={params}
        onBuscar={handleSearch}
        onClearSearch={handleClearSearch}
        total={total}
        pagina={params.page}
        totalPaginas={totalPages}
        cambiarPagina={cambiarPagina}
        loading={isFetching}
      />

      {/* Toggle de Turno Actual */}
      <div className="toggle-turno">
        <label>
          <input
            type="checkbox"
            name="turnoActual"
            checked={!!params.turnoActual}
            onChange={(e) =>
              setParams((prev) => ({
                ...prev,
                turnoActual: e.target.checked ? 'true' : '',
                page: 1,
              }))
            }
          />
        </label>
        <p>Solo Turno Actual</p>
      </div>

      <section className="pacientes-table-wrapper">
        {isLoading ? (
          <div className="pacientes-loader">
            <Lottie animationData={loadingAnim} loop autoplay style={{ width: 180 }} />
          </div>
        ) : isError ? (
          <p className="error-msg">Error al cargar pacientes</p>
        ) : pacientes.length === 0 ? (
          <p className="empty-msg">No hay pacientes registrados.</p>
        ) : (
          <div className="tabla-container">
            <table className="tabla-pacientes">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={header.column.columnDef.meta?.className || ''}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className || ''}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isFetching && !isLoading && <div className="fetching-overlay" />}
      </section>
    </div>
  );
}
