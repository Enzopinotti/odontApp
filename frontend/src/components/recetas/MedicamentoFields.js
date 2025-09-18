import { useWatch } from "react-hook-form";
import { FaTrashAlt } from "react-icons/fa";



export default function MedicamentoFields({ index, register,control, onRemove,jerarquia }) {
  const seleccion = useWatch({control, name: `medicamentos.${index}`,}) || {
    nombreGenerico: "",
    formaFarmaceutica: "",
    dosis: "",
    presentacion: "",
  };
  // 1. Nombres genéricos
  const nombres = jerarquia.map((m) => m.nombreGenerico);

  // 2. Formas disponibles según nombre
  const formas =
    jerarquia.find((m) => m.nombreGenerico === seleccion.nombreGenerico)?.formas || [];

  // 3. Dosis disponibles según forma
  const dosis =
    formas.find((f) => f.formaFarmaceutica === seleccion.formaFarmaceutica)?.dosis || [];

  // 4. Presentaciones según dosis
  const presentaciones =
    dosis.find((d) => d.valor === seleccion.dosis)?.presentaciones || [];

  
  return (
    <div className="recetas-item">
      <div className=" recetas-item__row recetas-item__row--header">
        <div className="recetas-item__field">
          <label className="recetas-item__label">Nombre genérico </label>
          <select
            {...register(`medicamentos.${index}.nombreGenerico`,)}
            className="recetas-item__select u-w-100"
          >
            <option value="">Seleccione un medicamento</option>
            {nombres.map((nombre, i) => (
              <option key={i} value={nombre}>
                {nombre}{" "}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="icon-btn icon-btn--danger"
          aria-label="Quitar"
        >
          <FaTrashAlt />
        </button>
      </div>

      <div className="recetas-item__row">
        <div className="recetas-item__field">
          <label className="recetas-item__label">Forma Farmacéutica</label>
          <select
            {...register(`medicamentos.${index}.formaFarmaceutica`)}
            disabled={!seleccion?.nombreGenerico}
            className="recetas-item__select recetas-item__select--md"
          >
            <option value="">Seleccione forma</option>
            {formas.map((forma, i) => (
              <option key={i} value={forma.formaFarmaceutica}>
                {forma.formaFarmaceutica}
              </option>
            ))}
          </select>
        </div>

        <div className="recetas-item__field">
          <label className="recetas-item__label">Dosis</label>
          <select
            {...register(`medicamentos.${index}.dosis`)}
            disabled={!seleccion?.formaFarmaceutica}
            className="recetas-item__select recetas-item__select--sm"
          >
            <option value="">Seleccione dosis</option>
            {dosis.map((c, i) => (
              <option key={i} value={c.valor}>
                {c.valor}
              </option>
            ))}
          </select>
        </div>
        <div className="recetas-item__field">
          <label className="recetas-item__label">Presentación</label>
          <select
            {...register(`medicamentos.${index}.presentacion`)}
            disabled={!seleccion?.dosis}
            className="recetas-item__select recetas-item__select--md"
          >
            <option value="">Seleccione presentación</option>
            {presentaciones.map((p, i) => (
              <option key={i} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
