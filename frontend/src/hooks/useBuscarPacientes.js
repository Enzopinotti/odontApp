import { useEffect, useState } from "react";

//harcodeo
const USAR_API = false;
const mockPacientes = [
  { id: 1, nombre: "Juan", apellido: "Pérez", dni: "30111222", edad: 30 , sexo: "Masculino", email:"juan@gmail.com"},
  { id: 2, nombre: "María", apellido: "Gómez", dni: "28999111", edad: 25, sexo: "Femenino", email:"maria@gmail.com" },
  { id: 3, nombre: "Pedro", apellido: "Martínez", dni: "32000222", edad: 40, sexo: "Masculino",email:"pedro@gmail.com" },
  { id: 4, nombre: "Laura", apellido: "Fernández", dni: "27000333", edad: 28, sexo: "Femenino",email:"laura@gmail.com" },
  { id: 5, nombre: "Carlos", apellido: "Sánchez", dni: "25000444", edad: 35, sexo: "Masculino",email:"carlos@gmail.com" },
];

const API_BASE = process.env.REACT_APP_API_BASE;


export const useBuscarPacientes = () => {
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  
  useEffect(() => {


    if (busqueda.trim() === "") {
      setSugerencias([]);
      return;
    }

    const delay = setTimeout(() => {
        if (USAR_API){
      fetch(
        `${API_BASE}/pacientes/buscar?query=${encodeURIComponent(busqueda)}`
      )
        .then((res) => res.json())
        .then((data) => setSugerencias(data))
        .catch((err) => console.error("error al buscar pacientes", err));
  }else{
    //harcodeado
     const filtro = mockPacientes.filter((p) => {
          const nombreCompleto = `${p.nombre} ${p.apellido}`.toLowerCase();
          return (
            nombreCompleto.includes(busqueda.toLowerCase()) ||
            p.dni.includes(busqueda)
          );
        });
        setSugerencias(filtro);
  }}, 300);
    return () => clearTimeout(delay);
  }, [busqueda]);

  return {
    busqueda,
    setBusqueda,
    sugerencias,
    setSugerencias,
  };
};
