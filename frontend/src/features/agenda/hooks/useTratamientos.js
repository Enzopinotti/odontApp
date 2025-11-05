// src/features/agenda/hooks/useTratamientos.js
import { useQuery } from '@tanstack/react-query';
import * as agendaApi from '../../../api/agenda';

export function useTratamientos() {
  return useQuery({
    queryKey: ['tratamientos'],
    queryFn: async () => {
      const res = await agendaApi.getTratamientos();
      // El backend devuelve { success, message, data }
      return res.data?.data || res.data || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
    retry: false,
  });
}

export function useOdontologosPorEspecialidad(especialidad) {
  return useQuery({
    queryKey: ['odontologos', especialidad],
    queryFn: async () => {
      const res = await agendaApi.getOdontologosPorEspecialidad(especialidad);
      // El backend devuelve { success, message, data }
      return res.data?.data || res.data || [];
    },
    enabled: true, // Siempre habilitado, si hay especialidad filtra, si no muestra todos
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

