import React from "react";
import { useState } from "react";
import { FaTrashAlt } from "react-icons/fa";

//harcodeado para el ejemplo
const medicamentos = [
  {
    nombre_generico: "Ibuprofeno",
    forma_farmaceutica: "comprimidos",
    concentracion: "400 mg",
    presentacion: "blíster x 10",
  },
  {
    nombre_generico: "Ibuprofeno",
    forma_farmaceutica: "comprimidos",
    concentracion: "600 mg",
    presentacion: "blíster x 10",
  },
  {
    nombre_generico: "Ibuprofeno",
    forma_farmaceutica: "solución oral",
    concentracion: "100 mg/5 mL",
    presentacion: "frasco x 100 ml",
  },
  {
    nombre_generico: "Amoxicilina",
    forma_farmaceutica: "cápsulas",
    concentracion: "500 mg",
    presentacion: "blíster x 12",
  },
  {
    nombre_generico: "Amoxicilina",
    forma_farmaceutica: "suspensión",
    concentracion: "250 mg/5 mL",
    presentacion: "frasco x 60 ml",
  },
];

export default function MedicamentoFields({ index, onRemove, onChange }) {
  const [seleccion, setSeleccion] = useState({
    nombreGenerico: "",
    formaFarmaceutica: "",
    dosis: "",
    presentacion: "",
  });
  //harcodeado
  // Lista de nombres genéricos únicos (Ibuprofeno, Amoxicilina)
  const nombresUnicos = [
    ...new Set(medicamentos.map((m) => m.nombre_generico)),
  ];

  //harcodeado
  const formasFarmaceuticas = medicamentos
    .filter((m) => m.nombre_generico === seleccion.nombreGenerico)
    .map((m) => m.forma_farmaceutica);
  const formasUnicas = [...new Set(formasFarmaceuticas)];

  //harcodeado
  const dosis = medicamentos
    .filter(
      (m) =>
        m.nombre_generico === seleccion.nombreGenerico &&
        m.forma_farmaceutica === seleccion.formaFarmaceutica
    )
    .map((m) => m.concentracion);
  const dosisUnicas = [...new Set(dosis)];

  //harcodeado
  const presentaciones = medicamentos
    .filter(
      (m) =>
        m.nombre_generico === seleccion.nombreGenerico &&
        m.forma_farmaceutica === seleccion.formaFarmaceutica &&
        m.concentracion === seleccion.dosis
    )
    .map((m) => m.presentacion);
  const presentacionesUnicas = [...new Set(presentaciones)];

  const handleChange = (field, value) => {
    const nuevaSeleccion = {
      ...seleccion,
      [field]: value,
      ...(field === "nombreGenerico" && {
        formaFarmaceutica: "",
        dosis: "",
        presentacion: "",
      }),
      ...(field === "formaFarmaceutica" && { dosis: "", presentacion: "" }),
      ...(field === "dosis" && { presentacion: "" }),
    };
    setSeleccion(nuevaSeleccion);
    onChange(nuevaSeleccion);
  };
  return (
    <div className="recetas-item">
      <div className=" recetas-item__row recetas-item__row--header">
        <div className="recetas-item__field">
          <label className="recetas-item__label">Nombre genérico </label>
          <select
            value={seleccion.nombreGenerico}
            onChange={(e) => handleChange("nombreGenerico", e.target.value)}
            className="recetas-item__select u-w-100"
          >
            <option value="">Seleccione un medicamento</option>
            {nombresUnicos.map((nombre, i) => (
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
            value={seleccion.formaFarmaceutica}
            onChange={(e) => handleChange("formaFarmaceutica", e.target.value)}
            disabled={!seleccion.nombreGenerico}
            className="recetas-item__select recetas-item__select--md"
          >
            <option value="">Seleccione forma</option>
            {formasUnicas.map((forma, i) => (
              <option key={i} value={forma}>
                {forma}
              </option>
            ))}
          </select>
        </div>

        <div className="recetas-item__field">
          <label className="recetas-item__label">Dosis</label>
          <select
            value={seleccion.dosis}
            onChange={(e) => handleChange("dosis", e.target.value)}
            disabled={!seleccion.formaFarmaceutica}
            className="recetas-item__select recetas-item__select--sm"
          >
            <option value="">Seleccione dosis</option>
            {dosisUnicas.map((c, i) => (
              <option key={i} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="recetas-item__field">
          <label className="recetas-item__label">Presentación</label>
          <select
            value={seleccion.presentacion}
            onChange={(e) => handleChange("presentacion", e.target.value)}
            disabled={!seleccion.dosis}
            className="recetas-item__select recetas-item__select--md"
          >
            <option value="">Seleccione presentación</option>
            {presentacionesUnicas.map((p, i) => (
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
