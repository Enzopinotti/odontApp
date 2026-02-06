
import { calcularEdad } from "../../utils/calcularEdad";
import { useMiOdontologo } from "../../hooks/useOdontologos";
export default function RecetaPreview({ data: receta }) {
  const edad = receta?.paciente ? calcularEdad(receta?.paciente.fechaNacimiento) : null;
  const{odontologo}=useMiOdontologo()
  return (
    <aside className="receta-preview">
      <div className="receta-preview__content">
        <header className="receta-preview__header">
          <h4>Dr. {odontologo?.Usuario.nombre} {odontologo?.Usuario.apellido}</h4>
          <h4>{odontologo?.Especialidads.map((e) => e.nombre).join(", ")}</h4>
          <h4>{odontologo?.matricula}</h4>
        </header>
        <section className="receta-preview__info">
          <div className="receta-preview__paciente info-colum">
            <p>
              <strong>Paciente:</strong> {receta?.paciente?.nombre}{" "}
              {receta?.paciente?.apellido}{" "}
            </p>
            <p>
              <strong> Dni:</strong> {receta?.paciente?.dni}
            </p>
          </div>
          <div className="receta-preview__extra info-colum">
            <p>
              <strong>Edad:</strong> {edad}{" "}
            </p>
            <p>
              <strong>Sexo:</strong> {receta?.paciente?.sexo}{" "}
            </p>
          </div>
          <div className="receta-preview__fecha info-colum ">
            <p>
              <strong>Fecha:</strong> {new Date().toLocaleDateString("es-AR")}
            </p>
          </div>
        </section>
        <section className="receta-preview__body">
          <p className="receta-preview__title">Rp:</p>
          <div className="receta-preview__medicamento">
            {receta?.medicamentos?.map((med, i) => (
              <div key={i} className="receta-preview__medicamento-item">
                <p>
                  {med?.nombreGenerico || ""}{" "}
                  {med?.dosis ? ` ${med.dosis}` : ""}{" "}
                  {med?.formaFarmaceutica ? ` ${med.formaFarmaceutica}` : ""}{" "}
                  {med?.presentacion ? ` ${med.presentacion}` : ""}
                </p>
              </div>
            ))}
          </div>
          <div className="receta-preview__diagnostico">
            <p>
              <strong>Diagnóstico:</strong> {receta?.diagnostico || ""}
            </p>
          </div>
          <div className="receta-preview__indicaciones">
            <p>
              <strong>Indicaciones:</strong> {receta?.indicaciones || ""}
            </p>
          </div>
          <div className="receta-preview__firma">
            <img
              src={odontologo?.firmaDigital} 
              alt="Firma del odontólogo"
              className="receta-preview__firma-img"
            />
            <p className="receta-preview__doctor">Dr. {odontologo?.Usuario.nombre} {odontologo?.Usuario.apellido}  </p>
            <p className="receta-preview__matricula"> {odontologo?.matricula} </p>
            <p className="receta-preview__stamp">FIRMA Y SELLO</p>
          </div>
        </section>
        <footer className="receta-preview__footer">
          <p>Consultorio Odontológico</p>
          <p>Dirección: Calle 12 1234, La Plata</p>
        </footer> 
      </div>
    </aside>
  );
}
