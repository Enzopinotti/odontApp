import RecetaForm from "../components/recetas/RecetaForm";
import RecetaPreview from "../components/recetas/RecetaPreview";
export default function Receta() {
  return (
    <div className="receta-page">
      <div>
        <div className="recetas__titlebar">
          <h2 className="recetas__title">Nueva Receta</h2>
        </div>
        <RecetaForm />
      </div>

      <RecetaPreview />
    </div>
  );
}
