import { useNavigate } from 'react-router-dom';

export default function PacientesHeader() {
  const navigate = useNavigate();

  return (
    <div className="pacientes-header">
      <h2>Pacientes</h2>
      <button onClick={() => navigate('/pacientes/nuevo')}>
        + Nuevo paciente
      </button>
    </div>
  );
}
