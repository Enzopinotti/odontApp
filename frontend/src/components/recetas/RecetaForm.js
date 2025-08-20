import { useForm, useFieldArray } from "react-hook-form";
import AutocompletePaciente from "./AutocompletePaciente";
import { useState } from "react";
import MedicamentoFields from "./MedicamentoFields";
export default function RecetaForm() {
  const { register, control, handleSubmit } = useForm({
    defaultValues: {
      paciente: "",
      diagnostico: "",
      indicaciones: "",
      medicamentos: [{}],
    },
  });
  const [medicamentoSeleccionado, setMedicamentoSeleccionado] = useState(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicamentos",
  });

  const onSubmit = (data) => {
    console.log("Receta enviada:", data);
  };
  const handleMedicamentoChange = (data) => {
    console.log("Medicamento seleccionado:", data);
    setMedicamentoSeleccionado(data);
  };
  return (
    <section className="recetas">
      
      <form onSubmit={handleSubmit(onSubmit)} className="recetas__form">
        <div className="recetas__group recetas__group--full">
          <label className="recetas__label">Paciente</label>
          <AutocompletePaciente name="paciente" control={control} />
        </div>

        <div className="recetas__group recetas__group--full">
          <label className="recetas__label" htmlFor="diagnostico">
            Diagnóstico
          </label>
          <input
            className="recetas__input"
            placeholder="Ingrese un diagnóstico"
            id="diagnostico"
            {...register("diagnostico", { required: true })}
          />
        </div>

        <h3 className="recetas__subtitle recetas__group recetas__group--full">
          Medicamentos
        </h3>

        <div className="recetas__list recetas__group recetas__group--full">
          {fields.map((field, index) => (
            <MedicamentoFields
              key={field.id}
              index={index}
              register={register}
              onRemove={() => remove(index)}
              onChange={handleMedicamentoChange}
            />
          ))}
        </div>

        <div className="recetas__actions u-gap-sm recetas__group recetas__group--full">
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => append({})}
          >
            + Agregar Medicamento
          </button>
        </div>

        <div className="recetas__group recetas__group--full">
          <label className="recetas__label" htmlFor="indicaciones">
            Indicaciones
          </label>
          <textarea
            id="indicaciones"
            {...register("indicaciones", { required: true })}
            className="recetas__textarea"
          />
        </div>

        <div className="recetas__actions recetas__group recetas__group--full">
          <button type="submit" className="btn btn--primary">
            Imprimir receta
          </button>
          <button type="submit" className="btn btn--secondary">
            Enviar receta
          </button>
        </div>
      </form>
    </section>
  );
}
