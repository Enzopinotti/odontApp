import { useForm, useFieldArray, Controller, useWatch  } from "react-hook-form";
import AutocompletePaciente from "./AutocompletePaciente";
import { useEffect } from "react";
import MedicamentoFields from "./MedicamentoFields";
import useModal from '../../hooks/useModal'
import { useMedicamentosJerarquia } from "../../hooks/useMedicamentosJerarquia";

export default function RecetaForm({ onChange }) {
 const { register, control, handleSubmit } = useForm({
   defaultValues: {
     paciente: "",
     diagnostico: "",
     indicaciones: "",
     medicamentos: [{}],
   },
 });
  const receta = useWatch({control});
 const{showModal}=useModal();
    const { jerarquia, loading } = useMedicamentosJerarquia();

const handleEnviar = () => {
    showModal({
      type: 'enviarReceta',
      title: 'Enviar Receta',
      paciente: receta.paciente,
      onSend: (tipo) => {
        console.log("Enviar receta por:", tipo);
      },
    });
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicamentos",
  });

  const onSubmit = (data) => {
    console.log("Receta enviada:", data);
  };
  
  useEffect(() => {
    if (onChange) onChange(receta);
  }, [receta, onChange]);

  return (
    <section className="recetas">
      <form onSubmit={handleSubmit(onSubmit)} className="recetas__form">
        <div className="recetas__group recetas__group--full">
          <label className="recetas__label">Paciente</label>
          <Controller
            name="paciente"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (  
          <AutocompletePaciente value={field.value} onChange={field.onChange} />
            )}
          />

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
              control={control}
              onRemove={() => remove(index)}
              jerarquia={jerarquia}             
              loading={loading}
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
          <button type="submit" className="btn btn--secondary" onClick={handleEnviar}>
            Enviar receta
          </button>
        </div>
      </form>
    </section>
  );
}
