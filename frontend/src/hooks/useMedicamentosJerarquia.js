// src/hooks/useMedicamentosJerarquia.js
import { useState, useEffect } from "react";
import api from "../api/axios";

export function useMedicamentosJerarquia() {
  const [jerarquia, setJerarquia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/medicamentos/jerarquia");
        setJerarquia(data); // toda la jerarquía lista
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { jerarquia, loading, error };
}
