import { useState, useEffect } from "react";
import api from "../api/axios";
export function useBuscarPacientes() {
  const [busqueda, setBusqueda] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const delay = setTimeout(() => {
      const texto = busqueda.trim();

      if (texto.length < 1) {
        setSugerencias([]);
        return;
      }

      setLoading(true);

      api
        .get("/pacientes", {
          params: { q: texto, perPage: 10 },
          signal: controller.signal,
        })
        .then((res) => {
          setSugerencias(res.data?.data?.data || []);
        })
        .catch((err) => {
          if (err.name === "CanceledError") return;
          console.error("❌ error al buscar pacientes", err);
          setSugerencias([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }, 300);

    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [busqueda]);

  return {
    busqueda,
    setBusqueda,
    sugerencias,
    setSugerencias,
    loading,
  };
}
