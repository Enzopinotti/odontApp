import RecetaForm from "../components/recetas/RecetaForm";
import RecetaPreview from "../components/recetas/RecetaPreview";
export default function Receta() {
  return (
    <div className="receta-page">
        <RecetaForm />
        <RecetaPreview />
    </div>

  );
}