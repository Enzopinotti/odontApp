import { useBuscarPacientes } from "../../hooks/useBuscarPacientes";

export default function AutocompletePaciente({ control, name }) {
  const { busqueda, setBusqueda, sugerencias, setSugerencias } = useBuscarPacientes();

  const manejarSeleccion = (paciente) => {
    const nombreCompleto = `${paciente.nombre} ${paciente.apellido}`;
    setBusqueda(nombreCompleto);
    setSugerencias([]);
    console.log("Paciente seleccionado:", paciente);
  };

  return (
    <div className="form-group" >
      <input
        type="text"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        placeholder="Buscar por nombre o DNI"
        autoComplete="off"
        className="input-paciente"
        
      />
      {Array.isArray(sugerencias) && sugerencias.length > 0 && (
        <ul
        className="ul-sugerencias"
          
        >
          {sugerencias.map((paciente) => (
            <li
              key={paciente.id}
              onClick={() => manejarSeleccion(paciente)}
              className="li-sugerencias"
              
            >
              {paciente.nombre} {paciente.apellido} — {paciente.dni}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
