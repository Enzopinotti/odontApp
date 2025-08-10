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
    <div className="receta-form">
      <h2>Nueva Receta</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="form-container">
        <label>Paciente</label>
        <AutocompletePaciente name="paciente" control={control} />
        <div className="form-group">
          <label>Diagnóstico</label>
          <input {...register("diagnostico", { required: true })} />
        </div>

        <h3>Medicamentos</h3>

        {fields.map((field, index) => (
          <MedicamentoFields
            key={field.id}
            index={index}
            register={register}
            onRemove={() => remove(index)}
            onChange={handleMedicamentoChange}
          />
        ))}
        <div>
          <button
            type="button"
            className="more-button"
            onClick={() => append({})}
          >
            + Agregar Medicamento
          </button>
        </div>
        <div className="form-input">
          <label>Indicaciones</label>
          <textarea {...register("indicaciones", { required: true })} />
        </div>
        <div className="buttons-row">
          <button type="submit" className="save-button">
            Imprimir receta
          </button>
          <button type="submit" className="send-button">
            Enviar receta
          </button>
        </div>
      </form>
    </div>
  );
}
