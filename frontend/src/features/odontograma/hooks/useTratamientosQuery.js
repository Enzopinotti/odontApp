// src/features/odontograma/hooks/useTratamientosQuery.js
import { useQuery } from '@tanstack/react-query';
import { getTratamientos } from '../../../api/clinica';

export default function useTratamientosQuery() {
  return useQuery({
    queryKey: ['tratamientos'],
    queryFn: async () => {
      const res = await getTratamientos();
      return res; // Retornamos el objeto completo { success, data, message }
    },

    staleTime: 1000 * 60 * 10,
  });
}
