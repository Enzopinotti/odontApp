import { usePacientes } from '../../hooks/usePacientes';
import PacientesHeader from '../../components/pacientes/PacientesHeader';
import PacienteItem from '../../components/pacientes/PacienteItem';

export default function Pacientes() {
  const { data, isLoading, isError } = usePacientes();

  if (isLoading) return <p>Cargando pacientes…</p>;
  if (isError) return <p>Error al cargar pacientes.</p>;

  const pacientes = data?.data || [];

  return (
    <div className="pacientes-page">
      <PacientesHeader />
      <div className="pacientes-lista">
        {pacientes.length === 0 ? (
          <p>No hay pacientes registrados.</p>
        ) : (
          pacientes.map((pac) => (
            <PacienteItem key={pac.id} paciente={pac} />
          ))
        )}
      </div>
    </div>
  );
}
