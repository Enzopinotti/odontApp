import RecetaForm from "../components/recetas/RecetaForm";
import RecetaPreview from "../components/recetas/RecetaPreview";
import { useState } from "react";
export default function Receta() {
  const [receta, setReceta] = useState({});
  return (
    <div className="receta-page">
      <div>
        <div className="recetas__titlebar">
          <h2 className="recetas__title">Nueva Receta</h2>
        </div>
        <RecetaForm onChange={setReceta}/>
      </div>
      <div className="receta-page__sticky">
        <div className="recetas__titlebar">
          <h2 className="recetas__title">Vista previa</h2>
        </div >
         <RecetaPreview data={receta}/>
      </div>
     
    </div>
  );
}
