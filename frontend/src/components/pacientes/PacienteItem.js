export default function PacienteItem({ paciente }) {
  const { nombre, apellido, dni, createdAt } = paciente;

  return (
    <div className="paciente-item">
      <div className="info">
        <strong>{apellido}, {nombre}</strong>
        <p>DNI: {dni}</p>
        <p>Registrado: {new Date(createdAt).toLocaleDateString()}</p>
      </div>
      <div className="acciones">
        <button>Ver</button>
        <button>Editar</button>
        <button className="danger">Eliminar</button>
      </div>
    </div>
  );
}
